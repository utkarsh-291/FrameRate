// backend/server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware');
require('dotenv').config();



// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Allows cross-origin requests from our React frontend
app.use(express.json()); // Allows our server to accept and parse JSON data in request bodies

// Define a simple test route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the FrameRate API!" });
});

app.get('/api/status', (req, res) => {
    res.json({
        status: "online",
        app: "FrameRate Backend"
    });
});

app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: "Database connection successful!", time: result.rows[0]})
    } catch (err) {
        res.status(500).json({error: err.message });
    }
});

app.get('/api/ratings', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            'SELECT movie_id, rating FROM ratings WHERE user_id = $1',
            [userId]
        );
        res.status(200).json(result.rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const query = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id';
        const values = [email, passwordHash];
        const result = await pool.query(query, values);

        res.status(201).json({ message: "User registered successfully!", userId: result.rows[0].id});
    
    } catch(err) {
        res.status(500).json({ error: "Registration failed: " + err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, useReducer.rows[0].passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user.rows[0].id }, 'supersecret123', { expiresIn: '1h' });
    res.json({ token });
});

app.post('/api/ratings', authenticateToken, async (req, res) => {
    const { movieId, rating } = req.body;
    const userId = req.user.userId;

    try {
        await pool.query(
            'INSERT INTO ratings (user_id, movie_id, rating) VALUES ($1, $2, $3)',
            [userId, movieId, rating]
        );
        res.status(201).json({ message: "Rating saved!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/ratings/:movieId', authenticateToken, async (req, res) => {
    const { rating } = req.body; // We only need the new rating from the body
    const movieId = req.params.movieId; // We grab the movie ID from the URL
    const userId = req.user.userId; // We grab the user ID from the VIP wristband

    try {
        await pool.query(
            'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND movie_id = $3',
            [rating, userId, movieId] // Order matches $1, $2, $3 perfectly!
        );
        // 200 OK is the standard status code for a successful update
        res.status(200).json({ message: "Rating updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/api/ratings/:movieId', authenticateToken, async (req, res) => {
    const movieId = req.params.movieId; // Grab ID from the URL
    const userId = req.user.userId;     // Grab user ID from the wristband

    try {
        await pool.query(
            'DELETE FROM ratings WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId] // Only two variables needed!
        );
        res.status(200).json({ message: "Rating deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Choose a port (default to 5000)
const PORT = process.env.PORT || 5000;

app.start = app.listen(PORT, () => {
  console.log(`Server is running live on port ${PORT}`);
});