require('dotenv').config();
const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

module.exports = db;

