const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
    dialect: "postgresql",
    schema: "./schema.js",
    out: "./migrations"  
})