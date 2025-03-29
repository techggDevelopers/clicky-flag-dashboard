
const express = require('express');
const Flag = require('../models/Flag');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all flags
router.get('/', async (req, res) => {
  try {
    const flags = await Flag.find().sort({ name: 1 });
    res.json(flags);
  } catch (error) {
    console.error('Error fetching flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update flag
router.patch('/:name', auth, async (req, res) => {
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

module.exports = router;
