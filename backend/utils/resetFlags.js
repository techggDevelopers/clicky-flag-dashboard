const mongoose = require('mongoose');
const Flag = require('../models/Flag');
const initializeFlags = require('./initFlags');
require('dotenv').config();

const resetFlags = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete all existing flags
        await Flag.deleteMany({});
        console.log('All flags deleted');

        // Reinitialize flags
        await initializeFlags();
        console.log('Flags reinitialized');

        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting flags:', error);
        process.exit(1);
    }
};

// Run the reset
resetFlags(); 