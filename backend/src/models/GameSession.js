const mongoose = require('mongoose');

const winningRuleSchema = new mongoose.Schema({
  ruleKey: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  prizeAmount: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  enabled: {
    type: Boolean,
    default: true
  },
  claimed: {
    type: Boolean,
    default: false
  },
  maxWinners: {
    type: Number,
    default: 1
  },
  winners: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    userPhone: String,
    boardNumber: Number,
    allocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameBoardAllocation' },
    claimedAt: { type: Date, default: Date.now },
    winningBallNumber: Number,
    verified: { type: Boolean, default: true }
  }]
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  gameCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  ticketPrice: {
    type: Number,
    required: true,
    default: 25,
    min: 0
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  drawnNumbers: {
    type: [Number],
    default: []
  },
  currentNumber: {
    type: Number,
    default: null
  },
  remainingNumbers: {
    type: [Number],
    default: function() {
      return Array.from({ length: 119 }, (_, i) => i + 1);
    }
  },
  winningRules: {
    type: [winningRuleSchema],
    default: [
      { ruleKey: 'four_in_a_row', name: '4 in a Row (Any Horizontal Line)', prizeAmount: 75, enabled: true, maxWinners: 1 },
      { ruleKey: 'four_in_a_column', name: '4 in a Column (Any Vertical Line)', prizeAmount: 75, enabled: true, maxWinners: 1 },
      { ruleKey: 'four_in_a_diagonal', name: '4 in a Diagonal (Corner-to-Corner)', prizeAmount: 80, enabled: true, maxWinners: 1 },
      { ruleKey: 'any_line_four', name: 'Combined Any 4 in Line (Row, Column, or Diagonal)', prizeAmount: 75, enabled: true, maxWinners: 1 },
      { ruleKey: 'four_corners', name: 'Four Corners [0,0 / 0,3 / 3,0 / 3,3]', prizeAmount: 85, enabled: true, maxWinners: 1 },
      { ruleKey: 'corner_box_four', name: 'Corner 2×2 Box (4 Adjacent Corner Numbers)', prizeAmount: 80, enabled: true, maxWinners: 1 },
      { ruleKey: 'center_four', name: 'Center Square (Inner 2×2 Core)', prizeAmount: 80, enabled: true, maxWinners: 1 },
      { ruleKey: 'connected_four', name: 'Any 4 Connected Numbers (Adjacent Block)', prizeAmount: 60, enabled: true, maxWinners: 1 },
      { ruleKey: 'early_five', name: 'Early Five (Fast 5 Any Numbers)', prizeAmount: 50, enabled: true, maxWinners: 1 },
      { ruleKey: 'full_house', name: 'Full House (All 16 Numbers Stamped)', prizeAmount: 500, enabled: true, maxWinners: 1 }
    ]
  },
  autoDraw: {
    enabled: { type: Boolean, default: false },
    intervalSeconds: { type: Number, default: 6 }
  },
  totalBoardsBooked: {
    type: Number,
    default: 0
  },
  totalPrizePool: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GameSession', gameSessionSchema);

