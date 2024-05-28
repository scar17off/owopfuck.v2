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
<div class="aimware-topbar" style="border-bottom: solid 2px #4a58c8;">
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

        return {
            addSection: sectionName => {
                const section = document.createElement("div");
                section.className = "aimware-section";
                tab.appendChild(section);

                const sectionLabel = document.createElement("label");
                sectionLabel.textContent = sectionName;
                section.appendChild(sectionLabel);

                return {
                    addButton: (name, callback) => {
                        const button = document.createElement("button");
                        button.id = `button-${getFlagName(name)}`;
                        button.textContent = name;
                        button.className = "aimware-button";
                        button.onclick = callback;
                        section.appendChild(button);
                    },
                    addToggle: (name, value, callback) => {
                        const controlGroup = document.createElement("div");
                        controlGroup.className = "control-group";

                        const label = document.createElement("label");
                        label.className = "control control-checkbox";

                        const labelText = document.createElement("label");
                        labelText.textContent = name;

                        const toggle = document.createElement("input");
                        toggle.type = "checkbox";
                        toggle.checked = value;
                        toggle.onchange = e => callback(e.target.checked);

                        const indicator = document.createElement("div");
                        indicator.className = "control_indicator";

                        label.appendChild(labelText);
                        label.appendChild(toggle);
                        label.appendChild(indicator);
                        controlGroup.appendChild(label);
                        section.appendChild(controlGroup);
                    }
                }
            }
        }
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
            tabElement.style.display = "none";
        });
        const activeTabButton = document.querySelector(`#aimware-tab-button-${tab}`);
        const activeTab = document.querySelector(`#tab-${tab}`);
        if (activeTabButton && activeTab) {
            activeTabButton.classList.add("aimware-tab-button-active");
            activeTab.style.display = "flex";
        }
    }
}