import mainCSS from "./main.css.js";
import { getFlagName } from "./utils.js";
import config from "./config.js";

const style = document.createElement("style");
style.textContent = mainCSS;
document.head.appendChild(style);

export default class Aimware {
    constructor(title, options) {
        this.title = title;
        this.options = options;

        const Aimware = this;

        this.window = OWOP.windowSys.addWindow(new OWOP.windowSys.class.window(Aimware.title, {
			closeable: false
		}, function (win) {
            const container = win.container;
            container.id = "aimware-window";
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
                <div id="aimware-content"></div>
            `;
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

                if(!sectionName.startsWith("!")) {
                    const sectionLabel = document.createElement("label");
                    sectionLabel.textContent = sectionName;
                    section.appendChild(sectionLabel);
                }

                return {
                    addLabel: name => {
                        const label = document.createElement("label");
                        label.textContent = name;
                        section.appendChild(label);
                    },
                    addButton: (name, callback) => {
                        const button = document.createElement("button");
                        button.id = `button-${getFlagName(name)}`;
                        button.textContent = name;
                        button.className = "aimware-button";
                        button.onclick = callback;
                        section.appendChild(button);
                    },
                    addToggle: (name, callback) => {
                        if(!callback) callback = () => {};

                        const value = config.getValue(name);
                        const controlGroup = document.createElement("div");
                        controlGroup.className = "control-group";

                        const label = document.createElement("label");
                        label.className = "control control-checkbox";

                        const labelText = document.createElement("label");
                        labelText.textContent = name;

                        const toggle = document.createElement("input");
                        toggle.type = "checkbox";
                        toggle.checked = value;
                        toggle.onchange = e => {
                            config.setValue(e.target.checked, name);
                            callback(e.target.checked);
                        }

                        const indicator = document.createElement("div");
                        indicator.className = "control_indicator";

                        label.appendChild(labelText);
                        label.appendChild(toggle);
                        label.appendChild(indicator);
                        controlGroup.appendChild(label);
                        section.appendChild(controlGroup);
                    },
                    addInput: (name, placeholder, callback) => {
                        if(!callback) callback = () => {};

                        const configName = name.startsWith("!") ? name.slice(1) : name;
                        const value = config.getValue(configName);
                        const inputWrapper = document.createElement("div");
                        inputWrapper.style.display = "flex";
                        inputWrapper.style.flexDirection = "column";

                        if (!name.startsWith("!")) {
                            const label = document.createElement("label");
                            label.textContent = name;
                            label.style.marginBottom = "5px";
                            inputWrapper.appendChild(label);
                        }

                        const input = document.createElement("input");
                        input.type = "text";
                        input.value = value;
                        input.placeholder = placeholder;
                        input.onchange = e => {
                            config.setValue(e.target.value, configName);
                            callback(e.target.value);
                        }
                        inputWrapper.appendChild(input);

                        section.appendChild(inputWrapper);
                    },
                    addRange: (name, min, max, callback) => {
                        if(!callback) callback = () => {};

                        const value = config.getValue(name);
                        const rangeWrapper = document.createElement("div");

                        const label = document.createElement("label");
                        label.textContent = name;

                        const rangeInput = document.createElement("input");
                        rangeInput.className = "aimware-range2";
                        rangeInput.type = "range";
                        rangeInput.min = min;
                        rangeInput.max = max;
                        rangeInput.value = value;
                        rangeInput.name = name.toLowerCase().replace(/\s/g, '');
                        rangeInput.oninput = e => {
                            numberInput.value = e.target.value;
                            config.setValue(parseInt(e.target.value), name);
                            callback(e.target.value);
                        }

                        const numberInput = document.createElement("input");
                        numberInput.id = `aimware-${name.toLowerCase().replace(/\s/g, '')}-input`;
                        numberInput.className = "aimware-rangetext";
                        numberInput.type = "number";
                        numberInput.style.marginLeft = "0px";
                        numberInput.min = min;
                        numberInput.max = max;
                        numberInput.value = value;
                        numberInput.oninput = e => {
                            rangeInput.value = e.target.value;
                            config.setValue(parseInt(e.target.value), name);
                            callback(e.target.value);
                        }

                        rangeWrapper.appendChild(label);
                        rangeWrapper.appendChild(rangeInput);
                        rangeWrapper.appendChild(numberInput);

                        section.appendChild(rangeWrapper);
                    },
                    addDropdown: (name, options, callback) => {
                        if(!callback) callback = () => {};

                        const value = config.getValue(name);
                        const dropdown = document.createElement("select");
                        dropdown.id = `dropdown-${getFlagName(name)}`;
                        dropdown.className = "aimware-dropdown";
                        dropdown.value = value;
                        dropdown.onchange = e => {
                            config.setValue(e.target.value, name);
                            callback(e.target.value);
                        }

                        options.forEach(option => {
                            const optionElement = document.createElement("option");
                            optionElement.value = option;
                            optionElement.textContent = option;
                            dropdown.appendChild(optionElement);
                        });

                        if (!name.startsWith("!")) {
                            const lastChild = section.lastElementChild;
                            if (lastChild && lastChild.tagName === "LABEL") {
                                const br = document.createElement("br");
                                section.appendChild(br);
                            }
                            const label = document.createElement("label");
                            label.textContent = name;
                            label.htmlFor = dropdown.id;
                            section.appendChild(label);
                        }

                        section.appendChild(dropdown);

                        return {
                            addOption: option => {
                                const optionElement = document.createElement("option");
                                optionElement.value = option;
                                optionElement.textContent = option;
                                dropdown.appendChild(optionElement);
                            },
                            addOptions: options => {
                                options.forEach(option => {
                                    this.addOption(option);
                                });
                            }
                        }
                    },
                    addTable: (columns, data = []) => {
                        const table = document.createElement("table");

                        const thead = document.createElement("thead");
                        const trHead = document.createElement("tr");
                        columns.forEach(column => {
                            const th = document.createElement("th");
                            th.textContent = column;
                            trHead.appendChild(th);
                        });
                        thead.appendChild(trHead);
                        table.appendChild(thead);

                        const tbody = document.createElement("tbody");
                        data.forEach(row => {
                            const tr = document.createElement("tr");
                            columns.forEach(column => {
                                const td = document.createElement("td");
                                td.textContent = row[column];
                                tr.appendChild(td);
                            });
                            tbody.appendChild(tr);
                        });
                        table.appendChild(tbody);

                        section.appendChild(table);

                        return {
                            table: table,
                            tbody: tbody,
                            findRow: criteria => {
                                const rows = Array.from(tbody.getElementsByTagName("tr"));
                                const key = Object.keys(criteria)[0];
                                const value = criteria[key];
                                const columnIndex = columns.indexOf(key);
                                if (columnIndex !== -1) {
                                    return rows.find(row => row.cells[columnIndex].innerHTML == value);
                                }
                            },
                            addRow: rowData => {
                                const tr = document.createElement("tr");
                                columns.forEach(column => {
                                    const td = document.createElement("td");
                                    td.innerHTML = rowData[column] !== undefined ? rowData[column] : 'N/A';
                                    tr.appendChild(td);
                                });
                                tbody.appendChild(tr);
                            },
                            removeRow: criteria => {
                                const rows = Array.from(tbody.getElementsByTagName("tr"));
                                const key = Object.keys(criteria)[0];
                                const value = criteria[key];
                                const columnIndex = columns.indexOf(key);
                                if (columnIndex !== -1) {
                                    const row = rows.find(row => row.cells[columnIndex].innerHTML == value);
                                    if (row) {
                                        tbody.removeChild(row);
                                    }
                                }
                            },
                            editRow: (criteria, rowData) => {
                                const rows = Array.from(tbody.getElementsByTagName("tr"));
                                const key = Object.keys(criteria)[0];
                                const value = criteria[key];
                                const columnIndex = columns.indexOf(key);
                                if (columnIndex !== -1) {
                                    const row = rows.find(row => row.cells[columnIndex].innerHTML == value);
                                    if (row) {
                                        while (row.firstChild) {
                                            row.removeChild(row.firstChild);
                                        }
                                        columns.forEach(column => {
                                            const td = document.createElement("td");
                                            td.innerHTML = rowData[column];
                                            row.appendChild(td);
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    switchVisibility(value) {
        OWOP.windowSys.windows[this.title].container.parentNode.hidden = !value;
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