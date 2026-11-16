const User = require('../models/User');
const GameSession = require('../models/GameSession');
const GameBoardAllocation = require('../models/GameBoardAllocation');
const Payment = require('../models/Payment');
const Board = require('../models/Board');
const AuditLog = require('../models/AuditLog');

const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const pendingVerification = await User.countDocuments({ role: 'user', isVerified: false, isBlocked: { $ne: true } });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const verifiedUsers = await User.countDocuments({ role: 'user', isVerified: true });
    const totalGames = await GameSession.countDocuments();
    const liveGames = await GameSession.countDocuments({ status: { $in: ['active', 'paused'] } });
    const totalAllocations = await GameBoardAllocation.countDocuments();
    const totalMasterBoards = await Board.countDocuments();

    const approvedPayments = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = approvedPayments[0]?.totalRevenue || 0;
    const pendingPaymentsCount = await Payment.countDocuments({ status: 'pending' });

    const games = await GameSession.find({ status: { $in: ['active', 'completed'] } });
    let totalPrizesPaid = 0;
    games.forEach(g => {
      g.winningRules.forEach(r => {
        if (r.winners && r.winners.length > 0) {
          totalPrizesPaid += (r.prizeAmount * r.winners.length);
        }
      });
    });

    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
    const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers, totalAdmins, pendingVerification, blockedUsers, verifiedUsers,
        totalGames, liveGames, totalAllocations, totalMasterBoards,
        totalRevenue, pendingPaymentsCount, totalPrizesPaid
      },
      recentLogs,
      recentPayments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const search = req.query.search;
    const filter = req.query.filter;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (filter === 'pending') {
      query.isVerified = false;
      query.isBlocked = { $ne: true };
      query.role = 'user';
    } else if (filter === 'verified') {
      query.isVerified = true;
      query.role = 'user';
    } else if (filter === 'blocked') {
      query.isBlocked = true;
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Admin accounts are always verified' });

    user.isVerified = true;
    await user.save();

    await AuditLog.create({
      action: 'USER_VERIFIED',
      category: 'AUTH',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetId: user._id.toString(),
      details: { userName: user.name, phone: user.phone }
    });

    res.json({
      success: true,
      message: `User "${user.name}" has been verified and can now login and participate in games.`,
      user: { id: user._id, name: user.name, phone: user.phone, isVerified: user.isVerified, isBlocked: user.isBlocked }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block an admin account' });

    user.isBlocked = true;
    await user.save();

    await AuditLog.create({
      action: 'USER_BLOCKED',
      category: 'AUTH',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetId: user._id.toString(),
      details: { userName: user.name, phone: user.phone }
    });

    res.json({
      success: true,
      message: `User "${user.name}" has been blocked.`,
      user: { id: user._id, name: user.name, phone: user.phone, isVerified: user.isVerified, isBlocked: user.isBlocked }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = false;
    await user.save();

    await AuditLog.create({
      action: 'USER_UNBLOCKED',
      category: 'AUTH',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetId: user._id.toString(),
      details: { userName: user.name, phone: user.phone }
    });

    res.json({
      success: true,
      message: `User "${user.name}" has been unblocked.`,
      user: { id: user._id, name: user.name, phone: user.phone, isVerified: user.isVerified, isBlocked: user.isBlocked }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adjustUserBalance = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.walletBalance + numAmount < 0) return res.status(400).json({ success: false, message: 'Insufficient balance for debit' });

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
      user: { id: user._id, name: user.name, phone: user.phone, walletBalance: user.walletBalance }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

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

const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const category = req.query.category;

    let query = {};
    if (category && category !== 'all') query.category = category;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

    res.json({
      success: true,
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminAnalytics,
  getUsersList,
  verifyUser,
  blockUser,
  unblockUser,
  adjustUserBalance,
  toggleUserStatus,
  getAuditLogs
};
