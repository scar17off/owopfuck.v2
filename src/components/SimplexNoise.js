class SimplexNoise {
    constructor(seed = Math.random()) {
        this.p = new Uint8Array(256);
        this.perm = new Uint8Array(512);
        this.permMod12 = new Uint8Array(512);
        this.grad3 = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]);
        this.F2 = 0.5 * (Math.sqrt(3) - 1);
        this.G2 = (3 - Math.sqrt(3)) / 6;

        this.setSeed(seed);
    }

    setSeed(seed) {
        const random = this.xorshift(seed);
        for (let i = 0; i < 256; i++) this.p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }
    }

    xorshift(seed) {
        let x = seed;
        return () => {
            x ^= x << 13;
            x ^= x >> 17;
            x ^= x << 5;
            return (x >>> 0) / 4294967296;
        };
    }

    noise2D(xin, yin) {
        const n0 = this.dot2D(this.grad3[this.permMod12[this.perm[(xin + this.perm[(yin & 255)]) & 255]] * 3], xin, yin);
        const n1 = this.dot2D(this.grad3[this.permMod12[this.perm[(xin + 1 + this.perm[((yin + 1) & 255)]) & 255]] * 3], xin - 1 + this.G2, yin - 1 + this.G2);
        const n2 = this.dot2D(this.grad3[this.permMod12[this.perm[(xin + this.perm[((yin + 1) & 255)]) & 255]] * 3], xin + this.G2, yin + this.G2 - 1);

        const t = 0.5 - xin * xin - yin * yin;
        return 70 * (t < 0 ? 0 : t * t * t * t * (n0 + (n1 - n0) * 6 * t * (1 - t) + (n2 - n0) * t * (1 - t) * 2));
    }

    dot2D(g, x, y) {
        return g[0] * x + g[1] * y;
    }
}

export default SimplexNoise;