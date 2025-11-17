const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

// Simple token generation (in production, use JWT)
const generateToken = () => {
  return Buffer.from(`${ADMIN_USERNAME}:${Date.now()}`).toString('base64');
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Check hardcoded admin credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create or get admin user in database
      let user = await User.findOne({ username: ADMIN_USERNAME });
      
      if (!user) {
        user = await User.create({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
          role: 'admin'
        });
      }

      const token = generateToken();
      
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;

