
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
 * @param {boolean} returnOriginal - if true returns originaly passed object, otherwiser undefined (default: false)
 * @returns {number | undefined} The parsed integer or undefined if not valid.
 */
const parseIntegerStrict = (str, returnOriginal = false) => {
    return /^-?\d+$/.test(String(str)) && Number.isSafeInteger(+str) ? +str : undefined;
}


/** Checks if the string is a valid integer 
 * @param {string} str 
 * @param {{negative: boolean, positive: boolean, zero: boolean}} options
 */
const isStringInteger = (str, { negative = true, positive = true, zero = true }) => {
    if (!negative && !positive && !zero) throw new Error('Select at least one option');
    let test;
    test = /^-?\d+$/.test(String(str)) && Number.isSafeInteger(+str);
    return test && ((negative && +str < 0) || (positive && +str > 0) || (zero && +str === 0));

}

/**
 * Parses value to its true value
 * @param {string} str if not a string, returns a value it self
 * @returns {any}
 */
const dynamicParseStringToPrimitives = (str) => {
    if (typeof str !== 'string') return str;
    if (str.trim() === '') return str;
    if (str === 'undefined') return undefined;
    if (str === 'null') return null;
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'NaN') return NaN;
    if (!isNaN(Number(str))) return Number(str); // todo: Vratiće cropovan number i ako je prosledjen bigint number
    try {
        return BigInt(str.endsWith('n') ? str.slice(0, -1) : str);
    } catch (error) { }
    
    return str; // Not parsing functions, regex and object
}

module.exports = {
    dynamicParseStringToPrimitives,
    isStringInteger,
    parseIntegerStrict,
    stringToBoolean
}