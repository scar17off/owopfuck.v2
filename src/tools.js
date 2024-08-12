import Cursor from "./tools/Cursor.js";
import Fill from "./tools/Fill.js";
import Area from "./tools/Area.js";
import Eraser from "./tools/Eraser.js";
import Paste from "./tools/Paste.js";
import TerrainGenerator from "./tools/TerrainGenerator.js";

const tools = {
  Cursor,
  Fill,
  Area,
  Eraser,
  Paste,
  TerrainGenerator
}

export default function initTools() {
    const addToolsInterval = setInterval(() => {
        if (typeof OWOP !== 'undefined' && OWOP.tools && OWOP.tools.addToolObject) {
            clearInterval(addToolsInterval);
            for (const tool in tools) {
                OWOP.tools.addToolObject(tools[tool]());
            }
        }
    }, 100);
}