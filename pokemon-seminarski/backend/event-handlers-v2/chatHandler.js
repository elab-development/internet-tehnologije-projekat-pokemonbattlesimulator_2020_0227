const { Server, Socket } = require("socket.io");

/**
 * 
 * @param {Server} io 
 * @param {Socket} socket 
 * @param {import("../utils/typedefs").SocketInformation} socketInformation
 */
module.exports = (io, socket, socketInformation) => {
    const messageGlobal = (text) => {
        // ...
    }

    const messageFriend = (friend, text) => {
        // ...
    }

    socket.on("chat:message:global", messageGlobal);
    socket.on("chat:message:friend", messageFriend)
}