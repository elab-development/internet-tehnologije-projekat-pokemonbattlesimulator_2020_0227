const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const { stringToBoolean, isStringInteger, parseIntegerStrict } = require('../utils/parsesForPrimitives');
const { getUserByUsername, createUser, getUserById, getUserByEmail, updateUserDB, getUsersPokemonsDB, deleteUserDB, getUsersMessagesDB, insertResetPasswordToken, getResetPasswordToken, getUserDB, getUsersDB } = require('../db/services/userServices');
const { insertUserSchema, selectUserSchema, selectUserPokemonsSchema, updateUserSchema, usernameWeakValidation } = require('../validations/userValidation');
const { ZodError, z, ZodIssueCode } = require('zod');
const { ADMIN } = require('../enums/roles');
const { ResponseError } = require('../utils/typedefs');
const { generateResetPasswordToken, validateResetPasswordToken } = require('../utils/generateResetPasswordToken');
const { sendPasswordResetEmail } = require('../utils/sendPasswordResetEmail');
const { validateToken } = require('../utils/validateToken');

/**
 * @description     Login user & get token
 * @route           POST /api/users/login
 * @access          Public
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const loginUser = async (req, res) => {
    if (req.headers.authorization != null) {
        try {
            let user = validateToken(req.headers.authorization);
            return res.status(200).json({
                ...(selectUserSchema.parse(user)),
                token: req.headers.authorization
            })
        } catch (error) {
            return res.status(401).json(new ResponseError('Invalid token - ' + error.message))
        }
    }

    let { username, email, password } = req.body;
    /*try {
        username = usernameWeakValidation.parse(username);
    } catch (error) {
        return res.status(400).json(new ResponseError('Invalid username', error, 'body', 'username'));
    }*/
    let user;

    try {
        insertUserSchema
            .extend({ password: z.string() })
            .partial({ username: true, email: true })
            .refine(({ username, email }) => (username != null && email == null) || (username == null && email != null), 'Specify either username or email')
            .parse({ username, email, password });
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', error, 'body'));
    }

    try {
        user = (await getUserDB({ username, email, password }))[0];
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }

    if (user && (await bcrypt.compare(String(password), user.password))) {
        return res.status(200).json({
            ...(selectUserSchema.parse(user)),
            token: generateToken(user.id)
        });
    } else {
        return res.status(401).json(new ResponseError('Invalid credentials'));
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

        // Checks if user exists then error
        if ((await getUserDB({
            username: checkedUser.username,
            email: checkedUser.email,
        }, false)).length !== 0) {
            return res.status(400).json(new ResponseError('User already exists'));
        }

        const user = selectUserSchema.parse(await createUser({
            username: checkedUser.username,
            email: checkedUser.email,
            password: checkedUser.password
        }));

        return res.status(201).json({
            ...user,
            token: generateToken(user.id)
        });
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json(new ResponseError('Bad Request', err, 'body'));
        } else {
            return res.status(500).json(new ResponseError(err.message));
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

        // Problematics handling the bigint and database, function isSafeInteger limits to 2**53 - 1
        if (isStringInteger(param)) {
            user = await getUserById(parseInt(param, 10));
        } else {
            user = await getUserByUsername(param);
        }

        if (!user) {
            return res.status(404).json(new ResponseError('User not found'));
        }

        user = selectUserSchema.parse(user);
        return res.status(200).json({ ...user });
    } catch (err) {
        return res.status(500).json(new ResponseError(err.message));
    }
}


