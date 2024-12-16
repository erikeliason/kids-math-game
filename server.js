const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('game_results.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create answers table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        problem TEXT NOT NULL,
        user_answer INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Endpoint to record answers
app.post('/api/answer', (req, res) => {
    const { problem, user_answer, is_correct } = req.body;
    
    const sql = `
        INSERT INTO answers (problem, user_answer, is_correct)
        VALUES (?, ?, ?)
    `;
    
    db.run(sql, [problem, user_answer, is_correct], function(err) {
        if (err) {
            console.error('Error inserting answer:', err);
            res.status(500).json({ error: 'Failed to save answer' });
            return;
        }
        res.json({
            success: true,
            id: this.lastID
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
