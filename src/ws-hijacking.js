import OJS from "./OJS.js";
import { bots } from "./sharedState.js";

WebSocket.prototype.oldSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data) {
    if(window.socket == null) {
        window.socket = this;
        const client = new OJS.Client({ ws: this, localplayer: true });
        
        this.addEventListener("close", () => {
            window.socket = null;
            const index = bots.indexOf(client);
            if (index !== -1) {
                bots.splice(index, 1);
            }
        });

        bots.push(client);
    }
    
    this.oldSend(data);
}

export default window.socket;