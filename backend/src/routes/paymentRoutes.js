const express = require('express');
const router = express.Router();
const {
  submitPayment,
  getMyPayments,
  getAllPayments,
  verifyPayment,
  getPaymentInfo
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/info', getPaymentInfo);
router.post('/submit', protect, submitPayment);
router.get('/my', protect, getMyPayments);

// Admin payment verification
router.get('/admin/all', protect, adminOnly, getAllPayments);
router.post('/admin/verify/:id', protect, adminOnly, verifyPayment);

module.exports = router;

