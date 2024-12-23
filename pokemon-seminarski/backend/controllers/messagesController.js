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
    let zerrors = new ZodError([]);
    let user1 = undefined, user2 = undefined;

    // Pagination
    if (req.query.offset != null && !isStringInteger(req.query.offset))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["offset"], message: 'Expected integer' });
    if (req.query.limit != null && !isStringInteger(req.query.limit, { negative: false }))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["limit"], message: 'Expected positive integer' });

    // Filtration
    if (req.query.user1 != null && !isStringInteger(req.query.user1)) {
        if (!Array.isArray(req.query.user1)) {
            zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["user1"], message: 'Expected integer or array of integers' });
        } else {
            user1 = req.query.user1.map((val) => dynamicParseStringToPrimitives(val));
            let issues = arrayOfUserIdValidation.safeParse(user1).error?.issues.map((val) => {
                val.path.unshift('user1');
                return val;
            });
            console.log('user1')
            console.log(issues);
            if (issues) zerrors.addIssues(issues);
        }
    }
    if (req.query.user2 != null && !isStringInteger(req.query.user2)) {
        if (!Array.isArray(req.query.user2)) {
            zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["user2"], message: 'Expected integer or array of integers' });
        } else {
            user2 = req.query.user2.map((val) => dynamicParseStringToPrimitives(val));
            let issues = arrayOfUserIdValidation.safeParse(user2).error?.issues.map((val) => {
                val.path.unshift('user2');
                return val;
            })
            console.log('user2')
            console.log(issues);
            if (issues) zerrors.addIssues(issues);
        }
    }
    let issue = directionMessageValidation.optional().safeParse(req.query.direction).error?.issues;
    if (issue) zerrors.addIssue(issue);

    if (!zerrors.isEmpty) {
        return res.status(400).json(new ResponseError('Bad Request', zerrors, 'query'));
    }

    user1 = user1 ?? (req.query.user1 ? parseInt(req.query.user1, 10) : null);
    user2 = user2 ?? (req.query.user2 ? parseInt(req.query.user2, 10) : null);


    if (req.user.role !== ADMIN &&
        !(user1 != null && typeof user1 === 'number' && req.user.id === user1) &&
        !(user2 != null && typeof user2 === 'number' && req.user.id === user2)
    ) return res.status(401).json(new ResponseError("Not authorized - Can't request messages between other users"));




    let { direction, q } = req.query;
    let x;
    let offset = req.query.offset != null ? parseInt(req.query.offset, 10) : undefined;
    let limit = req.query.limit != null && (x = parseInt(req.query.limit, 10)) !== 0 ? x : undefined;

    try {
        let obj = { offset, limit, user1, user2, direction, q, };
        Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
        const result = await getMessagesDB({ ...obj });

        return res.status(200).json({
            totalCount: result.totalCount,
            next: result.offset + result.limit >= result.totalCount ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/messages?offset=${result.offset + result.limit < 0 ? 0 : result.offset}&limit=${result.offset + 2 * result.limit > result.totalresult ? result.totalCount - result.limit : (result.limit <= 0 ? Math.min(20, result.totalCount) : result.limit)}${user1 != null ? (Array.isArray(user1) ? user1 : [user1]).map((val) => `&user1=${val}`) : ""}${user2 != null ? (Array.isArray(user2) ? user2 : [user2]).map((val) => `&user2=${val}`) : ""}${direction ? ("&direction=" + direction) : ""}${q ? ("&q=" + q) : ""}`,
            previous: result.offset === 0 ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/messages?offset=${(result.offset - result.limit < 0) ? 0 : (result.offset - result.limit > result.totalCount ? result.totalCount - result.limit : result.offset - result.limit)}&limit=${result.offset - result.limit < 0 ? result.offset : result.limit}${user1 != null ? (Array.isArray(user1) ? user1 : [user1]).map((val) => `&user1=${val}`) : ""}${user2 != null ? (Array.isArray(user2) ? user2 : [user2]).map((val) => `&user2=${val}`) : ""}${direction ? ("&direction=" + direction) : ""}${q ? ("&q=" + q) : ""}`,
            data: result.messagesData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ResponseError(error.message));
    }
}


module.exports = {
    getMessages
}