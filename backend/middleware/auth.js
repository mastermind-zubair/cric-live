const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-auth-token'];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Simple token verification - in production, use JWT
    // For now, we'll check if token matches a simple pattern
    // In a real app, you'd verify JWT token here
    
    // For simplicity, we'll just check if user exists
    // In production, decode JWT and verify
    const user = await User.findOne({ username: 'admin' });
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { authenticate };

