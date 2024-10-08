import EventEmitter from "./EventEmitter.js";
import config from "../core/config.js";
import { BotNetReplicator } from "../core/botnet.js";

/**
 * Logs an error message with red color formatting in the console.
 * @param {string} m - The message to log as an error.
 */
const error = m => console.error("%c " + m, "color: #ff0000");

/**
 * Represents a system to manage chunks of data.
 */
class ChunkSystem {
    /**
     * Constructs a new ChunkSystem instance.
     */
    constructor() {
        this.chunks = [];
        this.chunkProtected = [];
    }

    /**
     * Sets a chunk at the specified coordinates.
     * @param {number} x - The x-coordinate of the chunk.
     * @param {number} y - The y-coordinate of the chunk.
     * @param {Array} data - The data to set in the chunk.
     * @returns {Array|undefined} The data set in the chunk or undefined if failed.
     */
    setChunk(x, y, data) {
        if(!data || typeof x !== "number" || typeof y !== "number") return error("ChunkSystem.setChunk: failed to set chunk (no data or invalid coords).");
        if(data.constructor.name !== "Array") data = Array.from(data);
        if(!this.chunks[x]) this.chunks[x] = [];

        return this.chunks[x][y] = data;
    }

    /**
     * Retrieves a chunk at the specified coordinates.
     * @param {number} x - The x-coordinate of the chunk.
     * @param {number} y - The y-coordinate of the chunk.
     * @param {boolean} raw - If true, uses raw coordinates; otherwise, calculates based on chunk size.
     * @returns {Array|undefined} The chunk data or undefined if not found.
     */
    getChunk(x, y, raw) {
        if(!raw) {
            x = Math.floor(x / Client.options.chunkSize);
            y = Math.floor(y / Client.options.chunkSize);
        };
        if(!this.chunks[x]) return;
        return this.chunks[x][y];
    }

    /**
     * Removes a chunk at the specified coordinates.
     * @param {number} x - The x-coordinate of the chunk.
     * @param {number} y - The y-coordinate of the chunk.
     * @returns {boolean} True if the chunk was removed, false otherwise.
     */
    removeChunk(x, y) {
        if(!this.chunks[x]) return false;
        if(!this.chunks[x][y]) return false;

        this.chunks[x].splice(y, 1);
        return true;
    }

    /**
     * Sets a pixel within a chunk.
     * @param {number} x - The x-coordinate of the pixel.
     * @param {number} y - The y-coordinate of the pixel.
     * @param {Array} rgb - The RGB color of the pixel.
     * @returns {boolean} True if the pixel was set, false otherwise.
     */
    setPixel(x, y, rgb) {
        if(!rgb || typeof rgb !== "object" || typeof x !== "number" || typeof y !== "number") return error("ChunkSystem.setPixel: failed to set pixel (no/wrong rgb or invalid coords).");
        const chunkX = Math.floor(x / Client.options.chunkSize);
        const chunkY = Math.floor(y / Client.options.chunkSize);
        if(!this.chunks[chunkX]) return false;
        const chunk = this.chunks[chunkX][chunkY];
        if(!chunk) return false;
        const getIbyXY = (x, y, w) => (y * w + x) * 3;
        const i = getIbyXY(x & Client.options.chunkSize - 1, y & Client.options.chunkSize - 1, Client.options.chunkSize);
        chunk[i] = rgb[0];
        chunk[i + 1] = rgb[1];
        chunk[i + 2] = rgb[2];

        return true;
    }

    /**
     * Retrieves a pixel from a chunk.
     * @param {number} x - The x-coordinate of the pixel.
     * @param {number} y - The y-coordinate of the pixel.
     * @returns {Array} The RGB color of the pixel.
     */
    getPixel(x, y) {
        if(typeof x !== "number" || typeof y !== "number") return error("ChunkSystem.getPixel: failed to get pixel (invalid coords).");
        const chunkX = Math.floor(x / Client.options.chunkSize);
        const chunkY = Math.floor(y / Client.options.chunkSize);
        if(!this.chunks[chunkX]) return;
        const chunk = this.chunks[chunkX][chunkY];
        const getIbyXY = (x, y, w) => (y * w + x) * 3;
        const i = getIbyXY(x & Client.options.chunkSize - 1, y & Client.options.chunkSize - 1, Client.options.chunkSize);

        return [chunk[i], chunk[i + 1], chunk[i + 2]];
    }

