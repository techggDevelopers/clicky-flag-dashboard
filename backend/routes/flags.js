const express = require('express');
const Flag = require('../models/Flag');
const UserFlag = require('../models/UserFlag');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all flags
router.get('/', auth, async (req, res) => {
  try {
    const flags = await Flag.find();
    res.json(flags);
  } catch (error) {
    console.error('Error fetching flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user-specific flags
router.get('/user', auth, async (req, res) => {
  try {
    const userFlags = await UserFlag.find({ userId: req.userId });
    res.json(userFlags);
  } catch (error) {
    console.error('Error fetching user flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle a flag for a user
router.post('/toggle/:flagName', auth, async (req, res) => {
  try {
    const { flagName } = req.params;
    const { enabled } = req.body;
    const userId = req.userId;

    // Check if flag exists
    const flag = await Flag.findOne({ name: flagName });
    if (!flag) {
      return res.status(404).json({ message: 'Flag not found' });
    }

    // If we're enabling this flag, disable all other flags first
    if (enabled) {
      await UserFlag.updateMany(
        { userId, flagName: { $ne: flagName } },
        { enabled: false }
      );
    }

    // Update or create user flag
    const userFlag = await UserFlag.findOneAndUpdate(
      { userId, flagName },
      { enabled },
      { upsert: true, new: true }
    );

    return res.json(userFlag);
  } catch (error) {
    console.error('Error toggling flag:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Initialize flags (admin only)
router.post('/initialize', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can initialize flags' });
    }

    const count = await Flag.countDocuments();
    if (count === 0) {
      const initialFlags = [
        { name: "F1", label: "Danger", description: "Self Destruct & ShutDown" },
        { name: "F2", label: "Restore", description: "Self Restore & Start Apps" },
        { name: "F3", label: "Support", description: "Allow remote access for support" }
      ];

      await Flag.insertMany(initialFlags);
      res.json({ message: 'Flags initialized successfully' });
    } else {
      res.json({ message: 'Flags already exist' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