//Pagination, Filtration (body -> {users: number[], queryUsername: string  })
/**
 * @description     Gets array of users
 * @route           GET /api/users
 * @access          Private
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const getUsers = async (req, res) => {
    let zerrors = new ZodError([]);
    if (req.query.offset != null && !isStringInteger(req.query.offset))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, message: 'Expected integer', path: ['offset'] });

    if (req.query.limit != null && !isStringInteger(req.query.limit, { negative: false }))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, message: 'Expected positive integer', path: ['limit'] });

    if (req.body.users !== undefined) {
        z.array(z.number().int()).safeParse(req.body.users).error?.issues.forEach((val) => zerrors.addIssue({code: val.code, message: val.message, path: ['users', ...val.path]}));
    }
    if (req.body.queryUsername !== undefined) {
        z.string().safeParse(req.body.queryUsername).error?.issues.forEach((val) => zerrors.addIssue({code: val.code, message: val.message, path: ['queryUsername', ...val.path]}));
    }

    if (!zerrors.isEmpty) {
        return res.status(400).json(new ResponseError('Bad Request', zerrors, 'query'));
    }

    let x;
    let offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
    let limit = req.query.limit && (x = parseInt(req.query.limit, 10)) === 0 ? x : undefined;
    let userIds = req.body.users;
    let queryUsername = req.body.queryUsername;

    try {
        const result = await getUsersDB(Object.keys({
            offset,
            limit,
            userIds,
            queryUsername
        }).forEach(key => obj[key] === undefined && delete obj[key]));

        return res.status(200).json({
            totalCount: result.totalCount,
            next: result.offset + result.limit >= result.totalCount ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/users?offset=${result.offset + result.limit < 0 ? 0 : result.offset}&limit=${result.offset + 2 * result.limit > result.totalresult ? result.totalCount - result.limit : result.limit}`,
            previous: offset === 0 ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/users/${userId}/messages?offset=${(result.offset - result.limit < 0) ? 0 : (result.offset - result.limit > result.totalCount ? result.totalCount - result.limit : result.offset - result.limit)}&limit=${result.offset - result.limit < 0 ? result.offset : result.limit}`,
            data: result.usersData
        });
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}

/**
 * @description     Returns a user, if param is numeric, query will be by ID else its by username
 * @route           GET /api/users/:param/pokemons
 * @access          Public
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const getUsersPokemons = async (req, res) => {
    const { param } = req.params;
    let user;

    try {
        if (isStringInteger(param)) {
            user = await getUserById(parseInt(param, 10));
        } else {
            user = await getUserByUsername(param);
        }

        if (!user) {
            return res.status(404).json(new ResponseError('User not found'));
        }

        const result = await getUsersPokemonsDB(user.id);
        const pokes = z.array(
            selectUserPokemonsSchema.omit({ userId: true })
        ).parse(result);

        return res.status(200).json({
            userId: user.id,
            data: pokes
        })
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}



/**
 * @description     Deletes the user with provided token
 * @route           DELETE /api/users/:param
 * @access          Private
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const deleteUser = async (req, res) => {
    if (req.user.id !== parseIntegerStrict(param) && req.user.username !== param && req.user.role !== ADMIN) {
        return res.status(401).json(new ResponseError("Unauthorized - Can't delete other user"));
    }

    try {
        if (req.user.role === ADMIN) {
            const id = parseIntegerStrict(req.params.param);

            if (id == null) {
                return res.status(400).json(new ResponseError('Bad request', { param: 'Expected integer' }, 'params'));
            }
            await deleteUserDB(parseIntegerStrict(req.body.userId));
        } else {
            await deleteUserDB(req.user.id);
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}


/**
 * @description     Updates an account with provided token
 * @route           PATCH /api/users/:param
 * @access          Private
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const updateUser = async (req, res) => {
    const { username, email, password } = req.body;
    const { param } = req.params;
    let user;

    // User must request on it self
    if (req.user.id !== parseIntegerStrict(param) && req.user.username !== param && req.user.role !== ADMIN) {
        return res.status(401).json(new ResponseError("Unauthorized - Can't update other user"));
    }

    // Validation checking - if any of fields withing body for update are provided
    try {
        user = updateUserSchema.parse({
            username,
            email,
            password
        });
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', error, 'body'));
    }

    try {
        // Ako je admin napravio request
        if (req.user.role === ADMIN) {
            let id = z.number().int().parse(parseIntegerStrict(param)); // Baca ZodError ako nije moj tip Integer-a
            if ((await getUserById(id))) {
                return res.status(404).json(new ResponseError('User not found'));
            }
            await updateUserDB({ id, ...user });
        } else { // Ako je user napravio request
            await updateUserDB({ id: req.user.id, ...user });
        }
        return res.status(204).send();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json(new ResponseError('Bad request', { param: 'Expected integer' }, 'params'));
        }
        return res.status(500).json(new ResponseError(error.message));
    }
}


// Pagination, Filtration {with: userId, recivedOnly: boolean, sentOnly: boolean, orderByAsc: boolean(def true)}
/**
 * @description     Updates an account with provided token
 * @route           GET /api/users/:param/messages
 * @access          Private
 * 
 * @type {import('express').RequestHandler<{param: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const getUsersMessages = async (req, res) => {
    let user;
    try {
        let param = req.params.param;
        if (isStringInteger(param)) {
            user = await getUserById(parseInt(param, 10));
        } else {
            user = await getUserByUsername(param);
        }

        if (!user) {
            return res.status(404).json(new ResponseError('User not found'));
        }

        user = selectUserSchema.parse(user);
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }

    if (user.id !== req.user.id && req.user.role !== ADMIN) {
        return res.status(401).json(new ResponseError('Not authorized - Cannot request messages from other users'));
    }

    let userId = user.id;
    let offset, limit, chatsWith, receivedMessages, sentMessages, orderByAsc;

    // Query validation and assigning values to boolean properties to save computation
    let zerrors = new ZodError([]);
    if (req.query.offset != null && !isStringInteger(req.query.offset))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ['offset'], message: 'Expected integer' })
    if (req.query.limit != null && !isStringInteger(req.query.limit, { negative: false }))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ['limit'], message: 'Expected positive integer' })
    if (req.query.chatsWith != null && !isStringInteger(req.query.chatsWith))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ['chatsWith'], message: 'Expected integer' })
    if (req.query.receivedMessages != null && ((receivedMessages = stringToBoolean(req.query.receivedMessages)) === undefined))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ['receivedMessages'], message: 'Expected boolean. Allowed values are: ["true", "1", "yes", "y", "false", "0", "no", "n"]' })
    if (req.query.sentMessages != null && ((sentMessages = stringToBoolean(req.query.sentMessages)) === undefined))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ['sentMessages'], message: 'Expected boolean. Allowed values are: ["true", "1", "yes", "y", "false", "0", "no", "n"]' })
    if (req.query.orderByAsc != null && ((orderByAsc = stringToBoolean(req.query.receivedMessages)) === undefined))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ['orderByAsc'], message: 'Expected boolean. Allowed values are: ["true", "1", "yes", "y", "false", "0", "no", "n"]' })

    if (!zerrors.isEmpty) {
        return res.status(400).json(new ResponseError('Bad Request', zerrors, 'query'));
    }

    let x;
    offset = req.query.offset == null ? parseInt(req.query.offset, 10) : undefined;
    limit = req.query.limit == null && (x = parseInt(req.query.limit, 10)) !== 0 ? x : undefined; //if 0 then default value
    chatsWith = req.query.chatsWith ? parseInt(req.query.chatsWith, 10) : undefined;


    try {
        const result = await getUsersMessagesDB(Object.keys({
            userId,
            offset,
            limit,
            chatsWith,
            receivedMessages,
            sentMessages,
            orderByAsc
        }).forEach(key => obj[key] === undefined && delete obj[key]));

        return res.status(200).json({
            totalCount: result.totalCount,
            next: result.offset + result.limit >= totalCount ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/users/${userId}/messages?offset=${result.offset + result.limit < 0 ? 0 : result.offset}&limit=${result.offset + 2 * result.limit > result.totalresult ? result.totalCount - result.limit : result.limit}${chatsWith != null && '&chatsWith=' + chatsWith}${receivedMessages != null && '&recivedMessages=' + receivedMessages}${sentMessages != null && '&sentMessages=' + sentMessages}&orderByAsc=${orderByAsc ?? false}`,
            previous: offset === 0 ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/users/${userId}/messages?offset=${(result.offset - result.limit < 0) ? 0 : (result.offset - result.limit > result.totalCount ? result.totalCount - result.limit : result.offset - result.limit)}&limit=${result.offset - result.limit < 0 ? result.offset : result.limit}${chatsWith != null && '&chatsWith=' + chatsWith}${receivedMessages != null && '&recivedMessages=' + receivedMessages}${sentMessages != null && '&sentMessages=' + sentMessages}&orderByAsc=${orderByAsc ?? false}`,
            data: result.messagesData
        });

    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}



/**
 * @description     Sends reset-email-token to req.body.email email, changes or creates new token in database
 * @route           PUT /api/users/request-password-reset
 * @access          Public
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const requestUserPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        z.string().email().parse(email);
        const user = await getUserByEmail(String(email));

        if (!user) {
            return res.status(400).json(new ResponseError('User with this email does not exist'));
        }

        const { resetToken, passwordResetToken, expiresAt } = generateResetPasswordToken('10m');
        await insertResetPasswordToken(user.email, passwordResetToken, expiresAt);

        const resetUrl = `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/users/reset-password/${resetToken}`;
        sendPasswordResetEmail(user.email, resetUrl);

        return res.status(201).send();
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json(new ResponseError('Bad Request', err, 'body', 'email'));
        } else {
            return res.status(500).json(new ResponseError(err.message));
        }
    }
}


/**
 * @description     resets the password via provided token
 * @route           PATCH /api/users/reset-password/:token
 * @access          Private
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const resetUserPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    let user;
    try {
        const result = await getResetPasswordToken(token);
        if (!validateResetPasswordToken(token, result.token, { createdAt: result.createdAt, expiresAt: result.expiresAt })) {
            return res.status(403).json(new ResponseError('Forbidden'));
        }

        user = updateUserSchema.parse({
            password: newPassword
        });

    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(401).json(new ResponseError('Bad Request', err, 'body'));
        }
        return res.status(401).json(new ResponseError('Unauthorized - ' + err.message));
    }

    try {
        await updateUserDB(user);
        return res.status(201).send({});
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}

module.exports = {
    getUser,
    registerUser,
    loginUser,
    getUsers,
    getUsersPokemons,
    getUsersMessages,
    deleteUser,
    updateUser,
    requestUserPasswordReset,
    resetUserPassword
}