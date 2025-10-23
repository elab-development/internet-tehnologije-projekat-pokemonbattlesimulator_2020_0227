/**
 * Generates roomcode id
 */
module.exports = class RoomCodeManager {
    /**
     * Manages unique code generator via lookup inside of `socketInformatino`
     * @param {number} codeLength 
     * @param {import("../utils/typedefs").SocketInformation} socketInformation 
     */
    constructor(socketInformation, codeLength = 4){
        this.socketInformation = socketInformation;
        this.codeLength = codeLength;
    }

    /**
     * @static
     * @param {number} min 
     * @param {number} max 
     */
    static randInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    generateCode() {
        const min = 0;
        const max = Math.pow(10, this.codeLength) - 1;
        let code = RoomCodeManager.randInt(min, max);

        if(this.socketInformation.allGameRooms.length >= max){
            throw new Error('No room available');
        }

        while(this.socketInformation.allGameRooms.find((value, _) => value.roomId == code)){
            code = (code - min + 1) % (max - min + 1) + min;
        }
        return code;
    }

}