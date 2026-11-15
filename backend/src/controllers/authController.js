const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { isRestrictedJurisdiction, COMPLIANCE_TERMS } = require('../utils/compliance');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super_secret_board_varayal_jwt_token_2026_xyz', {
    expiresIn: '7d'
  });
};

/**
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, phone, password, stateJurisdiction, isAdult, termsAccepted, adminSecret } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone number, and password' });
    }

    // Indian Gaming Compliance Checks
    if (!isAdult) {
      return res.status(400).json({
        success: false,
        message: 'Compliance Notice: You must be at least 18 years of age to register.'
      });
    }

    if (isRestrictedJurisdiction(stateJurisdiction)) {
      return res.status(403).json({
        success: false,
        message: `Regulatory Notice: Due to statutory regulations in ${stateJurisdiction}, prize-based gameplay is restricted in your region. Registration cannot proceed.`
      });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    const existing = await User.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this phone number already exists.' });
    }

    // Role check: Admin creation if secret matches
    let role = 'user';
    if (adminSecret && adminSecret === (process.env.ADMIN_SECRET_KEY || 'ADMIN_VARAYAL_SECURE_KEY')) {
      role = 'admin';
    }

    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      password,
      role,
      stateJurisdiction: stateJurisdiction || 'Kerala',
      isAdult: true,
      termsAccepted: Boolean(termsAccepted),
      walletBalance: role === 'admin' ? 10000 : 0
    });

    const token = generateToken(user._id, user.role);

    await AuditLog.create({
      action: 'USER_REGISTERED',
      category: 'AUTH',
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      details: { phone: cleanPhone, state: stateJurisdiction, role }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        stateJurisdiction: user.stateJurisdiction
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

/**
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide phone and password' });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    const user = await User.findOne({ phone: cleanPhone }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
    }

    const token = generateToken(user._id, user.role);

    await AuditLog.create({
      action: 'USER_LOGIN',
      category: 'AUTH',
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      details: { phone: cleanPhone }
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        stateJurisdiction: user.stateJurisdiction
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

/**
 * @route GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        stateJurisdiction: user.stateJurisdiction
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
  }
};

const getComplianceTerms = (req, res) => {
  res.json({
    success: true,
    terms: COMPLIANCE_TERMS
  });
};

module.exports = {
  register,
  login,
  getMe,
  getComplianceTerms
};

