import initTools from "./tools.js";
import events from "./events.js";
import AimwareUI from "./ui-library.js";
import config from "./config.js";
import wsHijacking from "./ws-hijacking.js";

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

        ClientMain.addToggle("AutoReconnect", config.getValue("AutoReconnect"), value => {
            function onDisconnect() {
                if(getValue("autoreconnect")) {
                    setTimeout(function() {
                        document.getElementById("reconnect-btn").click();
                    }, 100);
                }
            }

            if(value) OWOP.on(events.net.disconnected, onDisconnect);
            else OWOP.off(events.net.disconnected, onDisconnect);
        });

        /* Visuals */
        const ClientVisuals = Client.addSection("Visuals");

        /* Misc */
        const ClientMisc = Client.addSection("Misc");
    }
    {
        const Bot = UI.addTab("Bot");
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