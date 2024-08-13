const Player = require('./Player');
const Room = require('./room');
const RoomCodeManager = require('./RoomCodeManager');

/**
 * Manages rooms property inside of `socketInfomration` and room/game behaviour
 */
module.exports = class RoomManager {
    /**
     * @param {import("../utils/typedefs").SocketInformation} socketInformation 
     */
    constructor(socketInformation){
        this.socketInformation = socketInformation;
        this.roomCodeManager = new RoomCodeManager();
        this.lock = false;
    }

    /**
     * Creates a room by a player
     * @param {Player} playerWhoCreated 
     */
    createRoom(creatorsSocket){
        const roomCode = this.roomCodeManager.generateCode();
        this.socketInformation.allGameRooms.push(new Room(
            this,
            roomCode,
            playerWhoCreated,
            null
        ));
    }

    /**
     * Removes a room from `SocketInfromation` provided in RoomManager
     * @param {Room} room 
     */
    removeRoom(room){
        this.socketInformation.allGameRooms.filter((value, _) => value !== room);
    }
}