    /**
     * Protects a chunk from being modified.
     * @param {number} x - The x-coordinate of the chunk.
     * @param {number} y - The y-coordinate of the chunk.
     * @returns {boolean} True if the chunk was protected, false otherwise.
     */
    protectChunk(x, y) {
        if(typeof x !== "number" || typeof y !== "number") return error("ChunkSystem.protectChunk: failed to protect chunk (invalid coords).");
        if(!this.chunkProtected[x]) this.chunkProtected[x] = [];

        this.chunkProtected[x][y] = true;
        return true;
    }

    /**
     * Removes protection from a chunk.
     * @param {number} x - The x-coordinate of the chunk.
     * @param {number} y - The y-coordinate of the chunk.
     * @returns {boolean} True if the protection was removed, false otherwise.
     */
    unProtectChunk(x, y) {
        if(typeof x !== "number" || typeof y !== "number") return error("ChunkSystem.unprotectChunk: failed to unprotect chunk (invalid coords).");
        if(!this.chunkProtected[x]) return false;
        this.chunkProtected[x][y] = false;

        return true;
    }

    /**
     * Checks if a chunk is protected.
     * @param {number} x - The x-coordinate of the chunk.
     * @param {number} y - The y-coordinate of the chunk.
     * @returns {boolean} True if the chunk is protected, false otherwise.
     */
    isProtected(x, y) {
        if(typeof x !== "number" || typeof y !== "number") return error("ChunkSystem.isProtected: failed to check (invalid coords).");
        if(!this.chunkProtected[x]) return false;

        return Boolean(this.chunkProtected[x][y]);
    }
}
const Chunks = new ChunkSystem();
class Client extends EventEmitter {
    /**
     * @param {Object} options Options for connection
     * @param {string} [options.ws=wss://ourworldofpixels.com] Websocket server address
     * @param {?number} options.id ID for logging. If not set, OWOP ID will be used
     * @param {string} [options.world=main] World name
     * @param {?boolean} options.noLog No logging
     * @param {?boolean} options.reconnect Reconnect if disconnected
     * @param {?string} options.adminlogin Admin login
     * @param {?string} options.modlogin Mod login
     * @param {?string} options.pass Pass for world
     * @param {?string} options.captchapass Captcha pass
     * @param {?string} options.captchaSiteKey Captcha site key
     * @param {?string} options.teleport Teleport on 'teleport' opcode
     * @param {number} [options.reconnectTime=5000] Reconnect time (ms) after disconnect
     * @param {?boolean} options.unsafe Use methods that are supposed to be only for admin or moderator
     * @param {?boolean} options.simpleChunks Use original OWOP chunks instead of OJS
     * @param {WebSocket} options.ws WebSocket connection instance
     * @param {?boolean} [options.localplayer=false] LocalPlayer WebSocket
     * @param {?string} [options.proxy] Proxy name
     * @param {?string} [options.proxyType] Proxy type
     * @param {?string} [options.zombie] Zombie ID
     * @param {?string} [options.connection] Connection type
     */
    constructor(options = {}) {
        super();
        
        if(!options.reconnectTime) options.reconnectTime = 5000;
        if(!options.captchaSiteKey) options.captchaSiteKey = "6LcgvScUAAAAAARUXtwrM8MP0A0N70z4DHNJh-KI";
        if(!options.localplayer) options.localplayer = false;

        if(!options.ws) {
            if(options.zombie) {
                options.connection = '🧟';
                options.ws = new BotNetReplicator(options.zombie);
            } else if(options.proxy) {
                options.connection = '📡';
                options.ws = new WebSocket(`wss://${options.proxy}.${options.proxyType}/?wss=${OWOP.net.currentServer.url}&origin=${location.origin}`);
            } else {
                options.ws = new WebSocket(OWOP.net.currentServer.url, null, {
                    headers: {
                    "Origin": location.origin,
                    "Referer": document.referrer
                },
                    origin: location.origin
                });
            }
        }

        if(!options.connection) options.connection = '🖥️';
        
        const OJS = this;
        this.clientOptions = options;
        this.RANK = {
            ADMIN: 3,
            MODERATOR: 2,
            USER: 1,
            NONE: 0
        }
        this.options = {
            chunkSize: 16,
            maxChatBuffer: 256,
            maxMessageLength: {
                0: 128,
                1: 128,
                2: 512,
                3: 16384
            },
            maxWorldNameLength: 24,
            worldBorder: 0xFFFFFF,
            opcode: {
                setId: 0,
                worldUpdate: 1,
                chunkLoad: 2,
                teleport: 3,
                setRank: 4,
                captcha: 5,
                setPQuota: 6,
                chunkProtected: 7
            },
            captchaState: {
                CA_WAITING: 0,
                CA_VERIFYING: 1,
                CA_VERIFIED: 2,
                CA_OK: 3,
                CA_INVALID: 4
            },
            captchaStateNames: {
                0: "WAITING",
                1: "VERIFYING",
                2: "VERIFIED",
                3: "OK",
                4: "INVALID"
            }
        }
        if(window.document === undefined) {
            this.options.misc = {
                chatVerification: String.fromCharCode(10),
                tokenVerification: "CaptchA",
                worldVerification: 25565
            }
        } else this.options.misc = {
            chatVerification: "\n",
            tokenVerification: 'CaptchA',
            worldVerification: 25565
        }
        OJS.chat = {
            send(msg) {
                if(typeof OJS.player.rank !== "number") return false;
                msg = OJS.chat.sendModifier(msg);
                OJS.net.ws.send(msg.substr(0, OJS.options.maxMessageLength[OJS.player.rank]) + OJS.options.misc.chatVerification);
                return true;
            },
            local(msg) {
                OJS.util.log(msg)
            },
            sendModifier(msg) {
                return msg
            },
            recvModifier(msg) {
                return msg
            },
            messages: []
        }
        OJS.world = {
            join(world = "main") {
                if(OJS.net.ws.readyState !== 1 || !OJS.net.isWebsocketConnected) return false;
                let ints = [];
                world = world.toLowerCase();
                for (let i = 0; i < world.length && i < 24; i++) {
                    let charCode = world.charCodeAt(i);
                    if((charCode < 123 && charCode > 96) || (charCode < 58 && charCode > 47) || charCode === 95 || charCode === 46)
                        ints.push(charCode);
                }
                let array = new ArrayBuffer(ints.length + 2);
                let dv = new DataView(array);
                for (let i = ints.length; i--;) dv.setUint8(i, ints[i]);
                dv.setUint16(ints.length, OJS.options.misc.worldVerification, true);
                OJS.net.ws.send(array);
                OJS.util.log(`Joining world: ${world}`);
                OJS.world.name = world;
                return true;
            },
            leave() {
                OJS.net.isWorldConnected = false;
                OJS.net.isWebsocketConnected = false;
                OJS.net.ws.close();
            },
            destroy() {
                OJS.net.isWorldConnected = false;
                OJS.net.isWebsocketConnected = false;
                OJS.net.destroyed = true;
                OJS.net.ws.close();
                OJS.emit("destroy");
            },
            move(x = 0, y = 0) {
                if(OJS.net.ws.readyState !== 1 || !OJS.net.isWebsocketConnected) return false;
                OJS.player.x = x;
                OJS.player.y = y;
                x *= 16;
                y *= 16;
                const dv = new DataView(new ArrayBuffer(12));
                OJS.player.worldX = x;
                OJS.player.worldY = y;
                dv.setInt32(0, x, true);
                dv.setInt32(4, y, true);
                dv.setUint8(8, OJS.player.color[0]);
                dv.setUint8(9, OJS.player.color[1]);
                dv.setUint8(10, OJS.player.color[2]);
                dv.setUint8(11, OJS.player.tool);
                OJS.net.ws.send(dv.buffer);
                return true;
            },
            setPixel(x = OJS.player.x, y = OJS.player.y, color = OJS.player.color) {
                if (OJS.net.ws.readyState !== 1 || !OJS.net.isWebsocketConnected || OJS.player.rank === OJS.RANK.NONE) return false;
                if (!OJS.net.bucket.canSpend(config.getValue("Minimum Quota"))) return false;

                const oldX = OJS.player.x,
                    oldY = OJS.player.y;

                if(config.getValue("Smart Sneaky")) {
                    let distx = Math.trunc(x / Client.options.chunkSize) - Math.trunc(oldX / Client.options.chunkSize);
                    distx *= distx;
                    let disty = Math.trunc(y / Client.options.chunkSize) - Math.trunc(oldY / Client.options.chunkSize);
                    disty *= disty;

                    let dist = Math.sqrt(distx + disty);

                    if(dist >= 3) OJS.world.move(x, y);
                } else {
                    OJS.world.move(x, y);
                }

                const dv = new DataView(new ArrayBuffer(11));
                dv.setInt32(0, x, true);
                dv.setInt32(4, y, true);
                dv.setUint8(8, color[0]);
                dv.setUint8(9, color[1]);
                dv.setUint8(10, color[2]);
                OJS.player.color = color;
                OJS.net.ws.send(dv.buffer);
                if(config.getValue("Wolf Move")) OJS.world.move(oldX, oldY);
                return true;
            },
            setTool(id = 0) {
                if(OJS.net.ws.readyState !== 1 || !OJS.net.isWebsocketConnected) return false;
                OJS.player.tool = id;
                const dv = new DataView(new ArrayBuffer(12));
                dv.setInt32(0, OJS.player.worldX, true);
                dv.setInt32(4, OJS.player.worldY, true);
                dv.setUint8(8, OJS.player.color[0]);
                dv.setUint8(9, OJS.player.color[1]);
                dv.setUint8(10, OJS.player.color[2]);
                dv.setUint8(11, id);
                OJS.net.ws.send(dv.buffer);
                return true;
            },
            setColor(color = [0, 0, 0]) {
                if(OJS.net.ws.readyState !== 1 || !OJS.net.isWebsocketConnected) return false;
                OJS.player.color = color;
                const dv = new DataView(new ArrayBuffer(12));
                dv.setInt32(0, OJS.player.worldX, true);
                dv.setInt32(4, OJS.player.worldY, true);
                dv.setUint8(8, OJS.player.color[0]);
                dv.setUint8(9, OJS.player.color[1]);
                dv.setUint8(10, OJS.player.color[2]);
                dv.setUint8(11, OJS.player.tool);
                OJS.net.ws.send(dv.buffer);
                return true;
            },
            protectChunk(x = OJS.player.x, y = OJS.player.y, newState = 1) {
                if(OJS.net.ws.readyState !== 1 || !OJS.net.isWebsocketConnected) return false;
                if(OJS.player.rank < OJS.RANK.ADMIN && !options.unsafe) return false;
                const dv = new DataView(new ArrayBuffer(10));
                dv.setInt32(0, x, true);
                dv.setInt32(4, y, true);
                dv.setUint8(8, newState);
                OJS.net.ws.send(dv.buffer);
                return true;
            },
            clearChunk(x = OJS.player.x, y = OJS.player.y, rgb = OJS.player.color) {
                if(OJS.player.rank === OJS.RANK.ADMIN || options.unsafe) {
                    const dv = new DataView(new ArrayBuffer(13));
                    dv.setInt32(0, x, true);
                    dv.setInt32(4, y, true);
                    dv.setUint8(8, rgb[0]);
                    dv.setUint8(9, rgb[1]);
                    dv.setUint8(10, rgb[2]);
                    OJS.net.ws.send(dv.buffer);
                    return true;
                }
                return false;
            },
            requestChunk(x, y, inaccurate) {
                if(options.simpleChunks) return true;
                if(OJS.net.ws.readyState !== 1 || !OJS.net.isWebsocketConnected) return false;
                if(typeof x !== "number" && typeof y !== "number") {
                    x = OJS.player.x;
                    y = OJS.player.y;
                    inaccurate = true;
                };
                if(inaccurate) {
                    x = Math.floor(x / OJS.options.chunkSize);
                    y = Math.floor(y / OJS.options.chunkSize);
                };
                let wb = OJS.options.worldBorder;
                if(x > wb || y > wb || x < ~wb || y < ~wb) return;
                let dv = new DataView(new ArrayBuffer(8));
                dv.setInt32(0, x, true);
                dv.setInt32(4, y, true);
                OJS.net.ws.send(dv.buffer);
                return true;
            },
            getPixel(x = OJS.player.x, y = OJS.player.y) {
                if(options.simpleChunks) return OWOP.world.getPixel(x, y);
                // It'll return undefined on unknown chunk but it'll request it, so you'll need to getPixel(x, y) again. I suggest you requesting chunks manually and getting them from ChunkSystem.
                if(!Chunks.getChunk(x, y)) OJS.world.requestChunk(x, y, true);
                return Chunks.getPixel(x, y);
            }
        }
        OJS.captcha = {
            usedKeys: [],
            login(key) {
                if(!OJS.net.ws ||
                    OJS.net.ws.readyState !== 1) return false;
                if(OJS.captcha.usedKeys.includes(key)) {
                    return false
                } else if(!key.startsWith(OJS.options.misc.tokenVerification)) {
                    OJS.captcha.usedKeys.push(key);
                }
                OJS.net.ws.send(OJS.options.misc.tokenVerification + key);
                OJS.captcha.usedKeys.push(key);
                return true;
            },
            renderCaptcha() {
                return new Promise(resolve => {
                    OWOP.windowSys.addWindow(new OWOP.windowSys.class.window(`Verification Needed: ${new Date().toUTCString()}`, {
                        closeable: true,
                        moveable: true,
                        centered: true
                    }, win => {
                        win.container.parentNode.style["z-index"] = "101";
                        
                        grecaptcha.render(win.addObj(OWOP.util.mkHTML('div', {})), {
                            theme: 'dark',
                            sitekey: OJS.clientOptions.captchaSiteKey,
                            callback: token => {
                                win.close();
                                resolve(token);
                            }
                        });
                    }));
                });
            },
            async renderAndLogin() {
                OJS.captcha.login(await OJS.captcha.renderCaptcha());
            }
        }
        OJS.player = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            tool: 0,
            rank: null,
            id: null,
            color: [0, 0, 0]
        }
        OJS.players = {};
        OJS.net = {
            isWebsocketConnected: false,
            isWorldConnected: false,
            destroyed: false,
            bucket: new Bucket(32, 4),
            async dataHandler(data) {
                if(typeof data !== "object") return error("Client.net.dataHandler: data is not object.");
                const realData = data;
                data = new DataView(data);
                const opcode = data.getUint8(0);
                switch (opcode) {
                    case OJS.options.opcode.setId:
                        {
                            OJS.player.id = data.getUint32(1, true);
                            OJS.net.isWorldConnected = true;
                            if(typeof OJS.player.rank !== "number") OJS.player.rank = OJS.RANK.NONE;
                            OJS.util.log(`Joined world '${OJS.world.name}' and got id '${data.getUint32(1, true)}'`, "color: #00ff00");
                            if(options.adminlogin) OJS.chat.send("/adminlogin " + options.adminlogin);
                            if(options.modlogin) OJS.chat.send("/modlogin " + options.modlogin); // Not working at the moment
                            if(options.pass) OJS.chat.send("/pass " + options.pass);
                            OJS.emit("join", OJS.world.name);
                            OJS.emit("id", data.getUint32(1, true));
                            break;
                        }
                    case OJS.options.opcode.worldUpdate:
                        {
                            // Players
                            let updated = false;
                            let updates = {};
                            for (let i = data.getUint8(1); i--;) {
                                updated = true;
                                let pid = data.getUint32(2 + i * 16, true);
                                if(pid === OJS.player.id) continue;
                                let pmx = data.getUint32(2 + i * 16 + 4, true);
                                let pmy = data.getUint32(2 + i * 16 + 8, true);
                                let pr = data.getUint8(2 + i * 16 + 12);
                                let pg = data.getUint8(2 + i * 16 + 13);
                                let pb = data.getUint8(2 + i * 16 + 14);
                                let ptool = data.getUint8(2 + i * 16 + 15);
                                updates[pid] = {
                                    x: pmx,
                                    y: pmy,
                                    rgb: [pr, pg, pb],
                                    tool: ptool
                                }
                            }
                            if(updated) {
                                for (let i in updates) {
                                    if(!OJS.players[i]) OJS.emit("connect", i);
                                    OJS.players[i] = {
                                        id: i,
                                        x: updates[i].x >> 4,
                                        y: updates[i].y >> 4,
                                        rgb: updates[i].rgb,
                                        tool: updates[i].tool
                                    }
                                    OJS.emit("update", OJS.players[i]);
                                }
                            }
                            // Pixels
                            let off = 2 + data.getUint8(1) * 16;
                            for (let i = data.getUint16(off, true), j = 0; j < i; j++) {
                                let
                                    x = data.getInt32(2 + off + j * 15 + 4, true),
                                    y = data.getInt32(2 + off + j * 15 + 8, true);
                                let r = data.getUint8(2 + off + j * 15 + 12),
                                    g = data.getUint8(2 + off + j * 15 + 13),
                                    b = data.getUint8(2 + off + j * 15 + 14);
                                OJS.emit('pixel', x, y, [r, g, b]);
                                Chunks.setPixel(x, y, [r, g, b]);
                            }
                            // Disconnects
                            off += data.getUint16(off, true) * 15 + 2;
                            for (let k = data.getUint8(off); k--;) {
                                let dpid = data.getUint32(1 + off + k * 4, true);
                                if(OJS.players[dpid]) {
                                    OJS.emit("disconnect", OJS.players[dpid]);
                                    delete OJS.players[dpid];
                                }
                            }
                            break;
                        }
                    case OJS.options.opcode.chunkLoad:
                        {
                            let chunkX = data.getInt32(1, true);
                            let chunkY = data.getInt32(5, true);
                            let locked = !!data.getUint8(9);
                            let u8data = new Uint8Array(realData, 10, realData.byteLength - 10);
                            let decompressed = OJS.util.decompress(u8data)
                            Chunks.setChunk(chunkX, chunkY, decompressed);
                            if(locked) Chunks.protectChunk(chunkX, chunkY);
                            OJS.emit('chunk', chunkX, chunkY, decompressed, locked);
                            break;
                        }
                    case OJS.options.opcode.teleport:
                        {
                            if(!options.teleport) break;
                            const x = data.getInt32(1, true);
                            const y = data.getInt32(5, true);
                            OJS.world.move(x, y);
                            OJS.emit("teleport", x, y);
                            break;
                        }
                    case OJS.options.opcode.setRank:
                        {
                            OJS.player.rank = data.getUint8(1);
                            OJS.emit("rank", data.getUint8(1));
                            break;
                        }
                    case OJS.options.opcode.captcha:
                        {
                            const id = data.getUint8(1);
                            switch(id) {
                                case OJS.options.captchaState.CA_WAITING:
                                    OJS.util.log("CaptchaState: WAITING (0)", "color: #ffff00");
                                    if(options.captchapass) {
                                        OJS.net.ws.send(OJS.options.misc.tokenVerification + "LETMEINPLZ" + options.captchapass);
                                        OJS.util.log("Used captchapass.", "color: #00ff00");
                                    } else if(options.renderCaptcha) this.net.ws.send(OWOP.options.serverAddress[0].proto.misc.tokenVerification + (await this.captcha.renderCaptcha()));
                                    break;
                                case OJS.options.captchaState.CA_VERIFYING:
                                    OJS.util.log("CaptchaState: VERIFYING (1)", "color: #ffff00");
                                    break;
                                case OJS.options.captchaState.CA_VERIFIED:
                                    OJS.util.log("CaptchaState: VERIFIED (2)", "color: #00ff00");
                                    break;
                                case OJS.options.captchaState.CA_OK:
                                    OJS.util.log("CaptchaState: OK (3)", "color: #00ff00");
                                    OJS.world.join(options.world);
                                    break;
                                case OJS.options.captchaState.CA_INVALID:
                                    OJS.util.log("CaptchaState: INVALID (4)", "color: #ff0000");
                                    OJS.util.log("Captcha failed. Websocket is invalid now.", "color: #ff0000");
                                    OJS.net.destroyed = true;
                                    OJS.net.isWorldConnected = false;
                                    OJS.net.isWebsocketConnected = false;
                                    OJS.emit("destroy");
                                    break;
                            }

                            OJS.emit("captcha", id);
                            (async () => {
                                if(id === 0) await OJS.captcha.renderAndLogin(true);
                            })();
                            break;
                        }
                    case OJS.options.opcode.setPQuota:
                        {
                            let rate = data.getUint16(1, true);
                            let per = data.getUint16(3, true);
                            if(rate === 0 && per === 0) return;
                            OJS.net.bucket = new Bucket(rate, per);
                            OJS.emit("pquota", rate, per);
                            OJS.util.log(`New PQuota: ${rate}x${per}`);
                            break;
                        }
                    case OJS.options.opcode.chunkProtected:
                        {
                            let cx = data.getInt32(1, true);
                            let cy = data.getInt32(5, true);
                            let newState = data.getUint8(9);
                            if(newState) Chunks.protectChunk(cx, cy);
                            else Chunks.unProtectChunk(cx, cy);
                            OJS.emit("chunkProtect", cx, cy, newState);
                            break;
                        }
                }
            },
            messageHandler(data) {
                if(typeof data !== "string") return error("Client.net.messageHandler: data is not string.");
                if(data.startsWith("You are banned")) {
                    OJS.util.log("Got ban message.", "color: #ff0000");
                    OJS.emit("destroy");
                    OJS.net.isWorldConnected = false;
                    OJS.net.isWebsocketConnected = false;
                    return OJS.net.destroyed = true;
                };
                if(data.startsWith("DEV")) OJS.util.log("[DEV] " + data.slice(3));
                if(data.startsWith("<")) return;
                data = OJS.chat.recvModifier(data);
                const nick = data.split(":")[0];
                OJS.emit("message", data);
                OJS.chat.messages.push(data);
                if(OJS.chat.messages.length > OJS.options.maxChatBuffer) OJS.chat.messages.shift();
            }
        }
        void
        function makeSocket() {
            let ws = options.ws;

            const onOpen = () => {
                OJS.util.log("WebSocket connected!", "color: #00ff00");
                OJS.net.isWebsocketConnected = true;
                OJS.emit("open");
            }

            const onMessage = msg => {
                OJS.emit("rawMessage", msg.data || msg);

                if (typeof msg.data === "string" || typeof msg === "string") {
                    OJS.net.messageHandler(msg.data || msg);
                } else if (typeof msg.data === "object" || typeof msg === "object") {
                    OJS.net.dataHandler(msg.data || msg);
                }
            }

            const onClose = () => {
                OJS.emit("close");
                OJS.util.log("WebSocket disconnected!", "color: #ff0000");
                OJS.net.isWorldConnected = false;
                OJS.net.isWebsocketConnected = false;
                
                if (options.reconnect && !OJS.net.destroyed) {
                    setTimeout(makeSocket, options.reconnectTime);
                }
            }

            const onError = () => {
                OJS.util.log("WebSocket error!", "color: #ff0000");
                OJS.net.isWorldConnected = false;
                OJS.net.isWebsocketConnected = false;
            }

            if (!options.zombie) {
                ws.binaryType = "arraybuffer";
                ws.onopen = onOpen;
                ws.onmessage = onMessage;
                ws.onclose = onClose;
                ws.onerror = onError;
            } else {
                ws.on("open", onOpen);
                ws.on("message", onMessage);
                ws.on("close", onClose);
                ws.on("error", onError);
            }

            OJS.net.ws = ws;
        }();
        OJS.util = {
            log(...msg) {
                if(options.noLog) return;
                if(options.id) console.log(`[${options.id}] ${msg}`);
                else if(OJS.player.id) console.log(`%c [${OJS.player.id}] ` + msg[0], msg[1]);
                else console.log(`%c [?] ` + msg[0], msg[1]);
            },
            decompress(u8arr) {
                // I'm not touching this shit anymore.
                var originalLength = u8arr[1] << 8 | u8arr[0];
                var u8decompressedarr = new Uint8Array(originalLength);
                var numOfRepeats = u8arr[3] << 8 | u8arr[2];
                var offset = numOfRepeats * 2 + 4;
                var uptr = 0;
                var cptr = offset;
                for (var i = 0; i < numOfRepeats; i++) {
                    var currentRepeatLoc = (u8arr[4 + i * 2 + 1] << 8 | u8arr[4 + i * 2]) + offset;
                    while (cptr < currentRepeatLoc) {
                        u8decompressedarr[uptr++] = u8arr[cptr++];
                    }
                    var repeatedNum = u8arr[cptr + 1] << 8 | u8arr[cptr];
                    var repeatedColorR = u8arr[cptr + 2];
                    var repeatedColorG = u8arr[cptr + 3];
                    var repeatedColorB = u8arr[cptr + 4];
                    cptr += 5;
                    while (repeatedNum--) {
                        u8decompressedarr[uptr] = repeatedColorR;
                        u8decompressedarr[uptr + 1] = repeatedColorG;
                        u8decompressedarr[uptr + 2] = repeatedColorB;
                        uptr += 3;
                    }
                }
                while (cptr < u8arr.length) {
                    u8decompressedarr[uptr++] = u8arr[cptr++];
                }
                return u8decompressedarr;
            }
        }
        if(options.unsafe) OJS.util.log("Using 'unsafe' option.", "color: #ffff00");
    }
}

