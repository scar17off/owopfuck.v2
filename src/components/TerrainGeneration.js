import SimplexNoise from './SimplexNoise';

class TerrainGeneration {
    constructor(seed = 1) {
        this.CHUNK_SIZE = 16;
        this.OCEAN_LEVEL = 0.4;
        this.SHALLOW_WATER_LEVEL = 0.2;
        this.SAND_LEVEL = 0.55;
        this.MAX_ELEVATION = 255;
        this.ISLAND_SIZE = 100;
        this.DEEP_OCEAN_LEVEL = 0.1;

        this.DEEP_OCEAN_COLOR = [0, 0, 150];
        this.DEEP_SEA_COLOR = [0, 0, 200];
        this.SHALLOW_WATER_COLOR = [0, 100, 255];
        this.SAND_COLOR = [227, 210, 159];
        this.LIGHT_GRASS_COLOR = [99, 198, 77];
        this.DARK_GRASS_COLOR = [50, 115, 69];

        this.noise = new SimplexNoise(seed);
        this.colorCache = new Map();
    }

    setSeed(seed) {
        this.noise = new SimplexNoise(seed);
    }

    generateTerrain(startX, startY, width, height) {
        const terrain = new Array(width * this.CHUNK_SIZE);
        for (let x = 0; x < width * this.CHUNK_SIZE; x++) {
            terrain[x] = new Float32Array(height * this.CHUNK_SIZE);
            for (let y = 0; y < height * this.CHUNK_SIZE; y++) {
                const worldX = startX * this.CHUNK_SIZE + x;
                const worldY = startY * this.CHUNK_SIZE + y;
                let elevation = (this.noise.noise2D(worldX / this.ISLAND_SIZE, worldY / this.ISLAND_SIZE) + 1) / 2;
                elevation = Math.pow(elevation, 1.5); // increase contrast
                terrain[x][y] = elevation * this.MAX_ELEVATION;
            }
        }
        return terrain;
    }

    getColor(elevation) {
        const key = Math.floor(elevation);
        if (this.colorCache.has(key)) return this.colorCache.get(key);

        let color;
        if (elevation < this.DEEP_OCEAN_LEVEL * this.MAX_ELEVATION) {
            color = this.DEEP_OCEAN_COLOR;
        } else if (elevation < this.SHALLOW_WATER_LEVEL * this.MAX_ELEVATION) {
            color = this.DEEP_SEA_COLOR;
        } else if (elevation < this.OCEAN_LEVEL * this.MAX_ELEVATION) {
            color = this.SHALLOW_WATER_COLOR;
        } else if (elevation < this.SAND_LEVEL * this.MAX_ELEVATION) {
            color = this.SAND_COLOR;
        } else {
            const height = (elevation - this.SAND_LEVEL * this.MAX_ELEVATION) / ((1 - this.SAND_LEVEL) * this.MAX_ELEVATION);
            color = height < 0.33 ? this.LIGHT_GRASS_COLOR : this.DARK_GRASS_COLOR;
        }
        this.colorCache.set(key, color);
        return color;
    }

    updateColor(colorName, newColor) {
        this[colorName] = newColor;
        this.colorCache.clear();
    }

    createChunk(chunkX, chunkY, terrain) {
        const chunkData = new Uint8ClampedArray(this.CHUNK_SIZE * this.CHUNK_SIZE * 4);
        for (let x = 0; x < this.CHUNK_SIZE; x++) {
            for (let y = 0; y < this.CHUNK_SIZE; y++) {
                const elevation = terrain[x][y];
                const color = this.getColor(elevation);
                const i = (y * this.CHUNK_SIZE + x) * 4;
                chunkData[i] = color[0];
                chunkData[i + 1] = color[1];
                chunkData[i + 2] = color[2];
                chunkData[i + 3] = 255; // Alpha channel
            }
        }
        return chunkData;
    }

    generateArea(startX, startY, endX, endY) {
        const width = endX - startX + 1;
        const height = endY - startY + 1;
        const terrain = this.generateTerrain(startX, startY, width, height);
        const chunks = [];

        for (let chunkX = startX; chunkX <= endX; chunkX++) {
            for (let chunkY = startY; chunkY <= endY; chunkY++) {
                const chunkTerrain = new Array(this.CHUNK_SIZE);
                for (let x = 0; x < this.CHUNK_SIZE; x++) {
                    chunkTerrain[x] = terrain[(chunkX - startX) * this.CHUNK_SIZE + x].slice(
                        (chunkY - startY) * this.CHUNK_SIZE,
                        (chunkY - startY + 1) * this.CHUNK_SIZE
                    );
                }
                const chunkData = this.createChunk(chunkX, chunkY, chunkTerrain);
                chunks.push({ x: chunkX, y: chunkY, data: chunkData });
            }
        }

        return chunks;
    }
}

export default TerrainGeneration;