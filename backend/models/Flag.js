const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  description: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const Flag = mongoose.model('Flag', flagSchema);

module.exports = Flag;
