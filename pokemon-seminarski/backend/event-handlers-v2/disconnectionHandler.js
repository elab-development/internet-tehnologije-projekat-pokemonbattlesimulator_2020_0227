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
        console.log(`disconnect event for ${socket.id}`);

        if (socket.data.replaced) {
            console.log(`Socket ${socket.id} was replaced; skipped disconnect cleanup`); return;
        }

        console.log("connected users:", socketInformation.allConnectedUsers.map(u => u ? { ...u, socket: socket.id } : u));
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);

        if (user == null) {
            console.log(`No connected user found for socket ${socket.id}.`); return;
        }

        console.log(`User "${user.username}" (${user.id}) disconnected. Reason: ${reason}`);

        // Remove user from the connected list
        socketInformation.allConnectedUsers = socketInformation.allConnectedUsers.filter(u => u.id !== user.id);

        const game = socketInformation.allGameRooms.find(
            gr => gr.player1.id === user.id || gr.player2.id === user.id
        );

        if (!game) {
            return;
        }

        if (game.status === 'waiting') {
            game.delete();
        } else {
            game.endGame();
        }
    }