// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

// The Pool manages multiple connections to our database efficiently
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;