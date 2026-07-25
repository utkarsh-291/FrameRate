// backend/server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Allows cross-origin requests from our React frontend
app.use(express.json()); // Allows our server to accept and parse JSON data in request bodies

// ==========================================
// RATE LIMITERS
// ==========================================
// A. General App Limiter (Invisible to real users, stops spam bots)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Max 300 requests per 15 mins
    message: { error: "Too many requests. Please slow down!" }
});

// B. Auth Limiter (Protects login/register against password brute-forcing)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 attempts per 15 mins
    message: { error: "Too many login attempts. Please wait 15 minutes before trying again." }
});

// C. AI Limiter (Protects your free Gemini quota)
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Max 5 requests per hour
    message: { error: "You've reached your hourly AI recommendation limit. Please try again later!" }
});

// Apply general limiter globally to ALL routes
app.use(generalLimiter);

// ==========================================
// ROUTES
// ==========================================
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

// 👈 Notice authLimiter is attached directly here:
app.post('/api/register', authLimiter, async (req, res) => {
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

// 👈 Notice authLimiter is attached directly here:
app.post('/api/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(400).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!valid) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: "Login failed: " + err.message });
    }
});

app.post('/api/ratings', authenticateToken, async (req, res) => {
    const { movieId, rating } = req.body;
    const userId = req.user.userId;

    try {
        await pool.query(
            `INSERT INTO ratings (user_id, movie_id, rating) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id, movie_id) 
             DO UPDATE SET rating = EXCLUDED.rating`,
            [userId, movieId, rating]
        );
        res.status(200).json({ message: "Rating saved successfully!" });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/ratings/:movieId', authenticateToken, async (req, res) => {
    const movieId = req.params.movieId; 
    const userId = req.user.userId;     

    try {
        await pool.query(
            'DELETE FROM ratings WHERE user_id = $1 AND movie_id = $2',
            [userId, movieId] 
        );
        res.status(200).json({ message: "Rating deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/account', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.status(200).json({ message: "Account and all ratings deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👈 Notice aiLimiter sits right next to authenticateToken here:
app.post('/api/recommendations', authenticateToken, aiLimiter, async (req, res) => {
    const { ratedMovies } = req.body;

    if (!ratedMovies || ratedMovies.length === 0) {
        return res.status(400).json({ error: "No ratings found to base recommendations on." });
    }

    try {
        const movieData = ratedMovies.map(m => {
            const genreString = m.genres ? m.genres.map(g => g.name).join(', ') : 'General Film';
            return `- ${m.title}: ${m.userRating}/5 stars (Genres: ${genreString})`;
        }).join('\n');

        const prompt = `
        Act as an expert film curator. I have attached a list of movies I have watched, along with my 1 to 5 star ratings and genres:
        
        ${movieData}
        
        Analyze my taste profile. Provide exactly 3 highly tailored movie recommendations I have not seen.
        
        You MUST respond ONLY with a valid JSON array of objects. Do not include markdown formatting, code blocks, or conversational text. Use this exact schema:
        [
          {
            "title": "Movie Title",
            "year": "Release Year",
            "genre": "Primary Genres",
            "reason": "A 2-sentence explanation directly referencing my specific star ratings for why I will love this.",
            "vibe": "3 descriptive keywords (e.g., Atmospheric, Tense, Cerebral)"
          }
        ]
        `;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        const result = await model.generateContent(prompt);
        const jsonText = result.response.text();
        
        const recommendationsArray = JSON.parse(jsonText);

        res.json({ recommendations: recommendationsArray });
    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ error: err.message || "Failed to generate recommendations from Google AI." });
    }
});

// Choose a port (default to 5000)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running live on port ${PORT}`);
});