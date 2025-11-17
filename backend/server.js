const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/match', require('./routes/match'));
app.use('/api/player', require('./routes/player'));

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/lineup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/lineup.html'));
});

app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/control.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/detail.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

