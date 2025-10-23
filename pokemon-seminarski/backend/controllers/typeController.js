const { z } = require('zod');
const { ResponseError } = require('../utils/typedefs');
const { getTypesDB } = require('../db/services/typeService');
/**
 * @description     Returns all of the types
 * @route           GET /api/types
 * @access          Private
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const getTypes = async (_, res) => {
    try {
        const types =
            z.object({
                id: z.number(),
                name: z.string(),
            }).array().parse(await getTypesDB());
        res.json({
            next: null,
            previous: null,
            totalCount: types.length,
            data: types
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json(new ResponseError(error.message));
    }
}

module.exports = {
    getTypes
}