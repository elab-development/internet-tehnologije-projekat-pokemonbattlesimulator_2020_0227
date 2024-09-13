const { Socket } = require("socket.io");

/**
 * Handles disconnection
 * @param {import("../utils/typedefs").SocketInformation} socketInformation Information about existing games, sockets and chat rooms
 * @param {Socket} socket socket tha is currently disconnecting
 * @returns {(reason: import("socket.io").DisconnectReason, description?: any) => void} a function for specific for `'disconnect'` socket event
 * @example
 * socket.on('disconnect', require('./disconnectionHandler.js')(socketInformation))
 */
module.exports = (socketInformation, socket) =>
    (reason, description = undefined) => {
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);
        console.log("/////////////////////\n" + user.id + "entered disconnect event");
        console.log('user disconnected: ' + socket.disconnected);
        console.log('resason: ' + reason);
        console.log('description: ' + description?.message + "\n/////////////////////\n");
        const game = socketInformation.allGameRooms.find(gr => gr.player1.id === user.id || gr.player2.id === user.id);

        socketInformation.allConnectedUsers = socketInformation.allConnectedUsers.filter(val => val.id === user.id);
        if (game == null) {
            return;
        }
        if (game.status === 'waiting') {
            return game.delete();
        }
        game.endGame();
    }