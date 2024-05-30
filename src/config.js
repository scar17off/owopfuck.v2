/**
 * Represents a configuration handler that stores data in localStorage.
 */
class UltimateConfig {
    /**
     * Creates an instance of Config.
     * @param {string} name The key under which the config data is stored in localStorage.
     */
    constructor(name) {
        if (!localStorage[name]) localStorage[name] = "{}";
        this.name = name;

        if (localStorage[name]) {
            this.data = JSON.parse(localStorage[this.name]) || {};
        } else {
            this.data = {};
        };
    };
    
    /**
     * Sets a value in the configuration data at the specified path.
     * @param {*} value The value to set.
     * @param {...string} path The path at which to set the value.
     */
    setValue(value, ...path) {
        let current = this.data;

        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            current[key] = current[key] || {};
            current = current[key];
        }

        const lastKey = path[path.length - 1];
        current[lastKey] = value;

        this.save();
    };

    /**
     * Retrieves a value from the configuration data at the specified path.
     * @param {...string} path The path from which to retrieve the value.
     * @returns {*} The value at the specified path or undefined if not found.
     */
    getValue(...path) {
        let current = this.data;

        for (const key of path) {
            if (current[key] !== undefined) {
                current = current[key];
            } else {
                return undefined;
            };
        };

        return current;
    };

    /**
     * Saves the current state of the configuration data to localStorage.
     */
    save() {
        localStorage[this.name] = JSON.stringify(this.data);
    };
}

const config = new UltimateConfig("OWOPFUCK-V2");
export default config;

const structure = {
    "MenuKey": "F4",
    "AutoReconnect": false,
    "Bot Nickname": '',
    "Auto Login": false,
    "Bot Count": 1,
    "Wolf Move": false,
    "Instant Place": false,
    "Smart Sneaky": false,
    "Diagonal Fill": false,
    "Use Player": false,
    "Always Sleep": false
}

for (const key in structure) {
    config.setValue(structure[key], key);
}