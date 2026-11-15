const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['AUTH', 'GAME_CONTROL', 'PAYMENT', 'BOARD_MGMT', 'PRIZE_PAYOUT', 'SYSTEM'],
    default: 'SYSTEM'
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actorName: {
    type: String
  },
  actorRole: {
    type: String
  },
  targetId: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

