const path = require('path');
const { defineConfig } = require("drizzle-kit");

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = defineConfig({
    schema: "./db/schema.js",
    out: "./db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL
    },
});