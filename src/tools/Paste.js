import { pasteImageData } from "../core/utils.js";
import config from "../core/config.js";

export default function initTool() {
    return new OWOP.tools.class("Bot Paste", OWOP.cursors.paste, OWOP.fx.player.RECT_SELECT_ALIGNED(1), OWOP.RANK.USER, function (tool) {
        let cvs = document.createElement("canvas");
        let ctx = cvs.getContext('2d');

        tool.setFxRenderer(function (fx, ctx) {
            let fxx = Math.floor(OWOP.mouse.tileX << 4 / 16) - OWOP.camera.x;
            let fxy = Math.floor(OWOP.mouse.tileY << 4 / 16) - OWOP.camera.y;

            if (fx.extra.isLocalPlayer && cvs.width && cvs.height) {
                ctx.strokeStyle = "#000000";
                ctx.scale(OWOP.camera.zoom, OWOP.camera.zoom);
                ctx.drawImage(cvs, fxx, fxy);
                ctx.scale(1 / OWOP.camera.zoom, 1 / OWOP.camera.zoom);
                ctx.globalAlpha = 0.5;
                ctx.strokeRect(fxx * OWOP.camera.zoom, fxy * OWOP.camera.zoom, cvs.width * OWOP.camera.zoom, cvs.height * OWOP.camera.zoom);
                return 0;
            };
        });

        tool.setEvent("mousedown mousemove", async function (mouse) {
            if (mouse.buttons === 1) {
                if (!window.owopfuck.selectedAsset) {
                    OWOP.chat.local("No asset selected!");
                    return;
                }
                if (typeof window.owopfuck.selectedAsset === "string") {
                    let img = new Image();
                    img.onload = () => {
                        cvs.width = img.width;
                        cvs.height = img.height;
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(img, 0, 0);
                        window.owopfuck.selectedAsset = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
                        window.owopfuck.assetContext = ctx;
                        OWOP.chat.local("Image is ready.");
                    };
                    img.src = window.owopfuck.selectedAsset;
                    return;
                }
                let Pixelization = config.getValue("Image Pixelization");
                let x = !Pixelization ? OWOP.mouse.tileX : Math.floor(OWOP.mouse.tileX / 16) * 16,
                    y = !Pixelization ? OWOP.mouse.tileY : Math.floor(OWOP.mouse.tileY / 16) * 16;

                pasteImageData(x, y, window.owopfuck.selectedAsset, window.owopfuck.assetContext);
            }
        });
    });
}