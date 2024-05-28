var socket = null;

WebSocket.prototype.oldSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data) {
    if(socket == null) socket = this;
    this.oldSend(data);
}

export default socket;