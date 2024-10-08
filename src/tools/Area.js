import { FillArea } from "../core/utils.js";
import config from "../core/config.js";
import { jobList } from "../core/sharedState.js";

export default function initTool() {
    return new OWOP.tools.class("Bot Area", OWOP.cursors.select, OWOP.fx.player.NONE, OWOP.RANK.USER, function (tool) {
        let step = 1;

        tool.setFxRenderer(function (fx, ctx, time) {
            if (!fx.extra.isLocalPlayer) return 1;
            let x = fx.extra.player.x;
            let y = fx.extra.player.y;
            let fxx = (Math.floor(x / step) - OWOP.camera.x) * OWOP.camera.zoom;
            let fxy = (Math.floor(y / step) - OWOP.camera.y) * OWOP.camera.zoom;
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

                let txt = (!tool.extra.clicking ? "M2 Inside to void. " : '') + `(${Math.abs(w)}x${Math.abs(h)}, ${(Math.abs(w) / 16 * Math.abs(h) / 16).toFixed(4)} chunks)`
                let txtx = window.innerWidth >> 1;
                let txty = window.innerHeight >> 1;
                txtx = Math.max(x, Math.min(txtx, x + w * OWOP.camera.zoom));
                txty = Math.max(y, Math.min(txty, y + h * OWOP.camera.zoom));

                OWOP.drawText = (ctx, str, x, y, centered) => {
                    ctx.strokeStyle = "#000000", ctx.fillStyle = "#FFFFFF", ctx.lineWidth = 2.5, ctx.globalAlpha = 1;
                    if (centered) {
                        x -= ctx.measureText(str).width >> 1;
                    }
                    ctx.strokeText(str, x, y);
                    ctx.globalAlpha = 1;
                    ctx.fillText(str, x, y);
                };
                OWOP.drawText(ctx, txt, txtx, txty, true);
                ctx.font = oldfont;
                ctx.lineWidth = oldlinew;
                return 0;
            } else {
                ctx.beginPath();
                ctx.moveTo(0, fxy + 0.5);
                ctx.moveTo(fxx + 0.5, 0);

                //ctx.lineWidth = 1;
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

        tool.setEvent("mousedown", async function (mouse) {

            let s = tool.extra.start;
            let e = tool.extra.end;
            let isInside = function isInside() {
                return mouse.tileX >= s[0] && mouse.tileX < e[0] && mouse.tileY >= s[1] && mouse.tileY < e[1];
            }

            if (mouse.buttons === 1 && !tool.extra.end) {
                tool.extra.start = [Math.floor(mouse.tileX / step) * step, Math.floor(mouse.tileY / step) * step];
                tool.extra.clicking = true;
                tool.setEvent("mousemove", function (mouse) {
                    if (tool.extra.start && mouse.buttons === 1) {
                        tool.extra.end = [Math.floor(mouse.tileX / step) * step, Math.floor(mouse.tileY / step) * step];
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
            } else if (mouse.buttons === 1 && tool.extra.end) {
                if (isInside()) {
                    let offx = mouse.tileX;
                    let offy = mouse.tileY;

                    tool.setEvent("mousemove", function (mouse) {
                        let dx = mouse.tileX - offx;
                        let dy = mouse.tileY - offy;

                        tool.extra.start = [s[0] + dx, s[1] + dy];
                        tool.extra.end = [e[0] + dx, e[1] + dy];
                    });

                    let end = function end() {
                        tool.setEvent("mouseup deselect mousemove", null);
                    };

                    tool.setEvent("deselect", end);
                    tool.setEvent("mouseup", function (mouse) {
                        if (!(mouse.buttons & 1)) {
                            end();
                        }
                    });
                }
            } else if (mouse.buttons === 2 && tool.extra.end && isInside()) {
                let w = tool.extra.end[0] - tool.extra.start[0];
                let h = tool.extra.end[1] - tool.extra.start[1];

                let chunkX = tool.extra.start[0];
                let chunkY = tool.extra.start[1];

                const job = {
                    type: "fill",
                    data: {
                        chunkX: chunkX,
                        chunkY: chunkY,
                        chunkX2: chunkX + w,
                        chunkY2: chunkY + h,
                        color: OWOP.player.selectedColor,
                        pattern: config.getValue("Area")
                    }
                }
                if (!jobList.some(existingJob => existingJob.data.chunkX === chunkX && existingJob.data.chunkY === chunkY)) {
                    jobList.push(job);
                }

                await FillArea(chunkX, chunkY, chunkX + w, chunkY + h, OWOP.player.selectedColor, config.getValue("Area"));

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