import mainCSS from "./main.css.js";
import { getFlagName } from "./utils.js";

const style = document.createElement("style");
style.textContent = mainCSS;
document.head.appendChild(style);

export default class Aimware {
    constructor(title, options) {
        this.title = title;
        this.options = options;
        this.elements = {};

        const Aimware = this;

        this.window = OWOP.windowSys.addWindow(new OWOP.windowSys.class.window(Aimware.title, {
			closeable: false
		}, function (win) {
            const container = win.container;
            container.id = "window-aimware";
            container.style.cssText = `
                overflow-y: auto;
                -o-border-image: url(/img/window_in.png) 5 repeat;
                overflow: hidden;
                width: ${Aimware.options.width}px;
	            height: ${Aimware.options.height}px;
            `;
            container.parentNode.firstChild.remove();
            container.classList = '';

            container.parentNode.style.cssText = `
                position: absolute;
                pointer-events: initial;
                background-color: rgb(17, 19, 20);
                border: 5px solid rgb(17, 19, 20);
                border-image: none;
                box-shadow: transparent 0px 0px 0px 0px;
                z-index: 100;
                width: unset;
                height: unset;
            `;

            container.innerHTML = `
<div id="aimware-topbar">
	<div id="aimware-title">
		<label style="font-size: 20px; color: rgb(240, 240, 240); font-weight: 500px; margin-left: 20px; line-height: 40px;">owopfuck</label>
		<label style="font-size: 20px; color: rgb(97, 109, 212); font-weight: 500px; line-height: 40px; margin-left: -10px;">.v2</label>
	</div>
	<div id="aimware-tablist"></div>
</div>
<div id="aimware-content"></div>`;
        }).move(Aimware.options.x, Aimware.options.y));

        if(options.keybind) {
            document.addEventListener("keydown", function(e) {  
                if(e.key === options.keybind) {
                    Aimware.switchVisibility(OWOP.windowSys.windows["owopfuck.v2"].container.parentNode.hidden);
                }
            });
        }

        if(!options.visible) {
            Aimware.switchVisibility(false);
        }
    }
    addTab(name) { 
        const flagName = getFlagName(name);
        const tabButton = document.createElement("button");
        tabButton.id = `aimware-tab-button-${flagName}`;
        tabButton.onclick = () => owopfuck.setTab(flagName);
        tabButton.textContent = name;
        tabButton.className = "aimware-tab-button";
        this.window.container.querySelector("#aimware-tablist").appendChild(tabButton);

        const tab = document.createElement("div");
        tab.id = `tab-${flagName}`;
        tab.className = "aimware-tab";
        this.window.container.querySelector("#aimware-content").appendChild(tab);

        return this;
    }
    switchVisibility(value) {
        OWOP.windowSys.windows["owopfuck.v2"].container.parentNode.hidden = !value;
    }
}

window.owopfuck = {
    setTab: function(tab) {
        const tabButtons = document.querySelectorAll("#aimware-tablist button");
        const tabs = document.querySelectorAll(".aimware-tab");
        tabButtons.forEach(button => {
            button.classList.remove("aimware-tab-button-active");
        });
        tabs.forEach(tabElement => {
            tabElement.hidden = true;
        });
        const activeTabButton = document.querySelector(`#aimware-tab-button-${tab}`);
        const activeTab = document.querySelector(`#tab-${tab}`);
        if (activeTabButton && activeTab) {
            activeTabButton.classList.add("aimware-tab-button-active");
            activeTab.hidden = false;
        }
    }
}