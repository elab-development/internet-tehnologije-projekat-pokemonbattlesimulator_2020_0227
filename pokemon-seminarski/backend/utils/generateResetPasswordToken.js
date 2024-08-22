const crypto = require('crypto');

/** 
 * @param {string} time Allowed values `[number]['s','m','h','d','w','M','y']`
 * @returns {number} time in miliseconds
*/
const parseTime = (time) => {
    const regex = /^(\d+)([smhdwMy])$/;
    const match = time.match(regex);

    if (!match) {
        throw new Error('Invalid format. Use format like 10m, 10s, 1y, etc.');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    let milliseconds;

    switch (unit) {
        case 's': // seconds
            milliseconds = value * 1000;
            break;
        case 'm': // minutes
            milliseconds = value * 60 * 1000;
            break;
        case 'h': // hours
            milliseconds = value * 60 * 60 * 1000;
            break;
        case 'd': // days
            milliseconds = value * 24 * 60 * 60 * 1000;
            break;
        case 'w': // weeks
            milliseconds = value * 7 * 24 * 60 * 60 * 1000;
            break;
        case 'M': // months (approximated as 30 days)
            milliseconds = value * 30 * 24 * 60 * 60 * 1000;
            break;
        case 'y': // years (approximated as 365 days)
            milliseconds = value * 365 * 24 * 60 * 60 * 1000;
            break;
        default:
            throw new Error('Invalid time unit.');
    }

    return milliseconds;
}


/**
 *  @param {string} expiresIn Allowed values `[number]['s','m','h','d','w','M','y']` and `null`
 */
const generateResetPasswordToken = (expiresIn = '10m') => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = expiresIn === null ? null : new Date(Date.now() + parseTime(expiresIn));
    return { resetToken, passwordResetToken, expiresAt }
}

/**
 * @param {string} token 
 * @param {string} hashedToken 
 * @param {{expiresAt: Date, createdAt: Date}} dateInfo 
 * @returns 
 */
const validateResetPasswordToken = (token, hashedToken, dateInfo) => {
    return (
        crypto.createHash('sha256').update(token).digest('hex') === hashedToken
        && (dateInfo != null && dateInfo.expiresAt != null ? dateInfo.expiresAt <= new Date() : true)
    );
}

module.exports = {
    generateResetPasswordToken,
    validateResetPasswordToken
}