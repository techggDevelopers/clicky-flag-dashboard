const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const flagRoutes = require('./routes/flags');
const initializeFlags = require('./utils/initFlags');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Define API routes - Note: the /api prefix is handled by the proxy
app.use('/auth', authRoutes);
app.use('/flags', flagRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flag-dashboard')
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize default flags if needed
    initializeFlags();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless
module.exports = app;
