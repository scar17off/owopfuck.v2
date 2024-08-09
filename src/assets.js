import config from "./core/config";
import { upload } from "./core/utils";

const ASSETS_STORAGE_KEY = 'assets';

export function getAssets() {
    const storedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    return storedAssets ? JSON.parse(storedAssets) : [];
}

function saveAssets(assets) {
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
    config.setValue(assets, "Assets");
}

export default function initAssets() {
	OWOP.windowSys.addWindow(new OWOP.windowSys.class.window("owopfuck assets", {
		closeable: false
	}, function (win) {
		const div = document.createElement("div");

		let container = win.container;
		container.parentNode.style.width = "260px";
		container.parentNode.style.height = "500px";
		container.id = 'window-owopfuck-assets';
		container.parentNode.firstChild.remove();
		container.style = `o-border-image: url(/img/window_in.png) 5 repeat;`;
		container.classList = '';
		container.parentNode.style["position"] = "absolute";
		container.parentNode.style["pointer-events"] = "initial";
		container.parentNode.style["background-color"] = "rgb(17, 19, 20)";
		container.parentNode.style["border"] = "4px rgb(17, 19, 20) solid";

		div.innerHTML = `<button id="owopfuck-asset-add" class="aimware-button">Upload</button>
	<br>
	<div id="owopfuck-assets-container"></div>`;

		win.addObj(div);
	}).move(130, 200));

	document.getElementById("owopfuck-asset-add").addEventListener("click", async () => {
		let assets = getAssets();
		assets.push(await upload("image/*"));
		saveAssets(assets);
		refreshAssets();
	});

	const refreshAssets = () => {
		let assets = getAssets();
		const assetsDiv = document.getElementById("owopfuck-assets-container");
		assetsDiv.innerHTML = '';

		for (let i in assets) {
			const image = new Image();
			image.onload = () => {
				image.style.width = "96px";
				image.style.height = "96px";
				image.style.border = "solid 1px";
				image.onclick = e => {
					for (let j in document.getElementById("owopfuck-assets-container").children) {
						if (typeof (document.getElementById("owopfuck-assets-container").children[j]) !== "object") break;
						document.getElementById("owopfuck-assets-container").children[j].style.border = "solid 1px";
					};
					window.owopfuck.selectedAsset = assets[i];
					image.style.border = "solid 1px red";
				};
				image.oncontextmenu = e => {
					e.preventDefault();
					assets.splice(i, 1);
					saveAssets(assets);
					refreshAssets();
				};
				assetsDiv.append(image);
			};
			image.src = assets[i];
		};
	};
	refreshAssets();
}