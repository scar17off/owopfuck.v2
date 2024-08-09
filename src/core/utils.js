import config from "./config.js";
import { bots } from "./sharedState.js";
import { addOverlayImage } from "./overlay.js";

/**
 * Delays the execution of the next part of the code.
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise} A promise that resolves after the specified delay.
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Compares two color arrays for equality by comparing each R, G, B value.
 * @param {Array} color1 - The first color array [R, G, B].
 * @param {Array} color2 - The second color array [R, G, B].
 * @returns {boolean} True if the colors are equal, false otherwise.
 */
export function colorEqual(color1, color2) {
    return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2];
}

/**
 * Prompts the user to upload a file and returns its data as a base64-encoded string.
 * @param {string} [accept=*] - The file types that the file input should accept.
 * @returns {Promise<string>} A promise that resolves with the base64-encoded file data.
 */
export function upload(accept = "*") {
    return new Promise(resolve => {
        let file = document.createElement('input');
        file.type = "file";
        file.accept = accept;
        file.onchange = () => {
            let reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(file.files[0]);
        };
        file.click();
    });
}

let last = 0;
/**
 * Returns the index of the next bot.
 * @returns {number} The index of the next bot.
 */
export function getFree() {
    let usePlayer = config.getValue("Use Player");
    let b = bots.filter(i => i.net.isWebsocketConnected && i.net.isWorldConnected && (usePlayer || !i.clientOptions.localplayer));
    if(b.length === 0) return -1;
    if(last >= b.length) last = 0;
    let index = bots.indexOf(b[last]);
    last++;

    return index;
}

/**
 * Retrieves the first bot that is marked as a local player.
 * @returns {Object|null} The bot object configured as a local player, or null if none found.
 */
export function getLocalPlayer() {
    return bots.find(bot => bot.clientOptions.localplayer) || null;
}

/**
 * Places a pixel on the world canvas using a bot.
 * @param {number} x - The x-coordinate where the pixel will be placed.
 * @param {number} y - The y-coordinate where the pixel will be placed.
 * @param {Array} color - The RGB color array for the pixel.
 */
export async function setPixel(x, y, color, index) {
    const botIndex = index !== undefined ? index : getFree();
    if (botIndex === -1) return;

    const alwaysSleep = config.getValue("Always Sleep");
    const minimumQuota = config.getValue("Minimum Quota");
    const instantPlace = config.getValue("Instant Place");

    bots[botIndex].net.bucket.update();

    if (alwaysSleep || bots[botIndex].net.bucket.allowance <= minimumQuota) {
        if (instantPlace) {
            await bots[botIndex].net.bucket.waitUntilRestore();
            bots[botIndex].world.setPixel(x, y, color);
        } else {
            while (true) {
                await bots[botIndex].net.bucket.waitUntilRestore(minimumQuota);
                bots[botIndex].net.bucket.update();

                if (bots[botIndex].net.bucket.allowance >= minimumQuota) {
                    bots[botIndex].world.setPixel(x, y, color);
                    break;
                } else {
                    await bots[botIndex].net.bucket.waitUntilRestore(minimumQuota);
                }
            }
        }
    } else {
        bots[botIndex].world.setPixel(x, y, color);
    }
}

/**
 * Transforms a country or region name into a flag identifier.
 * @param {string} name - The name to transform.
 * @returns {string} The transformed flag name.
 */
export function getFlagName(name) {
    return name.trim().toLowerCase().replaceAll(' ', '-');
}

/**
 * Asynchronously fills an area with a specified color and pattern using available bots.
 * @param {number} x1 - The x-coordinate of the top-left corner of the area.
 * @param {number} y1 - The y-coordinate of the top-left corner of the area.
 * @param {number} x2 - The x-coordinate of the bottom-right corner of the area.
 * @param {number} y2 - The y-coordinate of the bottom-right corner of the area.
 * @param {Array} color - The RGB color array to fill the area with.
 * @param {string} pattern - The name of the pattern to use for filling.
 */
export async function FillArea(x1, y1, x2, y2, color, pattern) {
    if (getFree() === -1) return;
    x2--; y2--;

    for (const [x, y] of patterns[constants[pattern]](x1, y1, x2, y2)) {
        let index = getFree();
        if (index === -1) continue;

        const pixel = OWOP.world.getPixel(x, y);
        if (colorEqual(pixel, color)) continue;
        await setPixel(x, y, color, index)
    }
}

/**
 * Retrieves the RGB color of a specific pixel from an image.
 * @param {CanvasRenderingContext2D} ctx - The canvas context containing the image.
 * @param {number} x - The x-coordinate of the pixel.
 * @param {number} y - The y-coordinate of the pixel.
 * @returns {Array} The RGB color array of the pixel.
 */
function getPixelColor(ctx, x, y) {
    if (!ctx) {
        console.error('Canvas context is undefined');
        return [0, 0, 0]; // Return black if context is undefined
    }
    var data = ctx.getImageData(x, y, 1, 1).data;
    return [data[0], data[1], data[2]];
}

/**
 * Asynchronously pastes an image onto the world at the specified coordinates.
 * @param {number} x1 - The x-coordinate of the top-left corner where the image will be pasted.
 * @param {number} y1 - The y-coordinate of the top-left corner where the image will be pasted.
 * @param {ImageData} imageData - The image data to be pasted.
 * @param {CanvasRenderingContext2D} assetContext - The context of the canvas containing the image data.
 */
export async function pasteImageData(x1, y1, imageData, assetContext) {
    if (!imageData || !assetContext) {
        console.error('ImageData or assetContext is undefined');
        return;
    }

    addOverlayImage(assetContext, x1, y1, imageData.width, imageData.height);

    for (const [x, y] of patterns[constants[config.getValue("Paste")]](x1, y1, x1 + imageData.width - 1, y1 + imageData.height - 1)) {
        const pixel = await OWOP.world.getPixel(x, y);
        const color = getPixelColor(assetContext, x - x1, y - y1);

        const abc = getFree();

        if (colorEqual(pixel, color)) continue;
        await setPixel(x, y, color, abc);
    }
}