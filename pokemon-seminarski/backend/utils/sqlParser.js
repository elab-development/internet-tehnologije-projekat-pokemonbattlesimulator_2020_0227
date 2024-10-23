const escapeLikePattern = (pattern) => pattern != null ? pattern.replace(/[%_]/g, char => `\\${char}`) : undefined;
module.exports = { escapeLikePattern };