const Board = require('../models/Board');
const GameSession = require('../models/GameSession');
const GameBoardAllocation = require('../models/GameBoardAllocation');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generate2000UniqueBoards } = require('../services/boardGeneratorService');
const { getPatternProgress } = require('../services/winnerDetectionService');
const { broadcastToGame, broadcastToAdmin } = require('../services/socketService');

/**
 * @route GET /api/boards/summary
 * Summary of the 2,000 master boards
 */
const getBoardStats = async (req, res) => {
  try {
    const totalCount = await Board.countDocuments();
    res.json({
      success: true,
      totalCount,
      targetCount: 2000,
      isGenerated: totalCount >= 2000
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/boards/generate
 * Admin action: Generate or re-generate 2,000 boards
 */
const triggerGenerateBoards = async (req, res) => {
  try {
    const { forceReset } = req.body;
    const result = await generate2000UniqueBoards(Boolean(forceReset));

    await AuditLog.create({
      action: 'GENERATE_BOARDS',
      category: 'BOARD_MGMT',
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      details: { count: result.count, forceReset: Boolean(forceReset) }
    });

    res.json({
      success: true,
      message: `2,000 unique boards successfully prepared in database!`,
      ...result
    });
  } catch (error) {
    console.error('Board Generation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/boards/session/:gameSessionId
 * List boards for a game session with booked/available status
 */
const getSessionBoards = async (req, res) => {
  try {
    const { gameSessionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 60, 200);
    const search = req.query.search ? parseInt(req.query.search) : null;
    const filter = req.query.filter || 'all'; // 'all', 'available', 'booked'

    // 1. Get all booked board numbers for this game session
    const allocations = await GameBoardAllocation.find({ gameSessionId }).select('boardNumber userId userName');
    const bookedBoardNumbers = new Set(allocations.map(a => a.boardNumber));
    const userAllocation = req.user ? allocations.find(a => a.userId.toString() === req.user._id.toString()) : null;

    let query = {};
    if (search && !isNaN(search)) {
      query.boardNumber = search;
    }

    if (filter === 'available') {
      const bookedArr = Array.from(bookedBoardNumbers);
      query.boardNumber = { ...(query.boardNumber ? query.boardNumber : {}), $nin: bookedArr };
    } else if (filter === 'booked') {
      const bookedArr = Array.from(bookedBoardNumbers);
      query.boardNumber = { ...(query.boardNumber ? query.boardNumber : {}), $in: bookedArr };
    }

    const totalBoards = await Board.countDocuments(query);
    const boards = await Board.find(query)
      .sort({ boardNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const result = boards.map(b => {
      const isBooked = bookedBoardNumbers.has(b.boardNumber);
      const isMyBoard = userAllocation && userAllocation.boardNumber === b.boardNumber;
      return {
        _id: b._id,
        boardNumber: b.boardNumber,
        grid: b.grid,
        numbers: b.numbers,
        isBooked,
        isMyBoard
      };
    });

    res.json({
      success: true,
      boards: result,
      pagination: {
        page,
        limit,
        total: totalBoards,
        totalPages: Math.ceil(totalBoards / limit)
      },
      stats: {
        totalBooked: bookedBoardNumbers.size,
        totalAvailable: 2000 - bookedBoardNumbers.size,
        hasUserBooked: Boolean(userAllocation),
        userBoardNumber: userAllocation ? userAllocation.boardNumber : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/boards/allocate
 * ATOMIC Board Allocation for a user in a game session
 */
const allocateBoard = async (req, res) => {
  try {
    const { gameSessionId, boardNumber } = req.body;
    const userId = req.user._id;

    if (!gameSessionId || !boardNumber) {
      return res.status(400).json({ success: false, message: 'Game session ID and board number are required' });
    }

    // Admin cannot participate in gameplay
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrators are game controllers and cannot participate or select boards in games.'
      });
    }

    // Must be verified by admin
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending administrator verification. You cannot select boards yet.'
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account is blocked. You cannot participate in games.'
      });
    }

    const num = parseInt(boardNumber);
    if (isNaN(num) || num < 1 || num > 2000) {
      return res.status(400).json({ success: false, message: 'Board number must be between 1 and 2000' });
    }

    // 1. Fetch game session
    const session = await GameSession.findById(gameSessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Game session not found' });
    }

    // Board selection is only allowed before game starts (scheduled status)
    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Board selection is locked! Boards cannot be chosen once the game has started.'
      });
    }

    // 2. Check if user already booked a board in this session (1 board per user per session policy)
    const existingUserAllocation = await GameBoardAllocation.findOne({
      gameSessionId: session._id,
      userId
    });
    if (existingUserAllocation) {
      return res.status(400).json({
        success: false,
        message: `Your board is locked! You already selected Board #${existingUserAllocation.boardNumber} for this game session.`
      });
    }

    const user = await User.findById(userId);

    // 3. Retrieve master board template
    const masterBoard = await Board.findOne({ boardNumber: num });
    if (!masterBoard) {
      return res.status(404).json({ success: false, message: `Board #${num} not found in master catalog.` });
    }

    // 5. Compute marked numbers if game already started
    const markedNumbers = session.drawnNumbers ? session.drawnNumbers.filter(n => masterBoard.numbers.includes(n)) : [];

    // 6. ATOMIC INSERTION:
    // Compound unique index { gameSessionId: 1, boardNumber: 1 } in MongoDB guarantees no duplicate allocation
    let allocation;
    try {
      allocation = await GameBoardAllocation.create({
        gameSessionId: session._id,
        boardNumber: num,
        userId: user._id,
        userName: user.name,
        userPhone: user.phone,
        grid: masterBoard.grid,
        numbers: masterBoard.numbers,
        markedNumbers
      });
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        return res.status(409).json({
          success: false,
          message: `Board #${num} was just selected by another player! Please choose a different board.`
        });
      }
      throw dbErr;
    }

    // Increment booked boards counter
    await GameSession.findByIdAndUpdate(session._id, {
      $inc: { totalBoardsBooked: 1 }
    });

    await AuditLog.create({
      action: 'BOARD_ALLOCATED',
      category: 'BOARD_MGMT',
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      targetId: session._id.toString(),
      details: { boardNumber: num, ticketPrice: session.ticketPrice }
    });

    // Notify room of updated booking count and board occupied
    broadcastToGame(session._id.toString(), 'BOARD_TAKEN', {
      boardNumber: num,
      totalBooked: session.totalBoardsBooked + 1
    });

    res.status(201).json({
      success: true,
      message: `Board #${num} successfully booked!`,
      allocation: {
        _id: allocation._id,
        boardNumber: allocation.boardNumber,
        grid: allocation.grid,
        numbers: allocation.numbers,
        markedNumbers: allocation.markedNumbers,
        allocatedAt: allocation.createdAt
      }
    });
  } catch (error) {
    console.error('Allocation Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error allocating board' });
  }
};

/**
 * @route GET /api/boards/my/:gameSessionId
 * Get player's active board allocation for a game session
 */
const getMySessionBoard = async (req, res) => {
  try {
    const { gameSessionId } = req.params;
    const userId = req.user._id;

    const allocation = await GameBoardAllocation.findOne({
      gameSessionId,
      userId
    });

    if (!allocation) {
      return res.json({ success: true, allocation: null });
    }

    // Calculate pattern progress
    const progress = getPatternProgress(allocation.grid, allocation.markedNumbers);

    res.json({
      success: true,
      allocation: {
        _id: allocation._id,
        boardNumber: allocation.boardNumber,
        grid: allocation.grid,
        numbers: allocation.numbers,
        markedNumbers: allocation.markedNumbers,
        wonRules: allocation.wonRules,
        progress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/boards/my-history
 * Get player's allocated boards across games
 */
const getMyAllocationsHistory = async (req, res) => {
  try {
    const allocations = await GameBoardAllocation.find({ userId: req.user._id })
      .populate('gameSessionId', 'title gameCode status scheduledStartTime ticketPrice')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      allocations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBoardStats,
  triggerGenerateBoards,
  getSessionBoards,
  allocateBoard,
  getMySessionBoard,
  getMyAllocationsHistory
};

