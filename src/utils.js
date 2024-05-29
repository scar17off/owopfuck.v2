import config from "./config.js";
import { bots } from "./sharedState.js";

/**
 * Delays the execution of the next part of the code.
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise} A promise that resolves after the specified delay.
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Compares two color arrays for equality.
 * @param {Array} color1 - The first color array.
 * @param {Array} color2 - The second color array.
 * @returns {boolean} True if the colors are equal, false otherwise.
 */
function colorEqual(color1, color2) {
    return JSON.stringify(color1) === JSON.stringify(color2);
}

var last = 0;
/**
 * Returns the index of the next bot.
 * @returns {number} The index of the next bot.
 */
export function getFree() {
    let b = bots.filter(i => i.net.ws.readyState === 1 && i.net.isWorldConnected);
    if(b.length === 0) return -1;
    if(last >= b.length) last = 0;
    return last++;
}

/**
 * Sets a pixel on the OWOP world if conditions are met.
 * @param {number} x - The x-coordinate of the pixel.
 * @param {number} y - The y-coordinate of the pixel.
 * @param {Array} color - The RGB color array to set the pixel to. Defaults to black [0, 0, 0].
 * @returns {Promise<boolean>} A promise that resolves to true if the pixel was set, false otherwise.
 */
export async function setPixel(x, y, color = [0, 0, 0]) {
    if(bots.length === 0 && !config.getValue("UsePlayer")) return false;
    if(colorEqual(color, OWOP.world.getPixel(x, y))) return false;
    if(getFree() === -1) return;

    OWOP.world.setPixel(x, y, color);

    const id = getFree();

    const bot = bots[id];
    if (bot.net.bucket.canSpend(1)) {
        bot.world.setPixel(x, y, color);
    } else {
        await bot.net.bucket.waitUntilRestore();
        bot.world.setPixel(x, y, color);
    }

    return true;
}

/**
 * Transforms a country or region name into a flag identifier.
 * @param {string} name - The name to transform.
 * @returns {string} The transformed flag name.
 */
export function getFlagName(name) {
    return name.trim().toLowerCase().replaceAll(' ', '-');
}