import io from "./io.js";

export const botnetSocket = io("wss://owop-botnet.glitch.me/controller", { autoConnect: false });

botnetSocket.on("id", id => {
    botnetSocket.id = id;
});

export class BotNetReplicator extends EventEmitter {
    constructor(zombie) {
        super();

        this.readyState = 0;

        botnetSocket.on("message", (id, message) => {
            if(id !== zombie) return;
            this.emit("message", message);
        });

        botnetSocket.on("status", (id, status) => {
            if(id !== zombie) return;
            if(status == "open") this.readyState = 1;
            if(status == "close") this.readyState = 3;
            this.emit(status);
        });

        this.send = data => {
            botnetSocket.emit("send", zombie, data);
        }

        this.close = () => {
            botnetSocket.emit("close", zombie);
        }
    }
}