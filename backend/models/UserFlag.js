const mongoose = require('mongoose');

const userFlagSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flagName: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create a compound index to ensure one active flag per user
userFlagSchema.index({ userId: 1, flagName: 1 }, { unique: true });

const UserFlag = mongoose.model('UserFlag', userFlagSchema);

module.exports = UserFlag; 