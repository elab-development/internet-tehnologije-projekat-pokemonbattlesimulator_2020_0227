const { Server, Socket } = require("socket.io");

/**
 * 
 * @param {Server} io 
 * @param {Socket} socket 
 */
module.exports = (io, socket) => {
    const messageGlobal = (text) => {
        // ...
    }

    const messageFriend = (friend, text) => {
        // ...
    }

    socket.on("chat:message:global", messageGlobal);
    socket.on("chat:message:friend", messageFriend)
}