/**
 * Represents a rate limiter that allows actions up to a certain rate and then restricts further actions until enough time has passed.
 */
class Bucket {
    /**
     * Creates an instance of Bucket.
     * @param {number} rate The maximum number of actions allowed per time period.
     * @param {number} time The time period in seconds for the rate limit.
     * @param {boolean} [infinite=false] Whether the bucket has an infinite allowance.
     */
    constructor(rate, time, infinite) {
        /** @type {number} The timestamp of the last check for rate limiting. */
        this.lastCheck = Date.now();
        /** @type {number} The current allowance of actions within the time period. */
        this.allowance = rate;
        /** @type {number} The maximum number of actions allowed per time period. */
		this.rate = rate;
        /** @type {number} The time period in seconds for the rate limit. */
        this.time = time;
        /** @type {boolean} Whether the bucket has an infinite allowance. */
		this.infinite = infinite || false;
	}

    /**
     * Updates the current allowance based on the time elapsed since the last check.
     */
	update() {
		this.allowance += (Date.now() - this.lastCheck) / 1000 * (this.rate / this.time);
		this.lastCheck = Date.now();

		if(this.allowance > this.rate) {
			this.allowance = this.rate;
		}
	}

    /**
     * Determines if a specified number of actions can be spent without exceeding the rate limit.
     * @param {number} count The number of actions to spend.
     * @returns {boolean} True if the actions can be spent, false otherwise.
     */
	canSpend(count) {
		if(this.infinite) {
			return true;
		}

		this.update();

		if(this.allowance < count) {
			return false;
		}

		this.allowance -= count;

		return true;
	}

