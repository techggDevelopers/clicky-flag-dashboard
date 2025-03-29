
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import modules
const connectDB = require('./config/db');
const initializeFlags = require('./utils/initFlags');
const authRoutes = require('./routes/auth');
const flagRoutes = require('./routes/flags');

const app = express();

// CORS configuration - allow your frontend domain
const corsOptions = {
  origin: ['https://clicky-flag-dashboard-front.vercel.app', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
// app.use(cors(corsOptions));
app.use(cors()); // Allow all origins for development
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize flags if needed
initializeFlags();

// Routes
app.use('/auth', authRoutes);
app.use('/flags', flagRoutes);

// For local development
const PORT = process.env.PORT || 5000;

// Handle both local development and Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
