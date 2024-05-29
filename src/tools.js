import bots from "./sharedState.js";
import { colorEqual, setPixel, sleep } from "./utils.js";
import config from "./config.js";

export default function initTools() {
    OWOP.tools.addToolObject(new OWOP.tools.class("Bot Cursor", OWOP.cursors.cursor, OWOP.fx.player.RECT_SELECT_ALIGNED(1), OWOP.RANK.USER, function(tool) {
        var lastX, lastY;

        tool.setEvent("mousedown mousemove", async function(mouse) {
            if(mouse.buttons === 4 || mouse.buttons === 0) return;
            if(!lastX || !lastY) {
                lastX = OWOP.mouse.tileX;
                lastY = OWOP.mouse.tileY;
            }

            (0, OWOP.util.line)(lastX, lastY, OWOP.mouse.tileX, OWOP.mouse.tileY, 1, async function(x, y) {
                const color = mouse.buttons === 2 ? [255, 255, 255] : OWOP.player.selectedColor;
                await setPixel(x, y, color);
            });

            lastX = OWOP.mouse.tileX;
            lastY = OWOP.mouse.tileY;
        });
        tool.setEvent("mouseup", function() {
            lastX = null;
            lastY = null;
        });
    }));

    OWOP.tools.addToolObject(new OWOP.tools.class("Bot Fill", OWOP.cursors.fill, OWOP.fx.player.RECT_SELECT_ALIGNED(1), OWOP.RANK.USER, function(tool) {
        let stopFlag = false;

        async function floodFill(x, y, targetColor, fillColor) {
            if(!targetColor || colorEqual(targetColor, fillColor)) return;
            const pixelQueue = [[x, y]];
            const visited = new Set();

            while(pixelQueue.length > 0) {
                if(stopFlag) return;
                const [x, y] = pixelQueue.shift();
                if(visited.has(`${x},${y}`)) continue;
                visited.add(`${x},${y}`);
                const currentColor = await OWOP.world.getPixel(x, y);
                if(!currentColor) return;
				if(currentColor[0] !== targetColor[0] || currentColor[1] !== targetColor[1] || currentColor[2] !== targetColor[2]) continue;
                await setPixel(x, y, fillColor);
                pixelQueue.push([x + 1, y]);
                pixelQueue.push([x - 1, y]);
                pixelQueue.push([x, y + 1]);
                pixelQueue.push([x, y - 1]);

                // add diagonals to the queue to fill in a circular pattern
                if(!config.getValue("Diagonal Fill")) {
                    pixelQueue.push([x + 1, y + 1]);
                    pixelQueue.push([x + 1, y - 1]);
                    pixelQueue.push([x - 1, y + 1]);
                    pixelQueue.push([x - 1, y - 1]);
                }

                await sleep(1);
            }
        }
        function stopFill() {
            stopFlag = true;
            busy = false;
        }

        let busy = false;
        async function startFill(newX, newY, targetColor, fillColor) {
            if(busy) return;
            busy = true;
            stopFlag = false;
            await floodFill(newX, newY, targetColor, fillColor);
        }

        tool.setEvent("mousedown", async function (mouse) {
            if(mouse.buttons == 0 || mouse.buttons == 4) return;
            if(bots.length === 0) return;
            startFill(mouse.tileX, mouse.tileY, OWOP.world.getPixel(mouse.tileX, mouse.tileY), OWOP.player.selectedColor);
        });

        tool.setEvent("mouseup deselect", () => {
            stopFill();
            return;
        });
    }));
}