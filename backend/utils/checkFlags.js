const mongoose = require('mongoose');
const Flag = require('../models/Flag');
require('dotenv').config();

const checkFlags = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all flags
        const flags = await Flag.find({});
        console.log('\nCurrent flags in database:');
        console.log(JSON.stringify(flags, null, 2));

        // Close the connection
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');

        process.exit(0);
    } catch (error) {
        console.error('Error checking flags:', error);
        process.exit(1);
    }
};

// Run the check
checkFlags(); 