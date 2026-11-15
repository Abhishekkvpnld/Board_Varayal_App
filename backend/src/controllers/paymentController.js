const Payment = require('../models/Payment');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendToUser, broadcastToAdmin } = require('../services/socketService');

/**
 * @route POST /api/payments/submit
 * User submits payment proof (UTR / Transaction ID)
 */
const submitPayment = async (req, res) => {
  try {
    const { amount, utrNumber, payerUpiId, paymentMethod, screenshotUrl, purpose, gameSessionId, requestedBoardNumber } = req.body;
    const userId = req.user._id;

    if (!amount || !utrNumber) {
      return res.status(400).json({ success: false, message: 'Amount and 12-digit UTR reference are required' });
    }

    const cleanUtr = utrNumber.trim().toUpperCase();
    if (cleanUtr.length < 8) {
      return res.status(400).json({ success: false, message: 'Please provide a valid banking UTR / Transaction Reference' });
    }

    // Check for duplicate UTR submission
    const existing = await Payment.findOne({ utrNumber: cleanUtr });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This UTR / Transaction Reference has already been submitted. Please check your transaction history.'
      });
    }

    const user = await User.findById(userId);

    const payment = await Payment.create({
      userId,
      userName: user.name,
      userPhone: user.phone,
      amount: Number(amount),
      utrNumber: cleanUtr,
      payerUpiId: payerUpiId || '',
      paymentMethod: paymentMethod || 'UPI',
      screenshotUrl: screenshotUrl || '',
      purpose: purpose || 'WALLET_RECHARGE',
      gameSessionId,
      requestedBoardNumber,
      status: 'pending'
    });

    await AuditLog.create({
      action: 'PAYMENT_SUBMITTED',
      category: 'PAYMENT',
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      targetId: payment._id.toString(),
      details: { amount: payment.amount, utrNumber: cleanUtr }
    });

    // Notify admins of incoming payment to verify
    broadcastToAdmin('NEW_PAYMENT_PENDING', {
      paymentId: payment._id,
      userName: user.name,
      userPhone: user.phone,
      amount: payment.amount,
      utrNumber: cleanUtr
    });

    res.status(201).json({
      success: true,
      message: 'Payment verification request submitted successfully. Admin will review and credit within 5-10 minutes.',
      payment
    });
  } catch (error) {
    console.error('Payment Submission Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment submission failed' });
  }
};

/**
 * @route GET /api/payments/my
 * User: get my payment history
 */
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/payments/admin/all
 * Admin: get all payments with filtering
 */
const getAllPayments = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userPhone: { $regex: search, $options: 'i' } },
        { utrNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    const pendingCount = await Payment.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      payments,
      pendingCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/payments/admin/verify/:id
 * Admin: approve or reject payment
 */
const verifyPayment = async (req, res) => {
  try {
    const { action, adminNotes } = req.body; // 'approve' or 'reject'
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Payment is already marked as ${payment.status}` });
    }

    if (action === 'approve') {
      payment.status = 'approved';
      payment.adminNotes = adminNotes || 'Verified by Admin';
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();
      await payment.save();

      // Credit user's wallet
      const updatedUser = await User.findByIdAndUpdate(
        payment.userId,
        { $inc: { walletBalance: payment.amount } },
        { new: true }
      );

      await AuditLog.create({
        action: 'PAYMENT_APPROVED',
        category: 'PAYMENT',
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        targetId: payment._id.toString(),
        details: {
          creditedUserId: payment.userId,
          amount: payment.amount,
          newBalance: updatedUser.walletBalance
        }
      });

      // Send live socket event to user
      sendToUser(payment.userId.toString(), 'PAYMENT_VERIFIED', {
        paymentId: payment._id,
        status: 'approved',
        amount: payment.amount,
        newBalance: updatedUser.walletBalance,
        message: `Your payment of ₹${payment.amount} has been verified! Wallet credited.`
      });

      return res.json({
        success: true,
        message: `Payment approved! ₹${payment.amount} credited to ${payment.userName}'s wallet.`,
        payment
      });
    } else if (action === 'reject') {
      payment.status = 'rejected';
      payment.adminNotes = adminNotes || 'Rejected during verification';
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();
      await payment.save();

      await AuditLog.create({
        action: 'PAYMENT_REJECTED',
        category: 'PAYMENT',
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        targetId: payment._id.toString(),
        details: { reason: adminNotes }
      });

      sendToUser(payment.userId.toString(), 'PAYMENT_VERIFIED', {
        paymentId: payment._id,
        status: 'rejected',
        message: `Payment verification failed. Note: ${payment.adminNotes}`
      });

      return res.json({
        success: true,
        message: 'Payment rejected',
        payment
      });
    } else {
      return res.status(400).json({ success: false, message: 'Action must be "approve" or "reject"' });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/payments/payment-details
 * Returns UPI details and QR info for deposit
 */
const getPaymentInfo = (req, res) => {
  res.json({
    success: true,
    upiId: process.env.UPI_ID || 'varayal.games@upi',
    merchantName: process.env.UPI_NAME || 'Board Varayal Games',
    acceptedMethods: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Direct Bank Transfer'],
    instructions: [
      '1. Scan the QR code or send to UPI ID: ' + (process.env.UPI_ID || 'varayal.games@upi'),
      '2. Note the 12-digit UPI Reference Number / UTR from your bank app receipt.',
      '3. Enter the exact Amount and UTR reference number below.',
      '4. Admins verify against banking logs within 2 to 5 minutes and credit your wallet.'
    ]
  });
};

module.exports = {
  submitPayment,
  getMyPayments,
  getAllPayments,
  verifyPayment,
  getPaymentInfo
};

