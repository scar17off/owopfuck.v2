import { colorEqual, setPixel } from "../core/utils.js";

export default function initTool() {
    return new OWOP.tools.class("Bot Cursor", OWOP.cursors.cursor, OWOP.fx.player.RECT_SELECT_ALIGNED(1), OWOP.RANK.USER, function (tool) {
        var lastX, lastY;

        tool.setEvent("mousedown mousemove", async function (mouse) {
            if (mouse.buttons === 4 || mouse.buttons === 0) return;
            if (!lastX || !lastY) {
                lastX = OWOP.mouse.tileX;
                lastY = OWOP.mouse.tileY;
            }

            (0, OWOP.util.line)(lastX, lastY, OWOP.mouse.tileX, OWOP.mouse.tileY, 1, async function (x, y) {
                const color = mouse.buttons === 2 ? [255, 255, 255] : OWOP.player.selectedColor;
                if(colorEqual(color, OWOP.world.getPixel(x, y))) return;
                await setPixel(x, y, color);
            });

            lastX = OWOP.mouse.tileX;
            lastY = OWOP.mouse.tileY;
        });
        tool.setEvent("mouseup", function () {
            lastX = null;
            lastY = null;
        });
    });
}