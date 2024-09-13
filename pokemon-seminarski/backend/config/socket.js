const { Server } = require("socket.io");

// Handlers
const registerChatHandlers = require('../event-handlers-v2/chatHandler.js');
const registerGameHandlers = require('../event-handlers-v2/gameHandler.js');
const handleDisconnect = require('../event-handlers-v2/disconnectionHandler.js');
const RoomManager = require("../game-logic/RoomManager.js");
const getEssentials = require('../game-logic/gameEssentials.js');
const { validateToken } = require("../utils/validateToken.js");
const { ConnectedUser } = require("../utils/typedefs");

/**
 * @type {import('../utils/typedefs').SocketInformation}
 */
const socketInformation = {
    allConnectedUsers: [],
    allGameRooms: [],
}


/**
 *  @param { Server } io
 */
const handleSocketConnections = async (io) => {
    const gameLogicEssentials = await getEssentials();
    const manager = new RoomManager(socketInformation, io, gameLogicEssentials);

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        try {
            const user = await validateToken(token);
            socketInformation.allConnectedUsers.push(
                new ConnectedUser(user.id, user.username, socket)
            );
            next();
        } catch (error) {
            next(new Error(error.message));
        }
    });

    io.on('connection', (socket) => {
        console.log('New user successfuly connected!');
        socket.emit('hello', "Welcome to server");

        // Event registration
        registerChatHandlers(io, socket, socketInformation);
        registerGameHandlers(io, socket, socketInformation, manager);
        socket.on('disconnect', handleDisconnect(socketInformation, socket));
    });
}

module.exports = handleSocketConnections;