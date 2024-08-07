
/**
 * Handles disconnection
 * @param {import("../utils/typedefs").SocketInformation} socketInformation Information about existing games, sockets and chat rooms
 * @returns {(reason: import("socket.io").DisconnectReason, description?: any) => void} a function for specific for `'disconnect'` socket event
 * @example
 * socket.on('disconnect', require('./disconnectionHandler.js')(socketInformation))
 */
module.exports = (socketInformation) =>
    (reason, description = undefined) => {
        // ...
    }