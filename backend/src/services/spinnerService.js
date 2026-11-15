const crypto = require('crypto');
const GameSession = require('../models/GameSession');
const GameBoardAllocation = require('../models/GameBoardAllocation');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { evaluateBoardWinningRules } = require('./winnerDetectionService');
const { broadcastToGame, sendToUser, broadcastToAdmin } = require('./socketService');

// Active timer handles for auto-draw
const autoSpinTimers = new Map();

/**
 * Draws the next random number for a game session
 */
async function drawNextNumber(gameSessionId, adminUser = null) {
  const session = await GameSession.findById(gameSessionId);
  if (!session) throw new Error('Game session not found');

  if (session.status !== 'active') {
    throw new Error(`Cannot draw number: game session is currently ${session.status}`);
  }

  if (!session.remainingNumbers || session.remainingNumbers.length === 0) {
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();
    stopAutoSpin(gameSessionId);

    broadcastToGame(gameSessionId, 'GAME_STATUS_CHANGED', {
      gameId: session._id,
      status: 'completed',
      message: 'All 119 numbers have been drawn! Game concluded.'
    });

    return { completed: true, message: 'All numbers drawn' };
  }

  // Cryptographically secure random selection from remaining numbers
  const randomIndex = crypto.randomInt(0, session.remainingNumbers.length);
  const drawnNumber = session.remainingNumbers[randomIndex];

  // Remove drawn number from remaining and add to drawn list
  session.remainingNumbers.splice(randomIndex, 1);
  session.drawnNumbers.push(drawnNumber);
  session.currentNumber = drawnNumber;

  // 1. Find all board allocations for this game that contain the drawn number
  const matchingAllocations = await GameBoardAllocation.find({
    gameSessionId: session._id,
    numbers: drawnNumber
  });

  const newlyDeclaredWinners = [];

  // 2. Mark number on affected boards and check for winning rules
  for (const allocation of matchingAllocations) {
    if (!allocation.markedNumbers.includes(drawnNumber)) {
      allocation.markedNumbers.push(drawnNumber);
    }

    const alreadyWonKeys = allocation.wonRules.map(r => r.ruleKey);
    const satisfiedRules = evaluateBoardWinningRules(
      allocation.grid,
      allocation.markedNumbers,
      session.winningRules,
      alreadyWonKeys
    );

    for (const wonRule of satisfiedRules) {
      // Find matching rule in game session
      const sessionRule = session.winningRules.find(r => r.ruleKey === wonRule.ruleKey);
      if (sessionRule && (!sessionRule.winners || sessionRule.winners.length < sessionRule.maxWinners)) {
        const winnerEntry = {
          userId: allocation.userId,
          userName: allocation.userName,
          userPhone: allocation.userPhone,
          boardNumber: allocation.boardNumber,
          allocationId: allocation._id,
          claimedAt: new Date(),
          winningBallNumber: drawnNumber,
          verified: true
        };

        if (!sessionRule.winners) sessionRule.winners = [];
        sessionRule.winners.push(winnerEntry);

        if (sessionRule.winners.length >= sessionRule.maxWinners) {
          sessionRule.claimed = true;
        }

        // Record in allocation
        allocation.wonRules.push({
          ruleKey: wonRule.ruleKey,
          ruleName: wonRule.name,
          prizeAmount: wonRule.prizeAmount,
          wonAt: new Date(),
          winningBallNumber: drawnNumber
        });
        allocation.isVerifiedWinner = true;

        // Credit user wallet automatically
        if (wonRule.prizeAmount > 0) {
          await User.findByIdAndUpdate(allocation.userId, {
            $inc: { walletBalance: wonRule.prizeAmount }
          });
        }

        newlyDeclaredWinners.push({
          ruleKey: wonRule.ruleKey,
          ruleName: wonRule.name,
          prizeAmount: wonRule.prizeAmount,
          userName: allocation.userName,
          boardNumber: allocation.boardNumber,
          winningBallNumber: drawnNumber
        });

        // Notify winner personally
        sendToUser(allocation.userId.toString(), 'YOU_WON_PRIZE', {
          ruleName: wonRule.name,
          prizeAmount: wonRule.prizeAmount,
          boardNumber: allocation.boardNumber,
          ballNumber: drawnNumber
        });
      }
    }

    await allocation.save();

    // Send personalized board update to user room
    sendToUser(allocation.userId.toString(), 'MY_BOARD_UPDATED', {
      allocationId: allocation._id,
      boardNumber: allocation.boardNumber,
      markedNumbers: allocation.markedNumbers,
      lastDrawnNumber: drawnNumber,
      wonRules: allocation.wonRules
    });
  }

  // Check if Full House was won; if configured to end after full house
  const fullHouseRule = session.winningRules.find(r => r.ruleKey === 'full_house');
  if (fullHouseRule && fullHouseRule.claimed) {
    // Check if all rules claimed or full house completed
    const allClaimed = session.winningRules.every(r => !r.enabled || r.claimed);
    if (allClaimed) {
      session.status = 'completed';
      session.completedAt = new Date();
      stopAutoSpin(gameSessionId);
    }
  }

  await session.save();

  // Audit log
  await AuditLog.create({
    action: 'SPIN_NUMBER',
    category: 'GAME_CONTROL',
    actorId: adminUser ? adminUser._id : null,
    actorName: adminUser ? adminUser.name : 'System Auto-Spin',
    actorRole: adminUser ? adminUser.role : 'system',
    targetId: session._id.toString(),
    details: {
      drawnNumber,
      totalDrawn: session.drawnNumbers.length,
      winnersCount: newlyDeclaredWinners.length
    }
  });

  // Broadcast to game room
  const drawPayload = {
    gameId: session._id,
    drawnNumber,
    drawnNumbers: session.drawnNumbers,
    currentNumber: drawnNumber,
    remainingCount: session.remainingNumbers.length,
    totalDrawnCount: session.drawnNumbers.length,
    newWinners: newlyDeclaredWinners,
    winningRules: session.winningRules,
    status: session.status
  };

  broadcastToGame(gameSessionId.toString(), 'NUMBER_DRAWN', drawPayload);
  broadcastToAdmin('ADMIN_DRAW_UPDATE', drawPayload);

  return {
    success: true,
    drawnNumber,
    totalDrawn: session.drawnNumbers.length,
    remainingCount: session.remainingNumbers.length,
    newWinners: newlyDeclaredWinners,
    status: session.status
  };
}

