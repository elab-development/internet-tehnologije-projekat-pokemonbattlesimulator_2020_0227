class Game {
    /**
     * 
     * @param {import('../utils/typedefs').SocketInformation} app 
     * @param {import('socket.io').Socket} socket 
     */
    constructor(app, socket){
        this.app = app;
        this.socket = socket;
        this.handler = {
            "chat:message": message.bind(this),
        }
    }
}

// Events

/**
 * Handles 
 * @this {Game}
 * @param {number} attackId 
 */
function attack(attackId){

}


module.exports = Game;