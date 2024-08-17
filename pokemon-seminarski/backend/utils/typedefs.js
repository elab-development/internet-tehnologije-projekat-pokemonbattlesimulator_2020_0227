const { Socket } = require('socket.io');
const Room = require('../game-logic/room');
const { z, ZodError } = require('zod');
const { selectUserSchema, insertUserSchema } = require('../validations/userValidation.js');
const { users } = require('../db/schema.js');
const usersType = users.$inferSelect;

/**
 * @typedef {object} SocketInformation
 * @property {Array<ConnectedUser>} allConnectedUsers
 * @property {Array<Room>} allGameRooms
 * @property {Array} allChatRooms
 */

/**
 * @typedef {usersType UserTable}
*/
/**
 * @typedef {z.infer<typeof selectUserSchema> UserSelect}
 */
/**
 * @typedef {z.infer<typeof insertUserSchema> UserInsert}
 */
/**
 * @typedef {import('express').RequestHandler<{}, any, any, qs.ParsedQs, Record<string, any>} DefaultHandler express RequestHandler with default params
 */
/**
 * @typedef {Object} MessageResponse
 * @property {number} id 
 * @property {number} sender
 * @property {number} reciver
 * @property {string} message
 * @property {Date} createdAt
 */
/**
 * @typedef {Object} PaginationResponse
 * @property {number} totalMessages
 * @property {string|null} nextPage
 * @property {string|null} prevPage
 * @property {MessageResponse[]} messages
 */


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

class ResponseError {
    /**
     * @param {string} message
     * @param {ZodError | string | Object | string[] } validationErrors list of validation erros, will get converted to `z.typeToFlattenedError<any>`
     *  1. `validationErrors instanceof ZodError` - calls `ZodError.flatten()`
     *  2. `typeof validationErrors === 'string` - sets `fieldErrors` to provided string
     *  3. `validationErrors instanceof Object` - sets `formErrors` to provided object
     *  4. `validationErrors instanceof Arrray` - converts array of strings with format `property$errorMessage` to object and assigns it to `formErrors`
     * @param {'body' | 'query' | 'params'} requestPath
    */
    constructor(message, validationErrors = undefined, requestPath = undefined) {
        this.message = message;
        /**@type {z.typeToFlattenedError<any>} */
        this.validationErrors;


        if (validationErrors instanceof ZodError) {
            this.validationErrors = validationErrors.flatten();
        } else if (typeof validationErrors === 'string') {
            this.validationErrors = {
                fieldErrors: [validationErrors.message],
                formErrors: {}
            };
        } else if (validationErrors instanceof Object && Object.getPrototypeOf(validationErrors) == Object.prototype) {
            this.validationErrors = {
                fieldErrors: [],
                formErrors: validationErrors
            };
        } else if (validationErrors instanceof Array) {
            this.validationErrors = {
                fieldErrors: [],
                formErrors: Object.assign(...errors.map((val) => {
                    val = val.split('$');
                    return { [split[0]]: split[1] };
                }))
            }
        } else {
            this.validationErrors = validationErrors;
        }
        this.requestPath = requestPath
    }

}





module.exports = {
    ConnectedUser,
    ResponseError,
}