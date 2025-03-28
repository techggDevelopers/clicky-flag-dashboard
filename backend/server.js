
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import modules
const connectDB = require('./config/db');
const initializeFlags = require('./utils/initFlags');
const authRoutes = require('./routes/auth');
const flagRoutes = require('./routes/flags');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize flags if needed
initializeFlags();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flags', flagRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
