import initTools from "./tools.js";
import events from "./events.js";
import AimwareUI from "./ui-library.js";
import config from "./config.js";

function initUI() {
    new AimwareUI("owopfuck.v2", {
        width: 800,
        height: 590,
        x: 165,
        y: 115,
        visible: false,
        keybind: config.getValue("MenuKey")
    })
        .addTab("Client")
        .addTab("Bot")
        .addTab("Animation Builder")
        .addTab("Botnet")
        .addTab("Proxy")
        .addTab("List")
}

function onLoad() {
    initTools();
    initUI();
}

window.onload = () => OWOP.on(events.net.world.join, onLoad);