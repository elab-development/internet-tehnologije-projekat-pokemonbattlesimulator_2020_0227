const { Server } = require("socket.io");
const { ConnectedUser } = require('../utils/typedefs');

// Handlers
const registerChatHandlers = require('../event-handlers-v2/chatHandler.js');
const registerGameHandlers = require('../event-handlers-v2/gameHandler.js');
const handleDisconnect = require('../event-handlers-v2/disconnectionHandler.js');

/**
 * @type {import('../utils/typedefs').SocketInformation}
 */
const socketInformation = {
    allConnectedUsers: [],
    allGameRooms: [],
    allChatRooms: [],
}

/**
 *  @param { Server } io
 */
const handleSocketConnections = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        (() => {/*check jwt signature*/ })();
        next();
    });

    io.on('connection', (socket) => {
        registerChatHandlers(io, socket, socketInformation);
        registerGameHandlers(io, socket, socketInformation);
        socket.on('disconnect', handleDisconnect(socketInformation));
    });
}

module.exports = handleSocketConnections;



/*
 * Registracija dogadjaja putem klasa 
 * https://stackoverflow.com/questions/20466129/
 * 
 * 
const { Chat, Game } = require('../event-handlers-v1');

io.on('connection', (socket) => {
    var eventHandlers = {
        chat: new Chat(app, socket),
        game: new Game(app, socket)
    }

    for(var category in eventHandlers) {
        var handler = eventHandlers[category].handler;
        for (var event in handler){
            socket.on(event, handler[event]);
        }
    }
    
    socketInformation.allConnectedUsers.push(new ConnectedUser())
});*/
