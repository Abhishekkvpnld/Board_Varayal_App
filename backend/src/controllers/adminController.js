const User = require('../models/User');
const GameSession = require('../models/GameSession');
const GameBoardAllocation = require('../models/GameBoardAllocation');
const Payment = require('../models/Payment');
const Board = require('../models/Board');
const AuditLog = require('../models/AuditLog');

/**
 * @route GET /api/admin/analytics
 * Comprehensive dashboard metrics
 */
const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalGames = await GameSession.countDocuments();
    const liveGames = await GameSession.countDocuments({ status: { $in: ['active', 'paused'] } });
    const totalAllocations = await GameBoardAllocation.countDocuments();
    const totalMasterBoards = await Board.countDocuments();

    // Financial aggregates
    const approvedPayments = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = approvedPayments[0]?.totalRevenue || 0;

    const pendingPaymentsCount = await Payment.countDocuments({ status: 'pending' });

    // Prize calculations
    const games = await GameSession.find({ status: { $in: ['active', 'completed'] } });
    let totalPrizesPaid = 0;
    games.forEach(g => {
      g.winningRules.forEach(r => {
        if (r.winners && r.winners.length > 0) {
          totalPrizesPaid += (r.prizeAmount * r.winners.length);
        }
      });
    });

    // Recent 10 audit activities
    const recentLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent payments
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalGames,
        liveGames,
        totalAllocations,
        totalMasterBoards,
        totalRevenue,
        pendingPaymentsCount,
        totalPrizesPaid
      },
      recentLogs,
      recentPayments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/admin/users
 * User list with search and pagination
 */
const getUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const search = req.query.search;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/users/:id/adjust-balance
 * Admin: Manual credit or debit to user wallet
 */
const adjustUserBalance = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount === 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.walletBalance + numAmount < 0) {
      return res.status(400).json({ success: false, message: 'Insufficient balance for debit' });
    }

    user.walletBalance += numAmount;
    await user.save();

    await AuditLog.create({
      action: 'ADMIN_WALLET_ADJUST',
      category: 'PRIZE_PAYOUT',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetId: user._id.toString(),
      details: { amount: numAmount, newBalance: user.walletBalance, reason: reason || 'Manual Admin Adjustment' }
    });

    res.json({
      success: true,
      message: `Balance adjusted by ₹${numAmount}. New balance: ₹${user.walletBalance}`,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/admin/users/:id/toggle-status
 * Admin: Enable/disable user account
 */
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      action: 'USER_STATUS_TOGGLED',
      category: 'AUTH',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetId: user._id.toString(),
      details: { isActive: user.isActive }
    });

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Suspended'}`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/admin/audit-logs
 * Fetch audit logs with filtering
 */
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const category = req.query.category;

    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminAnalytics,
  getUsersList,
  adjustUserBalance,
  toggleUserStatus,
  getAuditLogs
};

