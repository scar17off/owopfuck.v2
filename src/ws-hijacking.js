import OJS from "./OJS.js";
import bots from "./sharedState.js";

WebSocket.prototype.oldSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data) {
    if(window.socket == null) {
        window.socket = this;
        bots.push(new OJS.Client({ ws: this, localplayer: true }));
    }
    
    this.oldSend(data);
}

export default window.socket;