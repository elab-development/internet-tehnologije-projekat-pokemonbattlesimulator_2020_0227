const { drizzle } = require("drizzle-orm/neon-http");
const { migrate } = require("drizzle-orm/neon-http/migrator");
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URI);

const db = drizzle(sql);

const main = async () => {
    try {
        await migrate(db, {
            migrationsFolder: "./db/migrations",
        });

        console.log("Migration successful");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

main();