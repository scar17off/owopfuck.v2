import { FillArea } from "../core/utils.js";
import config from "../core/config.js";
import { bots, jobList } from "../core/sharedState.js";

export default function initTool() {
  return new OWOP.tools.class("Bot Eraser", OWOP.cursors.erase, OWOP.fx.player.RECT_SELECT_ALIGNED(16), OWOP.RANK.USER, function (tool) {
    let LastChunkTime = Date.now();
    tool.diam = 16;

    tool.setFxRenderer((fx, ctx) => {
      var x = (fx.extra.player.x);
      var y = (fx.extra.player.y);
      var diameter = config.getValue("Eraser");
      var pxc = tool.diam * 16;
      var fxx = (tool.diam * Math.floor(x / pxc) - OWOP.camera.x) * OWOP.camera.zoom;
      var fxy = (tool.diam * Math.floor(y / pxc) - OWOP.camera.y) * OWOP.camera.zoom;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = fx.extra.player.htmlRgb;
      ctx.fillRect(fxx, fxy, OWOP.camera.zoom * diameter, OWOP.camera.zoom * diameter);
      return 1;
    });

    tool.setEvent("mousedown mousemove", async function (mouse) {
      if (mouse.buttons === 0 || mouse.buttons === 4) return;
      if (bots.length === 0) return;
      if (Date.now() - LastChunkTime < 100) return;
      LastChunkTime = Date.now();
      let color = mouse.buttons === 1 ? OWOP.player.selectedColor : [255, 255, 255];
      let chunkx = Math.floor(OWOP.mouse.tileX / tool.diam) * tool.diam;
      let chunky = Math.floor(OWOP.mouse.tileY / tool.diam) * tool.diam;

      const job = {
        type: "fill",
        data: {
          chunkX: chunkx,
          chunkY: chunky,
          chunkX2: chunkx + tool.diam,
          chunkY2: chunky + tool.diam,
          color: color,
          pattern: config.getValue("Eraser")
        }
      }
      if (!jobList.some(existingJob => existingJob.data.chunkX === chunkx && existingJob.data.chunkY === chunky)) {
        jobList.push(job);
      }

      await FillArea(chunkx, chunky, chunkx + tool.diam, chunky + tool.diam, color, config.getValue("Eraser"));

      const jobIndex = jobList.indexOf(job);
      if (jobIndex !== -1) {
        jobList.splice(jobIndex, 1);
      }
    });
  })
}