const bcrypt = require('bcrypt');
const db = require('../config/db');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');
const generateToken = require('../utils/generateToken');
const { getUserByUsername, createUser, getUserById } = require('../db/services/userServices');
const { insertUserSchema, selectUserSchema } = require('../validations/userValidation');
const { ZodError } = require('zod');

/**
 * @description     Login user & get token
 * @route           POST /api/users/login
 * @access          Public
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const authUser = async (req, res) => {
    const { username, password } = req.body;
    username = String(username).trim();

    const user = (await db.select().from(users).where(eq(users.username, username)))[0];

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id)
        });
    } else {
        res.status(401);
        res.json({
            message: 'Invalid credentials'
        })
    }
}

/**
 * @description     Creates a new user
 * @route           POST /api/users
 * @access          Public
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Checks if input is valid - throws error if not valid
        const checkedUser = insertUserSchema.parse({ username, email, password });

        const userExists = await getUserByUsername(username);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = selectUserSchema.parse(await createUser(...checkedUser));

        res.status(201);
        res.json({
            ...user,
            token: generateToken(user.id)
        });
    } catch (err) {
        if (err instanceof ZodError) {
            res.status(400);
            res.json({ message: err.message });
        } else {
            res.status(500);
            res.json({ message: err.message });
        }
    }
}


/**
 * @description     Returns a user, if param is numeric, query will be by ID else its by username
 * @route           GET /api/users/:param
 * @access          Public
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const getUser = async (req, res) => {
    const { param } = req.params;

    try {
        let user;
        
        // Problematics handling the bigint, function isSafeInteger limits to 2**53 - 1
        if(/^\d+$/.test(param) && Number.isSafeInteger(+param)){
            user = await getUserById(+param);
        } else {
            user = await getUserByUsername(param);
        }

        user = selectUserSchema.parse(user);
        return res.status(200).json({...user});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

module.exports = {
    getUser,
    registerUser,
    authUser
}