const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user info to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.isDangerMode = decoded.isDangerMode || false;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token is invalid' });
  }
};

// Admin check middleware
const admin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Danger mode check middleware
const dangerMode = (req, res, next) => {
  if (!req.isDangerMode) {
    return res.status(403).json({ message: 'Access denied. Danger mode required.' });
  }
  next();
};

module.exports = { auth, admin, dangerMode };

