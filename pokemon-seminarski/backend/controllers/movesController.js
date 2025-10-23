const { getMovesDB, insertMoveDB } = require('../db/services/movesServices')
const { z } = require('zod');
const { ResponseError } = require('../utils/typedefs');
const { ADMIN } = require('../enums/roles');


/**
 * @description     Returns all of the moves independently
 * @route           GET /api/moves
 * @access          Public
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const getMoves = async (_, res) => {
    try {
        const moves =
            z.object({
                id: z.number(),
                name: z.string(),
                manaCost: z.number(),
                attackBase: z.number(),
                type: z.object({
                    id: z.number(),
                    name: z.string(),
                }),
            }).transform((m) => {
                const { manaCost, ...rest } = m;
                return {
                    ...rest,
                    mana: manaCost
                }
            }).array().parse(await getMovesDB());
        res.json({
            next: null,
            previous: null,
            totalCount: moves.length,
            data: moves
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json(new ResponseError(error.message));
    }
}

/**
 * @description     Returns all of the moves independently
 * @route           GET /api/moves
 * @access          Public
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const insertMove = async (req, res) => {
    if (req.user.role !== ADMIN) {
        return res.status(403).json(new ResponseError('Unauthorized'));
    }

    let validatedMove;
    try {
        validatedMove = z.object({
            id: z.number().int(),
            name: z.string(),
            manaCost: z.number().int().min(1).max(10),
            attackBase: z.number().int().min(0).max(100),
            typeId: z.number().int().min(1),
        }).parse(req.body);
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', error, 'body', 'moves'));
    }

    try {
        let move = await insertMoveDB(validatedMove);
        res.json(move);
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ResponseError(error.message));
    }
}

module.exports = {
    getMoves,
    insertMove
}