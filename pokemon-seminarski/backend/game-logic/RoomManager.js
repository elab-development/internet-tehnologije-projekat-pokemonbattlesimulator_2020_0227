const { Server } = require('socket.io');
const Player = require('./Player');
const Room = require('./room');
const RoomCodeManager = require('./RoomCodeManager');

/**
 * Manages rooms property inside of `socketInfomration` and room/game behaviour
 */
module.exports = class RoomManager {
    /**
     * @param {import("../utils/typedefs").SocketInformation} socketInformation 
     * @param {Server} io server reference
     * @param {{movesEffectivenesses: { attackerTypeId: number; defenderTypeId: number; effectivness: string;}[]}} gameEssentials
     */
    constructor(socketInformation, io, gameEssentials) {
        this.gameEssentials = gameEssentials;
        this.socketInformation = socketInformation;
        this.roomCodeManager = new RoomCodeManager();
        this.lock = false;
        this.io = io;
    }

    /**
     * Creates a room by a player
     * @param {Player} playerWhoCreated 
     */
    createRoom(playerWhoCreated) {
        const room = new Room(this, this.roomCodeManager.generateCode(), null, null, this.gameEssentials, 'waiting');
        room.joinGame(playerWhoCreated);
        this.socketInformation.allGameRooms.push(room);
    }

    /**
     * Removes a room from `SocketInfromation` provided in RoomManager
     * @param {Room} room 
     */
    removeRoom(room) {
        this.io.socketsLeave(room.roomId);
        this.socketInformation.allGameRooms = this.socketInformation.allGameRooms.filter((value, _) => value.roomId !== room.roomId);
    }
}
