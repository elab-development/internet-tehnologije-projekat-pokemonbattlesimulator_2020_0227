const { Socket } = require('socket.io');
const Room = require('../game-logic/room');
const { z, ZodError } = require('zod');
const { selectUserSchema, insertUserSchema, selectUserSchemaFull } = require('../validations/userValidation.js');
const { users, pokemons, usersStats } = require('../db/schema.js');
const usersType = users.$inferSelect;
const pokemonsType = pokemons.$inferSelect;
const usersStatsType = usersStats.$inferInsert;

/**
 * @typedef {object} SocketInformation
 * @property {Array<ConnectedUser>} allConnectedUsers
 * @property {Array<Room>} allGameRooms
 */


////////// USERS //////////
/** @typedef {usersType UserTable} */
/** @typedef {z.infer<typeof selectUserSchema> UserSelect} */
/** @typedef {z.infer<typeof selectUserSchemaFull> UserSelectFull} */
/** @typedef {z.infer<typeof insertUserSchema> UserInsert} */
/** @typedef {usersStatsType} UserStats */
/** @typedef {import('express').RequestHandler<{}, any, any, qs.ParsedQs, Record<string, any>} DefaultHandler express RequestHandler with default params */
////////// POKEMONS //////////
/** @typedef {pokemonsType} PokemonTable */
////////// MESSAGES //////////
/** @typedef {'both' | 'sent' | 'received'} direction*/


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
     * @param {ZodError | string | Object | string[] } validationErrors list of validation erros, will get converted to `z.ZodFormattedError<any>`
     *  1. `validationErrors instanceof ZodError` - calls `ZodError.format()`
     *  2. `typeof validationErrors === 'string` - sets `formErrors` to provided string
     *  3. `validationErrors instanceof Object` - sets `fieldErrors` to provided object
     *  4. `validationErrors instanceof Arrray` - converts array of strings with format `property$errorMessage` to object and assigns it to `formErrors`
     * @param {'body' | 'query' | 'params'} requestPath where in request body error occurred
     * @param {string | undefined} pathPrefixForZodError since zod returns a message with no path when you check a primitive value directly, 
     *      you can use this field prefix all the path issues (ex. of primitives: `z.array()`, `z.number()`, `z.string()` ...). 
     *      Works only if `validationsErrors instanceof ZodError === true`, otherwise nothing happens.
    */
    constructor(message, validationErrors = undefined, requestPath = undefined, pathPrefixForZodError = undefined) {
        this.message = message;
        /**@type {z.ZodFormattedError<any>} */
        this.validationErrors;


        if (validationErrors instanceof ZodError) {
            if (pathPrefixForZodError != null) {
                validationErrors.issues.forEach((val) => val.path.unshift(pathPrefixForZodError))
            }
            this.validationErrors = validationErrors.format();
        } else if (typeof validationErrors === 'string') {
            this.validationErrors = {
                _errors: [validationErrors] // Form errors - suggested to call
            };
        } else if (validationErrors instanceof Object && Object.getPrototypeOf(validationErrors) == Object.prototype) {
            this.validationErrors = createZodErrorFormat(validationErrors); // Prosleđivanje ručno

        } else {
            this.validationErrors = validationErrors;
        }
        this.requestPath = requestPath
    }

    /**
     * @param {Object} obj - Format noted in example
     * @returns {z.ZodFormattedError}
     * @example
     *  let obj1 = {
     *      param: 'str', // Takes single string
     *      foo: ['bar','fizz'] // Takes array of strings
     *  }
     *  
     *  let obj2 = {
     *      fuz: obj1, // Takes objects of similar type
     *      aux: 'bmw'
     *  }
     *  ResponseError.createZodErrorFormat(obj1);
     *  ResponseError.createZodErrorFormat(obj1);
     */
    static createZodErrorFormat(obj) {
        const formattedError = { _errors: [] };

        for (const key in obj) {
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
                // Recursively handle nested objects
                formattedError[key] = createZodErrorFormat(obj[key]);
            } else {
                // Add an error message for the current key
                formattedError[key] = { _errors: [`Invalid value for ${key}`] };
            }
        }

        return formattedError;
    }
}





module.exports = {
    ConnectedUser,
    ResponseError,
}