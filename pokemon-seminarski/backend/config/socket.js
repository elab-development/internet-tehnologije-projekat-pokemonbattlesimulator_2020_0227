//@ts-check
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
        console.log('new connection!');
        const token = socket.handshake.auth.token;

        try {
            const user = await validateToken(token);
            const existingUser = socketInformation.allConnectedUsers.find(val => val.id === user.id);

            if (existingUser) {
                console.log(`User "${user.username}" is already online.`);
                console.log(`Old socket: ${existingUser.socket.id}, New socket: ${socket.id}`);

                existingUser.socket.data.replaced = true;
                existingUser.socket.emit('disconnect:new:connection');
                existingUser.socket.disconnect(true);
                existingUser.socket = socket;
            } else {
                socketInformation.allConnectedUsers.push(
                    new ConnectedUser(user.id, user.username, socket)
                );
            }
            console.log(`User ${user.username} connected successfully with socket ${socket.id}`);
            socket.data.user = user;
            next();
        } catch (error) {
            // @ts-ignore
            console.log('Token validation failed:', error.message);
            next(new Error("Authentication error"));
        }
    });

    io.on('connection', (socket) => {
        console.log('New user successfuly connected!');
        console.log('connected users: ', socketInformation.allConnectedUsers.map((val) => ({ id: val.id, username: val.username, socketId: val.socket.id })));
        const game = socketInformation.allGameRooms.find(gr => gr.player1.id === socket.data.user.id || gr.player2.id === socket.data.user.id);
        socket.emit('connect:user', { user: socket.data.user, gameRoom: game ? game.roomId : undefined });

        // Event registration
        registerChatHandlers(io, socket, socketInformation);
        registerGameHandlers(io, socket, socketInformation, manager);
        socket.on('disconnect', handleDisconnect(socketInformation, socket));
    });
}

module.exports = handleSocketConnections;