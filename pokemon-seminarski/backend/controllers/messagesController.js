const { z, ZodError, ZodIssueCode } = require('zod');
const { isStringInteger, parseIntegerStrict, dynamicParseStringToPrimitives } = require('../utils/parsesForPrimitives');
const { arrayOfUserIdValidation } = require('../validations/userValidation');
const { directionMessageValidation } = require('../validations/messagesValidation');
const { getMessagesDB } = require('../db/services/messagesServices');
const { ADMIN } = require('../enums/roles');
const { ResponseError } = require('../utils/typedefs');


// Pagination {limit: number, offset: number}, Filtration {user1: [senderId], user2: [reciverId], direction: 'both' | 'sent' | 'received', q: message, }
/**
 * Get's messages with given
 * @description     Gets messages
 * @route           GET /api/messages
 * @access          Private
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const getMessages = async (req, res) => {
    if (req.user.role !== ADMIN && 
        (user1 != null && typeof user1 === 'number' && req.user.id !== user1) || (user2 != null && typeof user2 === 'number' && req.user.id === user2)) {
        return res.status(401).json(new ResponseError("Not authorized - Can't request messages between other users"));
    }

    let zerrors = new ZodError([]);

    // Pagination
    if (req.query.offset != null && !isStringInteger(req.query.offset))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["offset"], message: 'Expected integer' });
    if (req.query.limit != null && !isStringInteger(req.query.limit, { negative: false }))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["limit"], message: 'Expected positive integer' }); 

    // Filtration
    if (req.query.user1 != null && !isStringInteger(req.query.user1)) {
        if (!Array.isArray(req.query.user1)) {
            zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["user1"], message: 'Expected integer or array of integers' }); 
            zerrors.addIssues(arrayOfUserIdValidation.safeParse(
                req.query.user1.forEach((val) => dynamicParseStringToPrimitives(val)) // Obrađuje odmah field req.query.user1 -> prevodi string => integer
            ).error?.issues.map((val) => {
                val.path.unshift('user1');
                return val;
            })) 
        }
    }
    if (req.query.user2 != null && !isStringInteger(req.query.user2)) {
        if (!Array.isArray(req.query.user2)) {
            zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["user2"], message: 'Expected integer or array of integers' }); 
        } else {
            zerrors.addIssues(arrayOfUserIdValidation.safeParse(
                req.query.user2.forEach((val) => dynamicParseStringToPrimitives(val))
            ).error?.issues.map((val) => {
                val.path.unshift('user2');
                return val;
            })) 
        }
    }
    zerrors.addIssue(directionMessageValidation.optional().safeParse(req.query.direction).error?.issues);

    if (zerrors.issues.length !== 0) {
        return res.status(400).json(new ResponseError('Bad Request', zerrors, 'query'));
    }

    let { limit, offset, user1, user2, direction, q } = req.query;

    try {
        const result = await getMessagesDB(Object.keys({
            offset,
            limit,
            user1,
            user2,
            direction,
            q,
        }).forEach(key => obj[key] === undefined && delete obj[key]));

        return res.status(200).json({
            totalCount: result.totalCount,
            next: result.offset + result.limit >= result.totalCount ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/messages?offset=${result.offset + result.limit < 0 ? 0 : result.offset}&limit=${result.offset + 2 * result.limit > result.totalresult ? result.totalCount - result.limit : result.limit}${user1 != null && (Array.isArray(user1) ? user1 : [user1]).map((val) => `&user1=${val}`)}${user2 != null && (Array.isArray(user2) ? user2 : [user2]).map((val) => `&user2=${val}`)}${direction && ("&direction=" + direction)}${q && ("&direction=" + q)}`,
            previous: offset === 0 ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/messages?offset=${(result.offset - result.limit < 0) ? 0 : (result.offset - result.limit > result.totalCount ? result.totalCount - result.limit : result.offset - result.limit)}&limit=${result.offset - result.limit < 0 ? result.offset : result.limit}${user1 != null && (Array.isArray(user1) ? user1 : [user1]).map((val) => `&user1=${val}`)}${user2 != null && (Array.isArray(user2) ? user2 : [user2]).map((val) => `&user2=${val}`)}${direction && ("&direction=" + direction)}${q && ("&direction=" + q)}`,
            data: result.messagesData
        });
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}


module.exports = {
    getMessages
}