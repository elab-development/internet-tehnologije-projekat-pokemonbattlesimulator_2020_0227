
/**
* Converts a string to a boolean, handling common truthy and falsy strings.
* @param {string} str - The string to convert.
* @returns {boolean | undefined} - The converted boolean value. Allowed values: `["true", "1", "yes", "y", "false", "0", "no", "n"]`
*/
const stringToBoolean = (str) => {
    if (typeof str !== 'string') return false;

    switch (str.toLowerCase().trim()) {
        case "true":
        case "1":
        case "yes":
        case "y":
            return true;
        case "false":
        case "0":
        case "no":
        case "n":
            return false;
        default:
            return undefined;
    }
}
/**
 * Parses a string to an integer and returns undefined if the input is not a valid integer.
 * @param {string} str - The string to parse.
 * @returns {number|undefined} - The parsed integer or undefined if not valid.
 */
const parseIntegerStrict = (str) => {
    return /^-?\d+$/.test(String(str)) && Number.isSafeInteger(+str) ? +str : undefined;
}

const isNullOrUndefined = (param) => {
    return param === undefined || param === null;
}
/** Checks if the string is a valid integer 
 * @param {string} str 
 */
const isStringInteger = (str) => {
    return /^-?\d+$/.test(String(str)) && Number.isSafeInteger(+str);
}

module.exports = {
    isStringInteger,
    isNullOrUndefined,
    parseIntegerStrict,
    stringToBoolean
}