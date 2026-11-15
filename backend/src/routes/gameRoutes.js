const express = require('express');
const router = express.Router();
const {
  getGameLobby,
  getGameDetails,
  createGame,
  startGame,
  pauseGame,
  endGame,
  spinNumber,
  toggleAutoSpin,
  getGameWinners
} = require('../controllers/gameController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public / Player routes
router.get('/lobby', getGameLobby);
router.get('/:id', getGameDetails);
router.get('/:id/winners', getGameWinners);

// Admin Game Management routes
router.post('/create', protect, adminOnly, createGame);
router.post('/:id/start', protect, adminOnly, startGame);
router.post('/:id/pause', protect, adminOnly, pauseGame);
router.post('/:id/end', protect, adminOnly, endGame);
router.post('/:id/spin', protect, adminOnly, spinNumber);
router.post('/:id/auto-spin', protect, adminOnly, toggleAutoSpin);

module.exports = router;

