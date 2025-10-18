function getClientURL() {
    return process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`
}
module.exports = getClientURL;