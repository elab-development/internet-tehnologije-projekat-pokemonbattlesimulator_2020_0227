const { Server, Socket } = require("socket.io");

/**
 * 
 * @param {Server} io 
 * @param {Socket} socket 
 * @param {import("../utils/typedefs").SocketInformation} socketInformation
 */
module.exports = (io, socket, socketInformation) => {
    const joinGame = (roomId) => {
        // ...
    }

    const joinQueue = () => {
        // ...
    }

    const leaveQueue = () => {
        // ...
    }

    const attack = (attackId) => {
        // ...
    }
    
    const switchPokemon = (pokemon) => {
        // ...
    }

    const leaveGame = () => {
        // ...   
    }

    socket.on("game:join", joinGame);
    socket.on("game:queue:join", joinQueue);
    socket.on("game:queue:leave", leaveQueue);
    socket.on("game:battle:attack", attack);
    socket.on("game:battle:switch", switchPokemon);
    socket.on("game:battle:leave", leaveGame);
}