import { pasteImageData } from "../core/utils.js";
import { jobList } from "../core/sharedState.js";
import SimplexNoise from "../components/SimplexNoise.js";

export default function initTool() {
    return new OWOP.tools.class("Terrain Generator", OWOP.cursors.select, OWOP.fx.player.NONE, OWOP.RANK.USER, function (tool) {
        let step = 1;
        let noise = new SimplexNoise(1);

        tool.setFxRenderer(function (fx, ctx, time) {
            if (!fx.extra.isLocalPlayer) return 1;
            let x = fx.extra.player.x;
            let y = fx.extra.player.y;
            let fxx = (x - OWOP.camera.x) * OWOP.camera.zoom;
            let fxy = (y - OWOP.camera.y) * OWOP.camera.zoom;
            let oldlinew = ctx.lineWidth;
            ctx.lineWidth = 1;
            if (tool.extra.end) {
                let s = tool.extra.start;
                let e = tool.extra.end;
                let x = (s[0] - OWOP.camera.x) * OWOP.camera.zoom + 0.5;
                let y = (s[1] - OWOP.camera.y) * OWOP.camera.zoom + 0.5;
                let w = e[0] - s[0];
                let h = e[1] - s[1];
                ctx.beginPath();
                ctx.rect(x, y, w * OWOP.camera.zoom, h * OWOP.camera.zoom);
                ctx.globalAlpha = 0.25;
                ctx.strokeStyle = "#FFFFFF";
                ctx.stroke();
                ctx.setLineDash([3, 4]);
                ctx.strokeStyle = "#000000";
                ctx.stroke();
                ctx.globalAlpha = 0.25 + Math.sin(time / 320) / 4;
                ctx.fillStyle = OWOP.renderer.patterns.unloaded;
                ctx.fill();
                ctx.setLineDash([]);
                let oldfont = ctx.font;
                ctx.font = "16px sans-serif";

                let txt = (!tool.extra.clicking ? "Right click to generate terrain. " : '') + `(${Math.abs(w)}x${Math.abs(h)}, ${(Math.abs(w) / 16 * Math.abs(h) / 16).toFixed(4)} chunks)`
                let txtx = window.innerWidth >> 1;
                let txty = window.innerHeight >> 1;
                txtx = Math.max(x, Math.min(txtx, x + w * OWOP.camera.zoom));
                txty = Math.max(y, Math.min(txty, y + h * OWOP.camera.zoom));

                ctx.strokeStyle = "#000000";
                ctx.fillStyle = "#FFFFFF";
                ctx.lineWidth = 2.5;
                ctx.globalAlpha = 1;
                if (true) {
                    txtx -= ctx.measureText(txt).width >> 1;
                }
                ctx.strokeText(txt, txtx, txty);
                ctx.globalAlpha = 1;
                ctx.fillText(txt, txtx, txty);
                ctx.font = oldfont;
                ctx.lineWidth = oldlinew;
                return 0;
            } else {
                ctx.beginPath();
                ctx.moveTo(0, fxy + 0.5);
                ctx.lineTo(window.innerWidth, fxy + 0.5);
                ctx.moveTo(fxx + 0.5, 0);
                ctx.lineTo(fxx + 0.5, window.innerHeight);

                ctx.globalAlpha = 0.8;
                ctx.strokeStyle = "#FFFFFF";
                ctx.stroke();
                ctx.setLineDash([3]);
                ctx.strokeStyle = "#000000";
                ctx.stroke();

                ctx.setLineDash([]);
                ctx.lineWidth = oldlinew;
                return 1;
            }
        });

        tool.extra.start = null;
        tool.extra.end = null;
        tool.extra.clicking = false;

        function generateTerrain(x, y, w, h) {
            let imageData = new ImageData(w, h);
            for (let py = 0; py < h; py++) {
                for (let px = 0; px < w; px++) {
                    let value = (noise.noise2D((x + px) / 50, (y + py) / 50) + 1) / 2;
                    let index = (py * w + px) * 4;
                    let color = Math.floor(value * 255);
                    imageData.data[index] = color;
                    imageData.data[index + 1] = color;
                    imageData.data[index + 2] = color;
                    imageData.data[index + 3] = 255;
                }
            }
            return imageData;
        }

        tool.setEvent("mousedown", async function (mouse) {
            let s = tool.extra.start;
            let e = tool.extra.end;
            let isInside = function isInside() {
                return mouse.tileX >= s[0] && mouse.tileX < e[0] && mouse.tileY >= s[1] && mouse.tileY < e[1];
            }

            if (mouse.buttons === 1 && !tool.extra.end) {
                tool.extra.start = [mouse.tileX, mouse.tileY];
                tool.extra.clicking = true;
                tool.setEvent("mousemove", function (mouse) {
                    if (tool.extra.start && mouse.buttons === 1) {
                        tool.extra.end = [mouse.tileX, mouse.tileY];
                        return 1;
                    }
                });

                let finish = function finish() {
                    tool.setEvent("mousemove mouseup deselect", null);
                    tool.extra.clicking = false;
                    let s = tool.extra.start;
                    let e = tool.extra.end;

                    if (e) {
                        if (s[0] === e[0] || s[1] === e[1]) {
                            tool.extra.start = null;
                            tool.extra.end = null;
                        }

                        if (s[0] > e[0]) {
                            let tmp = e[0];
                            e[0] = s[0];
                            s[0] = tmp;
                        }

                        if (s[1] > e[1]) {
                            let tmp = e[1];
                            e[1] = s[1];
                            s[1] = tmp;
                        }
                    }

                    OWOP.renderer.render(OWOP.renderer.rendertype.FX);
                }

                tool.setEvent("deselect", finish);
                tool.setEvent("mouseup", function (mouse) {
                    if (!(mouse.buttons & 1)) {
                        finish();
                    }
                });
            } else if (mouse.buttons === 2 && tool.extra.end && isInside()) {
                let w = tool.extra.end[0] - tool.extra.start[0];
                let h = tool.extra.end[1] - tool.extra.start[1];

                let chunkX = tool.extra.start[0];
                let chunkY = tool.extra.start[1];

                const job = {
                    type: "terrain",
                    data: {
                        chunkX: chunkX,
                        chunkY: chunkY,
                        chunkX2: chunkX + w,
                        chunkY2: chunkY + h
                    }
                }
                if (!jobList.some(existingJob => existingJob.data.chunkX === chunkX && existingJob.data.chunkY === chunkY)) {
                    jobList.push(job);
                }

                let imageData = generateTerrain(chunkX, chunkY, w, h);
                let canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                let ctx = canvas.getContext('2d');
                ctx.putImageData(imageData, 0, 0);

                await pasteImageData(chunkX, chunkY, imageData, ctx);

                const jobIndex = jobList.indexOf(job);
                if (jobIndex !== -1) {
                    jobList.splice(jobIndex, 1);
                }
            } else {
                tool.extra.start = null;
                tool.extra.end = null;
            }
        });
    });
}