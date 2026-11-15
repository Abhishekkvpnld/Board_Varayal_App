const GameSession = require('../models/GameSession');
const GameBoardAllocation = require('../models/GameBoardAllocation');
const AuditLog = require('../models/AuditLog');
const { drawNextNumber, startAutoSpin, stopAutoSpin, isAutoSpinActive } = require('../services/spinnerService');
const { broadcastToGame, broadcastToAdmin } = require('../services/socketService');

/**
 * @route GET /api/games/lobby
 * Get list of games for players
 */
const getGameLobby = async (req, res) => {
  try {
    const liveGames = await GameSession.find({ status: { $in: ['active', 'paused'] } })
      .sort({ actualStartTime: -1 });

    const upcomingGames = await GameSession.find({ status: 'scheduled' })
      .sort({ scheduledStartTime: 1 })
      .limit(10);

    const pastGames = await GameSession.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      liveGames,
      upcomingGames,
      pastGames
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/games/:id
 * Get single game details
 */
const getGameDetails = async (req, res) => {
  try {
    const game = await GameSession.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const isAutoActive = isAutoSpinActive(game._id);

    res.json({
      success: true,
      game,
      isAutoSpinning: isAutoActive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/games/create
 * Admin: Create / schedule game session
 */
const createGame = async (req, res) => {
  try {
    const { title, ticketPrice, scheduledStartTime, winningRules, description } = req.body;

    if (!title || !scheduledStartTime) {
      return res.status(400).json({ success: false, message: 'Title and scheduled start time are required' });
    }

    const code = 'BV-' + Math.floor(1000 + Math.random() * 9000);

    // Calculate total prize pool
    const rules = winningRules && winningRules.length > 0 ? winningRules : undefined;
    
    const game = new GameSession({
      title: title.trim(),
      gameCode: code,
      description: description || '',
      ticketPrice: Number(ticketPrice) || 25,
      scheduledStartTime: new Date(scheduledStartTime),
      winningRules: rules,
      createdBy: req.user._id
    });

    // Compute prize pool sum
    game.totalPrizePool = game.winningRules.reduce((sum, r) => sum + (r.prizeAmount || 0), 0);
    await game.save();

    await AuditLog.create({
      action: 'CREATE_GAME',
      category: 'GAME_CONTROL',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetId: game._id.toString(),
      details: { title, gameCode: code, ticketPrice, prizePool: game.totalPrizePool }
    });

    res.status(201).json({
      success: true,
      message: 'Game session created successfully',
      game
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/games/:id/start
 * Admin: Start game
 */
const startGame = async (req, res) => {
  try {
    const game = await GameSession.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });

    if (game.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Game has already concluded.' });
    }

    game.status = 'active';
    if (!game.actualStartTime) {
      game.actualStartTime = new Date();
    }
    await game.save();

    await AuditLog.create({
      action: 'START_GAME',
      category: 'GAME_CONTROL',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetId: game._id.toString()
    });

    broadcastToGame(game._id.toString(), 'GAME_STATUS_CHANGED', {
      gameId: game._id,
      status: 'active',
      message: 'Game has officially started! Prepare your board!'
    });

    res.json({ success: true, message: 'Game started', game });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/games/:id/pause
 * Admin: Pause game
 */
const pauseGame = async (req, res) => {
  try {
    const game = await GameSession.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });

    stopAutoSpin(game._id);
    game.status = 'paused';
    await game.save();

    broadcastToGame(game._id.toString(), 'GAME_STATUS_CHANGED', {
      gameId: game._id,
      status: 'paused',
      message: 'Game temporarily paused by administrator.'
    });

    res.json({ success: true, message: 'Game paused', game });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/games/:id/end
 * Admin: End game
 */
const endGame = async (req, res) => {
  try {
    const game = await GameSession.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });

    stopAutoSpin(game._id);
    game.status = 'completed';
    game.completedAt = new Date();
    await game.save();

    broadcastToGame(game._id.toString(), 'GAME_STATUS_CHANGED', {
      gameId: game._id,
      status: 'completed',
      message: 'Game has ended. Thank you for participating in Board Varayal!'
    });

    res.json({ success: true, message: 'Game ended', game });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/games/:id/spin
 * Admin: Draw next random ball (1-119)
 */
const spinNumber = async (req, res) => {
  try {
    const result = await drawNextNumber(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/games/:id/auto-spin
 * Admin: Toggle auto-spin
 */
const toggleAutoSpin = async (req, res) => {
  try {
    const { enabled, intervalSeconds } = req.body;
    const game = await GameSession.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });

    const interval = Math.max(parseInt(intervalSeconds) || 6, 3);

    if (enabled) {
      if (game.status !== 'active') {
        game.status = 'active';
        await game.save();
      }
      startAutoSpin(game._id, interval);
      broadcastToGame(game._id.toString(), 'AUTO_SPIN_STATUS', { enabled: true, intervalSeconds: interval });
    } else {
      stopAutoSpin(game._id);
      broadcastToGame(game._id.toString(), 'AUTO_SPIN_STATUS', { enabled: false });
    }

    res.json({
      success: true,
      message: enabled ? `Auto-spinner enabled every ${interval}s` : 'Auto-spinner disabled',
      isAutoSpinning: enabled
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/games/:id/winners
 * Get list of winners for this game session
 */
const getGameWinners = async (req, res) => {
  try {
    const game = await GameSession.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });

    const allWinners = [];
    game.winningRules.forEach(rule => {
      if (rule.winners && rule.winners.length > 0) {
        rule.winners.forEach(w => {
          allWinners.push({
            ruleKey: rule.ruleKey,
            ruleName: rule.name,
            prizeAmount: rule.prizeAmount,
            userId: w.userId,
            userName: w.userName,
            userPhone: w.userPhone,
            boardNumber: w.boardNumber,
            claimedAt: w.claimedAt,
            winningBallNumber: w.winningBallNumber
          });
        });
      }
    });

    res.json({
      success: true,
      winners: allWinners,
      rules: game.winningRules
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGameLobby,
  getGameDetails,
  createGame,
  startGame,
  pauseGame,
  endGame,
  spinNumber,
  toggleAutoSpin,
  getGameWinners
};

