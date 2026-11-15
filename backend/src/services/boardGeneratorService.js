const crypto = require('crypto');
const Board = require('../models/Board');

/**
 * Generate cryptographic random sample of k unique numbers from [min, max]
 */
function getRandomSample(min, max, count) {
  const range = max - min + 1;
  if (count > range) throw new Error('Count exceeds range size');

  const selected = new Set();
  while (selected.size < count) {
    // Cryptographically secure random integer between 0 and range-1
    const rand = crypto.randomInt(0, range);
    selected.add(min + rand);
  }
  return Array.from(selected);
}

/**
 * Format 16 numbers into a 4x4 grid (rows x cols)
 */
function createGrid(numbers) {
  const grid = [];
  for (let i = 0; i < 4; i++) {
    grid.push(numbers.slice(i * 4, (i + 1) * 4));
  }
  return grid;
}

/**
 * Generate 2,000 unique 4x4 boards containing 16 random, non-repeating numbers between 1 and 119
 */
async function generate2000UniqueBoards(forceReset = false) {
  const TOTAL_BOARDS = 2000;
  const existingCount = await Board.countDocuments();

  if (existingCount >= TOTAL_BOARDS && !forceReset) {
    console.log(`[BoardService] Found ${existingCount} boards already generated. Skipping regeneration.`);
    return { count: existingCount, created: false };
  }

  if (forceReset) {
    console.log('[BoardService] Force resetting boards collection...');
    await Board.deleteMany({});
  }

  console.log(`[BoardService] Generating ${TOTAL_BOARDS} unique 4x4 boards (numbers 1-119)...`);

  const seenHashes = new Set();
  const boardsToInsert = [];

  let boardNum = 1;
  while (boardsToInsert.length < TOTAL_BOARDS) {
    // 16 unique numbers between 1 and 119
    const numbers = getRandomSample(1, 119, 16);
    
    // Canonical hash of sorted numbers guarantees combination uniqueness
    const sortedKey = [...numbers].sort((a, b) => a - b).join('-');
    if (seenHashes.has(sortedKey)) {
      continue; // Duplicate combination encountered, draw again
    }

    seenHashes.add(sortedKey);

    // Arrange into 4x4 grid
    const grid = createGrid(numbers);

    boardsToInsert.push({
      boardNumber: boardNum,
      grid,
      numbers,
      hash: sortedKey
    });

    boardNum++;
  }

  // Bulk insert in chunks for high performance and low memory footprint
  const CHUNK_SIZE = 500;
  for (let i = 0; i < boardsToInsert.length; i += CHUNK_SIZE) {
    const chunk = boardsToInsert.slice(i, i + CHUNK_SIZE);
    await Board.insertMany(chunk, { ordered: false });
  }

  const finalCount = await Board.countDocuments();
  console.log(`[BoardService] Successfully stored ${finalCount} unique boards!`);
  return { count: finalCount, created: true };
}

module.exports = {
  getRandomSample,
  createGrid,
  generate2000UniqueBoards
};

