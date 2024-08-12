import { pasteImageData } from "../core/utils.js";
import { jobList } from "../core/sharedState.js";
import TerrainGeneration from "../components/TerrainGeneration.js";

export default function initTool() {
    return new OWOP.tools.class("Chunk Generator", OWOP.cursors.erase, OWOP.fx.player.RECT_SELECT_ALIGNED(16), OWOP.RANK.USER, function (tool) {
        let terrainGen = new TerrainGeneration();
        tool.diam = 16;

        const configWindow = new OWOP.windowSys.class.window("Terrain Generator Config", {closeable: true}, function(win) {
            win.container.style.height = "auto";
            win.container.style.width = "300px";
            win.container.style.overflow = "hidden";

            function createSlider(label, min, max, step, value, onChange) {
                const container = OWOP.util.mkHTML("div");
                const sliderLabel = OWOP.util.mkHTML("label", {}, `${label}: ${value}`);
                const slider = OWOP.util.mkHTML("input", {type: "range", min, max, step, value});
                slider.addEventListener("input", function() {
                    const newValue = parseFloat(this.value);
                    onChange(newValue);
                    sliderLabel.textContent = `${label}: ${newValue}`;
                });
                container.appendChild(sliderLabel);
                container.appendChild(slider);
                win.addObj(container);
                sliderLabel.textContent = `${label}: ${value}`;
                return { slider, sliderLabel };
            }

            const sliders = {
                oceanLevel: createSlider("Ocean Level", 0, 1, 0.01, terrainGen.OCEAN_LEVEL, value => terrainGen.OCEAN_LEVEL = value),
                sandLevel: createSlider("Sand Level", 0, 1, 0.01, terrainGen.SAND_LEVEL, value => terrainGen.SAND_LEVEL = value),
                islandSize: createSlider("Island Size", 10, 500, 1, terrainGen.ISLAND_SIZE, value => terrainGen.ISLAND_SIZE = value)
            };

            function createColorPicker(label, colorName) {
                const container = OWOP.util.mkHTML("div", {style: "display: inline-block; margin-right: 10px;"});
                const colorLabel = OWOP.util.mkHTML("label", {}, label);
                const colorInput = OWOP.util.mkHTML("input", {type: "color", value: rgbToHex(terrainGen[colorName])});
                colorInput.addEventListener("input", function() {
                    const newColor = hexToRgb(this.value);
                    terrainGen.updateColor(colorName, newColor);
                });
                container.appendChild(colorLabel);
                container.appendChild(colorInput);
                return { container, colorInput };
            }

            const colorPickersContainer = OWOP.util.mkHTML("div");
            const colorPickers = {
                deepOcean: createColorPicker("Deep Ocean", "DEEP_OCEAN_COLOR"),
                deepSea: createColorPicker("Deep Sea", "DEEP_SEA_COLOR"),
                shallowWater: createColorPicker("Shallow Water", "SHALLOW_WATER_COLOR"),
                sand: createColorPicker("Sand", "SAND_COLOR"),
                lightGrass: createColorPicker("Light Grass", "LIGHT_GRASS_COLOR"),
                darkGrass: createColorPicker("Dark Grass", "DARK_GRASS_COLOR")
            };
            Object.values(colorPickers).forEach(picker => colorPickersContainer.appendChild(picker.container));
            win.addObj(colorPickersContainer);

            const seedContainer = OWOP.util.mkHTML("div");
            const seedLabel = OWOP.util.mkHTML("label", {for: "seedInput"}, "Seed: ");
            const seedInput = OWOP.util.mkHTML("input", {id: "seedInput", type: "number", value: "1"});
            const seedButton = OWOP.util.mkHTML("button");
            seedButton.innerText = "Set Seed";
            seedButton.addEventListener("click", function() {
                terrainGen.setSeed(parseInt(seedInput.value));
            });
            seedContainer.appendChild(seedLabel);
            seedContainer.appendChild(seedInput);
            seedContainer.appendChild(seedButton);
            win.addObj(seedContainer);

            const importExportContainer = OWOP.util.mkHTML("div");
            const exportButton = OWOP.util.mkHTML("button");
            exportButton.innerText = "Export Config";
            const importButton = OWOP.util.mkHTML("button");
            importButton.innerText = "Import Config";
            const importInput = OWOP.util.mkHTML("input", {type: "file", accept: ".json", style: "display: none;"});

            exportButton.addEventListener("click", function() {
                const config = {
                    OCEAN_LEVEL: terrainGen.OCEAN_LEVEL,
                    SAND_LEVEL: terrainGen.SAND_LEVEL,
                    ISLAND_SIZE: terrainGen.ISLAND_SIZE,
                    DEEP_OCEAN_COLOR: terrainGen.DEEP_OCEAN_COLOR,
                    DEEP_SEA_COLOR: terrainGen.DEEP_SEA_COLOR,
                    SHALLOW_WATER_COLOR: terrainGen.SHALLOW_WATER_COLOR,
                    SAND_COLOR: terrainGen.SAND_COLOR,
                    LIGHT_GRASS_COLOR: terrainGen.LIGHT_GRASS_COLOR,
                    DARK_GRASS_COLOR: terrainGen.DARK_GRASS_COLOR
                };
                const blob = new Blob([JSON.stringify(config, null, 2)], {type: "application/json"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "terrain_config.json";
                a.click();
                URL.revokeObjectURL(url);
            });

            importButton.addEventListener("click", function() {
                importInput.click();
            });

            importInput.addEventListener("change", function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const config = JSON.parse(e.target.result);
                            Object.keys(config).forEach(key => {
                                if (key in terrainGen) {
                                    terrainGen[key] = config[key];
                                    if (key === "OCEAN_LEVEL") {
                                        sliders.oceanLevel.slider.value = config[key];
                                        sliders.oceanLevel.sliderLabel.textContent = `Ocean Level: ${config[key]}`;
                                    } else if (key === "SAND_LEVEL") {
                                        sliders.sandLevel.slider.value = config[key];
                                        sliders.sandLevel.sliderLabel.textContent = `Sand Level: ${config[key]}`;
                                    } else if (key === "ISLAND_SIZE") {
                                        sliders.islandSize.slider.value = config[key];
                                        sliders.islandSize.sliderLabel.textContent = `Island Size: ${config[key]}`;
                                    } else if (key.endsWith("_COLOR")) {
                                        const pickerKey = key.split("_")[0].toLowerCase() + key.split("_")[1].charAt(0).toUpperCase() + key.split("_")[1].slice(1).toLowerCase();
                                        if (colorPickers[pickerKey]) {
                                            colorPickers[pickerKey].colorInput.value = rgbToHex(config[key]);
                                        }
                                    }
                                }
                            });
                        } catch (error) {
                            console.error("Error parsing config file:", error);
                        }
                    };
                    reader.readAsText(file);
                }
            });

            importExportContainer.appendChild(exportButton);
            importExportContainer.appendChild(importButton);
            importExportContainer.appendChild(importInput);
            win.addObj(importExportContainer);
        });

        OWOP.windowSys.addWindow(configWindow).move(800, 32);

        tool.setFxRenderer((fx, ctx) => {
            var x = fx.extra.player.x;
            var y = fx.extra.player.y;
            var pxc = tool.diam * 16;
            var fxx = (tool.diam * Math.floor(x / pxc) - OWOP.camera.x) * OWOP.camera.zoom;
            var fxy = (tool.diam * Math.floor(y / pxc) - OWOP.camera.y) * OWOP.camera.zoom;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = fx.extra.player.htmlRgb;
            ctx.fillRect(fxx, fxy, OWOP.camera.zoom * tool.diam, OWOP.camera.zoom * tool.diam);
            return 1;
        });

        tool.setEvent("mousedown", async function (mouse) {
            if (mouse.buttons === 0) return;
            let chunkx = Math.floor(OWOP.mouse.tileX / tool.diam) * tool.diam;
            let chunky = Math.floor(OWOP.mouse.tileY / tool.diam) * tool.diam;

            const job = {
                type: "terrain",
                data: {
                    startX: chunkx / 16,
                    startY: chunky / 16,
                    endX: chunkx / 16,
                    endY: chunky / 16
                }
            };
            if (!jobList.some(existingJob => existingJob.data.startX === job.data.startX && existingJob.data.startY === job.data.startY)) {
                jobList.push(job);
            }

            try {
                const chunks = terrainGen.generateArea(job.data.startX, job.data.startY, job.data.endX, job.data.endY);
                for (const chunk of chunks) {
                    if (!chunk.data || chunk.data.length !== 16 * 16 * 4) {
                        console.error(`Invalid chunk data for chunk (${chunk.x}, ${chunk.y})`);
                        continue;
                    }

                    const imageData = new ImageData(chunk.data, 16, 16);
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = tempCanvas.height = 16;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.putImageData(imageData, 0, 0);

                    await pasteImageData(chunk.x * 16, chunk.y * 16, imageData, tempCtx);
                }
            } catch (error) {
                console.error("Error generating or pasting terrain:", error);
            }

            const jobIndex = jobList.indexOf(job);
            if (jobIndex !== -1) {
                jobList.splice(jobIndex, 1);
            }
        });
    });
}

function rgbToHex(rgb) {
    return "#" + rgb.map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}