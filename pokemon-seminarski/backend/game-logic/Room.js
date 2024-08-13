const Player = require('./Player');
const RoomManager = require('./RoomManager');
/**
 * Data wrapper for Rooms, all Room behaviour is managed by `RoomManager` check {@link RoomManager | link}
 */
module.exports = class Room {
    /**
     * @param {RoomManager} observer
     * @param {number} roomId 
     * @param {Player} player1 
     * @param {Player} player2 
     */
    constructor(observer, roomId, player1, player2) {
        this.observer = observer;
        this.roomId = roomId;
        this.player1 = player1;
        this.player2 = player2;
    }

    /**
     * Writes results to database, calls player1 and player2, writeToDb
     */
    endGame() {
        // ...
    }

    /**
     * Deletes room from the RoomManager that is observing it
     */
    delete() {
        this.endGame();
        this.observer.removeRoom(this);
    }
}