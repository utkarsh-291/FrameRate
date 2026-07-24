const pool = require('./db');

const createTables = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ratings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            movie_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            CONSTRAINT unique_user_movie UNIQUE (user_id, movie_id)
        );
    `;

    try {
        console.log("Connecting to database and creating tables...");
        await pool.query(queryText);
        console.log("Success! Tables 'users' and 'ratings' have been created.");
    } catch (err) {
        console.error("Error creating tables: ", err);
    } finally {
        process.exit(0);
    }
};

createTables();