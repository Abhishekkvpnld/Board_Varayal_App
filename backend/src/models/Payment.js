const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: [1, 'Minimum payment is ₹1']
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'QR_SCAN', 'NET_BANKING', 'ADMIN_CREDIT'],
    default: 'UPI'
  },
  utrNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  payerUpiId: {
    type: String,
    trim: true
  },
  screenshotUrl: {
    type: String,
    default: ''
  },
  purpose: {
    type: String,
    enum: ['WALLET_RECHARGE', 'DIRECT_BOARD_PURCHASE'],
    default: 'WALLET_RECHARGE'
  },
  gameSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession'
  },
  requestedBoardNumber: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  adminNotes: {
    type: String,
    default: ''
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);

