const path = require("path");
const prependFile = require("prepend-file");

const userScriptHeader = `// ==UserScript==
// @name         owopfuck-v2
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Try to take over the world!
// @author       scar17off
// @match        https://b18ba020-1709-4f86-a87d-ac796cd5d2ef-00-5zbgiz9oh807.riker.replit.dev/*
// @match        https://ourworldofpixels.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

`;

module.exports = {
    // mode: "development",
    entry: path.resolve(__dirname, "src", "index.js"),
    output: {
        filename: "owopfuck.user.js",
        path: path.resolve(__dirname),
        libraryTarget: 'var',
        library: 'EntryPoint'
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('PrependUserScriptHeader', compilation => {
                    prependFile(path.resolve(__dirname, "owopfuck.user.js"), userScriptHeader, function (err) {
                        if (err) {
                            console.error("Failed to prepend UserScript header:", err);
                        }
                    });
                });
            }
        }
    ]
}