    /**
     * Calculates the time required to restore the bucket's allowance to a specified amount or its maximum rate if no amount is specified.
     * @param {number} [amount=this.rate] The amount of allowance to restore.
     * @returns {number} The time in seconds until the specified allowance is restored.
     */
    getTimeToRestore(amount = this.rate) {
        const targetAllowance = Math.min(this.rate, this.allowance + amount);
        if (this.allowance >= targetAllowance) return 0;
        return (targetAllowance - this.allowance) / (this.rate / this.time);
    }

    /**
     * Waits asynchronously until the bucket's allowance is restored to a specified amount or fully if no amount is specified.
     * @param {number} [amount=this.rate] The amount of allowance to restore.
     */
    async waitUntilRestore(amount = this.rate) {
        const restoreTime = this.getTimeToRestore(amount) * 1000;
        await new Promise(resolve => setTimeout(resolve, restoreTime));
    }
}

Client.RANK = {
    ADMIN: 3,
    MODERATOR: 2,
    USER: 1,
    NONE: 0
}

Client.options = {
    chunkSize: 16,
    maxChatBuffer: 256,
    maxMessageLength: {
        0: 128,
        1: 128,
        2: 512,
        3: 16384
    },
    maxWorldNameLength: 24,
    worldBorder: 0xFFFFFF,
    opcode: {
        setId: 0,
        worldUpdate: 1,
        chunkLoad: 2,
        teleport: 3,
        setRank: 4,
        captcha: 5,
        setPQuota: 6,
        chunkProtected: 7
    },
    captchaState: {
        CA_WAITING: 0,
        CA_VERIFYING: 1,
        CA_VERIFIED: 2,
        CA_OK: 3,
        CA_INVALID: 4
    },
    captchaStateNames: {
        0: "WAITING",
        1: "VERIFYING",
        2: "VERIFIED",
        3: "OK",
        4: "INVALID"
    }
}

window.onload = () => {
    if (window.document === undefined) {
        Client.options.misc = {
            chatVerification: String.fromCharCode(10),
            tokenVerification: "CaptchA",
            worldVerification: 25565
        }
    } else Client.options.misc = {
        chatVerification: OWOP.options.serverAddress[0].proto.misc.chatVerification,
        tokenVerification: OWOP.options.serverAddress[0].proto.misc.tokenVerification,
        worldVerification: OWOP.options.serverAddress[0].proto.misc.worldVerification
    }
}

/**
 * Exports the main components of the module.
 */
export default {
    Client,
    ChunkSystem,
    Chunks,
    Bucket
}