/**
 * Start automatic spinner timer
 */
function startAutoSpin(gameSessionId, intervalSeconds = 6) {
  const key = gameSessionId.toString();
  if (autoSpinTimers.has(key)) {
    clearInterval(autoSpinTimers.get(key));
  }

  const intervalMs = Math.max(intervalSeconds, 3) * 1000;
  console.log(`[SpinnerService] Auto-spin started for game ${key} every ${intervalSeconds}s`);

  const timer = setInterval(async () => {
    try {
      const res = await drawNextNumber(key);
      if (res.completed || res.status === 'completed') {
        stopAutoSpin(key);
      }
    } catch (err) {
      console.error(`[SpinnerService Auto-spin Error] ${err.message}`);
      stopAutoSpin(key);
    }
  }, intervalMs);

  autoSpinTimers.set(key, timer);
}

/**
 * Stop automatic spinner timer
 */
function stopAutoSpin(gameSessionId) {
  const key = gameSessionId.toString();
  if (autoSpinTimers.has(key)) {
    clearInterval(autoSpinTimers.get(key));
    autoSpinTimers.delete(key);
    console.log(`[SpinnerService] Auto-spin stopped for game ${key}`);
  }
}

function isAutoSpinActive(gameSessionId) {
  return autoSpinTimers.has(gameSessionId.toString());
}

module.exports = {
  drawNextNumber,
  startAutoSpin,
  stopAutoSpin,
  isAutoSpinActive
};

