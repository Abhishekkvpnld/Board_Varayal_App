const express = require('express');
const router = express.Router();
const {
  getBoardStats,
  triggerGenerateBoards,
  getSessionBoards,
  allocateBoard,
  getMySessionBoard
} = require('../controllers/boardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/summary', getBoardStats);
router.post('/generate', protect, adminOnly, triggerGenerateBoards);
router.get('/session/:gameSessionId', protect, getSessionBoards);
router.post('/allocate', protect, allocateBoard);
router.get('/my/:gameSessionId', protect, getMySessionBoard);

module.exports = router;

