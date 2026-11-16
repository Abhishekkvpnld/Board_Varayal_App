const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getUsersList,
  verifyUser,
  blockUser,
  unblockUser,
  adjustUserBalance,
  toggleUserStatus,
  getAuditLogs
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/analytics', getAdminAnalytics);
router.get('/users', getUsersList);
router.post('/users/:id/verify', verifyUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);
router.post('/users/:id/adjust-balance', adjustUserBalance);
router.post('/users/:id/toggle-status', toggleUserStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
