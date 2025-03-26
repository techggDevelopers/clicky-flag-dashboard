
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feature-flags-db')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Flag Schema
const flagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  label: { type: String, required: true },
  description: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Flag = mongoose.model('Flag', flagSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Insert initial flags if none exist
const initializeFlags = async () => {
  const count = await Flag.countDocuments();
  if (count === 0) {
    const initialFlags = [
      { 
        name: "F1", 
        label: "Analytics", 
        description: "Enable data collection and performance analytics",
        enabled: false
      },
      { 
        name: "F2", 
        label: "Dark Mode", 
        description: "Enable dark mode appearance throughout the app",
        enabled: false
      },
      { 
        name: "F3", 
        label: "Notifications", 
        description: "Enable push and email notifications for new events",
        enabled: false
      },
      { 
        name: "F4", 
        label: "Beta Features", 
        description: "Access experimental features before public release",
        enabled: false
      }
    ];
    
    await Flag.insertMany(initialFlags);
    console.log('Initial flags created');
  }
};

initializeFlags();

// Routes
// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Flag Routes
app.get('/api/flags', auth, async (req, res) => {
  try {
    const flags = await Flag.find().sort({ name: 1 });
    res.json(flags);
  } catch (error) {
    console.error('Error fetching flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/flags/:name', auth, async (req, res) => {
  try {
    const { name } = req.params;
    const { enabled } = req.body;
    
    const flag = await Flag.findOne({ name });
    if (!flag) {
      return res.status(404).json({ message: 'Flag not found' });
    }
    
    flag.enabled = enabled;
    flag.updatedAt = Date.now();
    await flag.save();
    
    res.json(flag);
  } catch (error) {
    console.error('Error updating flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
