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
const healthRoutes = require('./routes/health');
const initializeFlags = require('./utils/initFlags');

// Initialize express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Allow any origin in development
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:3000',
      'https://your-production-domain.com'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(null, true); // Allow all origins in current state
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Define API routes - Note: the /api prefix is handled by the proxy
app.use('/auth', authRoutes);
app.use('/flags', flagRoutes);
app.use('/health', healthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

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
  // Check if build directory exists before trying to serve from it
  const buildPath = path.join(__dirname, '../build');

  try {
    // Only set up static serving if the directory exists
    if (require('fs').existsSync(buildPath)) {
      console.log('Serving static files from build directory');
      app.use(express.static(buildPath));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html'));
      });
    } else {
      console.log('Build directory not found - skipping static file serving');
    }
  } catch (error) {
    console.error('Error checking for build directory:', error);
  }
}

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless
module.exports = app;
