import { pasteImageData } from "../core/utils.js";
import SimplexNoise from "../components/SimplexNoise.js";

export default function initTool() {
    return new OWOP.tools.class("Terrain Generator", OWOP.cursors.select, OWOP.fx.player.RECT_SELECT_ALIGNED(16), OWOP.RANK.USER, function (tool) {
        let start = null;
        let end = null;
        let previewCanvas = document.createElement("canvas");
        let previewCtx = previewCanvas.getContext("2d");
        let noise = new SimplexNoise(1);

        function generateTerrain(width, height) {
            if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
                return null;
            }
            let imageData = previewCtx.createImageData(width, height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let value = (noise.noise2D(x / 50, y / 50) + 1) / 2;
                    let index = (y * width + x) * 4;
                    let color = Math.floor(value * 255);
                    imageData.data[index] = color;
                    imageData.data[index + 1] = color;
                    imageData.data[index + 2] = color;
                    imageData.data[index + 3] = 128;
                }
            }
            return imageData;
        }

        tool.setFxRenderer((fx, ctx) => {
            if (start && end) {
                let x = Math.min(start[0], end[0]);
                let y = Math.min(start[1], end[1]);
                let w = Math.abs(end[0] - start[0]);
                let h = Math.abs(end[1] - start[1]);
                ctx.globalAlpha = 0.5;
                ctx.drawImage(previewCanvas, x, y);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = "#000000";
                ctx.strokeRect(x, y, w, h);
            }
        });

        tool.setEvent("mousedown", mouse => {
            if (mouse.buttons === 1) {
                start = [Math.floor(mouse.tileX / 16) * 16, Math.floor(mouse.tileY / 16) * 16];
                end = null;
            } else if (mouse.buttons === 2 && start && end) {
                let x = Math.min(start[0], end[0]);
                let y = Math.min(start[1], end[1]);
                let w = Math.abs(end[0] - start[0]);
                let h = Math.abs(end[1] - start[1]);
                let imageData = generateTerrain(w, h);
                if (imageData) {
                    pasteImageData(x, y, imageData, previewCtx);
                }
            }
        });

        tool.setEvent("mousemove", mouse => {
            if (mouse.buttons === 1 && start) {
                end = [Math.floor(mouse.tileX / 16) * 16, Math.floor(mouse.tileY / 16) * 16];
                let w = Math.abs(end[0] - start[0]);
                let h = Math.abs(end[1] - start[1]);
                if (w > 0 && h > 0) {
                    previewCanvas.width = w;
                    previewCanvas.height = h;
                    let imageData = generateTerrain(w, h);
                    if (imageData) {
                        previewCtx.putImageData(imageData, 0, 0);
                    }
                }
            }
        });

        tool.setEvent("mouseup", mouse => {
            if (mouse.buttons === 1 && start) {
                end = [Math.floor(mouse.tileX / 16) * 16, Math.floor(mouse.tileY / 16) * 16];
            }
        });
    })
}