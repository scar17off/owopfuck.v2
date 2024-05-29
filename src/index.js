import initTools from "./tools.js";
import events from "./events.js";
import AimwareUI from "./ui-library.js";
import config from "./config.js";
import OJS from "./OJS.js";
import bots from "./sharedState.js";
import socket from "./ws-hijacking.js";
import { getLocalPlayer } from "./utils.js";

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
						'Origin': location.origin,
						'Referer': document.referrer
					},
					origin: location.origin
				})
            });

            bot.on("close", () => {
                bots.splice(bots.indexOf(bot), 1);
            });

            bots.push(bot);
        }
        
        BotMain.addButton("Connect", () => {
            for(let i = 0; i < config.getValue("Bot Count"); i++) connectBot();
        });

        BotMain.addButton("Disconnect", () => {
            for(let i in bots) bots[i].net.ws.close();
        });

        BotMain.addLabel("Chat");

        BotMain.addInput('!Message', "Message");
        BotMain.addButton("Send", () => {
            for(let i in bots.filter(bot => !bot.clientOptions.localplayer)) bots[i].chat.send(config.getValue("Chat"));
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
    }
    {
        const AnimationBuilder = UI.addTab("Animation Builder");
    }
    {
        const Botnet = UI.addTab("Botnet");
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
            if(bots.filter(bot => bot.player.id == ID).length > 0) {
                botsTable.addRow({ ID, X: 0, Y: 0, RGB: createColorDiv("0,0,0") });
                return;
            }
            playersTable.addRow({ ID, X: 0, Y: 0, RGB: createColorDiv("0,0,0") });
        });

        client.on("update", player => {
            if(bots.filter(bot => bot.player.id == player.id).length > 0) {
                botsTable.editRow({ ID: player.id }, { ID: player.id, X: player.x, Y: player.y, RGB: createColorDiv(player.rgb || "0,0,0") });
                return;
            }
            playersTable.editRow({ ID: player.id }, { ID: player.id, X: player.x, Y: player.y, RGB: createColorDiv(player.rgb || "0,0,0") });
        });

        client.on("disconnect", ID => {
            if(bots.filter(bot => bot.player.id == ID).length > 0) {
                botsTable.removeRow({ ID });
                return;
            }
            playersTable.removeRow({ ID });
        });

        function createColorDiv(rgb) {
            const div = document.createElement('div');
            div.style.width = '20px';
            div.style.height = '20px';
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