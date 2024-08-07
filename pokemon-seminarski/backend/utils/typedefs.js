const {Socket} = require('socket.io');

/**
 * Represents connected user
 */
class ConnectedUser {
    /**
     * @param {number} id 
     * @param {string} username 
     * @param {Socket} socket 
     */
    constructor(id, username, socket) {
        this.id = id;
        this.username = username;
        this.socket = socket;
    }
}

/**
 * @typedef {object} SocketInformation
 * @property {Array<ConnectedUser>} allConnectedUsers
 * @property {Array} allGameRooms
 * @property {Array} allChatRooms
 */

module.exports = {
    ConnectedUser
}