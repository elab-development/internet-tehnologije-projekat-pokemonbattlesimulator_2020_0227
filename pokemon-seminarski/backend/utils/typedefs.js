const { Socket } = require('socket.io');
const express = require('express');
const Room = require('../game-logic/room');
const { z } = require('zod');
const { selectUserSchema, insertUserSchema } = require('../validations/userValidation.js');

/**
 * @typedef {object} SocketInformation
 * @property {Array<ConnectedUser>} allConnectedUsers
 * @property {Array<Room>} allGameRooms
 * @property {Array} allChatRooms
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




module.exports = {
    ConnectedUser
}