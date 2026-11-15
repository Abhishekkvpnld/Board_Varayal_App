const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  boardNumber: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  grid: {
    type: [[Number]],
    required: true,
    validate: {
      validator: function(val) {
        if (!Array.isArray(val) || val.length !== 4) return false;
        for (let row of val) {
          if (!Array.isArray(row) || row.length !== 4) return false;
        }
        return true;
      },
      message: 'Grid must be a 4x4 array of numbers'
    }
  },
  numbers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(val) {
        if (!Array.isArray(val) || val.length !== 16) return false;
        const set = new Set(val);
        if (set.size !== 16) return false;
        return val.every(n => Number.isInteger(n) && n >= 1 && n <= 119);
      },
      message: 'Numbers must contain exactly 16 unique integers between 1 and 119'
    }
  },
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

boardSchema.index({ numbers: 1 });

module.exports = mongoose.model('Board', boardSchema);

