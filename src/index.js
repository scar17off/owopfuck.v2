import initTools from "./tools.js";
import events from "./events.js";
import AimwareUI from "./ui-library.js";
import config from "./config.js";
import wsHijacking from "./ws-hijacking.js";
import OJS from "./ojs.js";
import { bots } from "./sharedState.js";

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

        ClientMain.addButton("Disconnect", () => {
            wsHijacking?.close();
        });

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

        BotMain.addInput("Bot Nickname", "Nickname", value => {
            
        });

        BotMain.addToggle("Bot AutoReconnect", value => {

        });

        BotMain.addToggle("AutoLogin", "AutoLogin", value => {

        });

        BotMain.addToggle("AutoLogin", value => {

        });

        BotMain.addRange("Bot Count", 1, 10, 1);

        function connectBot() {
            const bot = new OJS.Client({
                nickname: config.getValue("Bot Nickname"),
                autoreconnect: config.getValue("Bot AutoReconnect"),
                world: OWOP.world.name,
                unsafe: location.host == "augustberchelmann.com",
                modlogin: config.getValue("AutoLogin") ? localStorage.modlogin : undefined,
                adminlogin: config.getValue("AutoLogin") ? localStorage.adminlogin : undefined,
                ws: OWOP.net.currentServer.url,
                origin: location.origin
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
    }
}

function onLoad() {
    initTools();
    initUI();

    OWOP.chat.local("owopfuck.v2 loaded! Use F2 to open the menu.");
}

window.onload = () => OWOP.on(events.net.world.join, onLoad);