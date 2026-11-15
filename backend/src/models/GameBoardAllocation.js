const mongoose = require('mongoose');

const gameBoardAllocationSchema = new mongoose.Schema({
  gameSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession',
    required: true,
    index: true
  },
  boardNumber: {
    type: Number,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  // Snapshot of 4x4 grid and flat numbers list
  grid: {
    type: [[Number]],
    required: true
  },
  numbers: {
    type: [Number],
    required: true
  },
  markedNumbers: {
    type: [Number],
    default: []
  },
  wonRules: [{
    ruleKey: String,
    ruleName: String,
    prizeAmount: Number,
    wonAt: { type: Date, default: Date.now },
    winningBallNumber: Number
  }],
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  isVerifiedWinner: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// CRITICAL UNIQUE CONSTRAINT: Exactly one allocation of a given boardNumber per gameSession!
// This atomic index physically prevents duplicate board allocation at the database engine level.
gameBoardAllocationSchema.index({ gameSessionId: 1, boardNumber: 1 }, { unique: true });

module.exports = mongoose.model('GameBoardAllocation', gameBoardAllocationSchema);

