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
            let tempSocket = socket;
            const user = await validateToken(token);
            const alreadyOn = socketInformation.allConnectedUsers.find(val => val.id === user.id);
            if (alreadyOn) {
                console.log("User \"" + user.username + "\"is already online!\nPrevious socket.id " + alreadyOn.socket.id + " \nNew socket.id " + socket.id + "\n\n\n");
                alreadyOn.socket.emit('disconnect:new:connection');
                alreadyOn.socket.disconnect();
                alreadyOn.socket = socket;
            } else {
                socketInformation.allConnectedUsers.push(
                    new ConnectedUser(user.id, user.username, socket)
                );
            }
            socket.mydata = user;
            next();
        } catch (error) {
            console.log('no token by user');
            next(new Error(error.message));
        }
    });

    io.on('connection', (socket) => {
        console.log('New user successfuly connected!');
        console.log('connected users: ', socketInformation.allConnectedUsers.map((val) => ({ id: val.id, username: val.username, socketId: val.socket.id })));
        console.log(socket.mydata);
        socket.emit('connect:user', { user: socket.mydata });

        // Event registration
        registerChatHandlers(io, socket, socketInformation);
        registerGameHandlers(io, socket, socketInformation, manager);
        socket.on('disconnect', handleDisconnect(socketInformation, socket));
    });
}

module.exports = handleSocketConnections;