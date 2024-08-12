import { colorEqual, setPixel, sleep } from "../core/utils.js";
import config from "../core/config.js";
import { bots } from "../core/sharedState.js";

export default function initTool() {
    return new OWOP.tools.class("Bot Fill", OWOP.cursors.fill, OWOP.fx.player.RECT_SELECT_ALIGNED(1), OWOP.RANK.USER, function (tool) {
        let stopFlag = false;

        async function floodFill(x, y, targetColor, fillColor) {
            if (!targetColor || colorEqual(targetColor, fillColor)) return;
            const pixelQueue = [[x, y]];
            const visited = new Set();

            while (pixelQueue.length > 0) {
                if (stopFlag) return;
                const [x, y] = pixelQueue.shift();
                if (visited.has(`${x},${y}`)) continue;
                visited.add(`${x},${y}`);
                const currentColor = await OWOP.world.getPixel(x, y);
                if (!currentColor) return;
                if (currentColor[0] !== targetColor[0] || currentColor[1] !== targetColor[1] || currentColor[2] !== targetColor[2]) continue;
                await setPixel(x, y, fillColor);
                pixelQueue.push([x + 1, y]);
                pixelQueue.push([x - 1, y]);
                pixelQueue.push([x, y + 1]);
                pixelQueue.push([x, y - 1]);

                // add diagonals to the queue to fill in a circular pattern
                if (!config.getValue("Diagonal Fill")) {
                    pixelQueue.push([x + 1, y + 1]);
                    pixelQueue.push([x + 1, y - 1]);
                    pixelQueue.push([x - 1, y + 1]);
                    pixelQueue.push([x - 1, y - 1]);
                }

                if (!config.getValue("Instant Place")) await sleep(1);
            }
        }
        function stopFill() {
            stopFlag = true;
            busy = false;
        }

        let busy = false;
        async function startFill(newX, newY, targetColor, fillColor) {
            if (busy) return;
            busy = true;
            stopFlag = false;
            await floodFill(newX, newY, targetColor, fillColor);
        }

        tool.setEvent("mousedown", async function (mouse) {
            if (mouse.buttons == 0 || mouse.buttons == 4) return;
            if (bots.length === 0) return;
            startFill(mouse.tileX, mouse.tileY, OWOP.world.getPixel(mouse.tileX, mouse.tileY), OWOP.player.selectedColor);
        });

        tool.setEvent("mouseup deselect", () => {
            stopFill();
            return;
        });
    })
}