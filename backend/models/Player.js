const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  battingPosition: {
    type: String,
    enum: ['opening', 'middle-order', 'lower-order'],
    required: true
  },
  battingType: {
    type: String,
    enum: ['left-hand', 'right-hand'],
    required: true
  },
  bowlingType: {
    type: String,
    enum: ['fast', 'medium', 'leg-spin', 'off-spin', 'none'],
    default: 'none'
  }
});

module.exports = mongoose.model('Player', playerSchema);

