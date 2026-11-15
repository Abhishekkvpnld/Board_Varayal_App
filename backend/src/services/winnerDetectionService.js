/**
 * Winner Detection Service for Board Varayal
 * Evaluates 4x4 boards against configurable 4-number contiguous, line, corner, and geometric winning patterns.
 */

// Helper to check if any 4 numbers form an orthogonally connected cluster (touching horizontally or vertically)
function hasConnectedClusterOfSize(grid, markedSet, targetSize = 4) {
  const visited = Array(4).fill(null).map(() => Array(4).fill(false));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!visited[r][c] && markedSet.has(grid[r][c])) {
        let size = 0;
        const queue = [[r, c]];
        visited[r][c] = true;
        while (queue.length > 0) {
          const [cr, cc] = queue.shift();
          size++;
          const neighbors = [
            [cr - 1, cc],
            [cr + 1, cc],
            [cr, cc - 1],
            [cr, cc + 1]
          ];
          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4 && !visited[nr][nc] && markedSet.has(grid[nr][nc])) {
              visited[nr][nc] = true;
              queue.push([nr, nc]);
            }
          }
        }
        if (size >= targetSize) return true;
      }
    }
  }
  return false;
}

const PATTERN_EVALUATORS = {
  // 1. Any 4 in a Horizontal Row (Row 0, 1, 2, or 3)
  four_in_a_row: (grid, markedSet) => {
    return [0, 1, 2, 3].some(r => grid[r].every(num => markedSet.has(num)));
  },

  // 2. Any 4 in a Vertical Column (Col 0, 1, 2, or 3)
  four_in_a_column: (grid, markedSet) => {
    return [0, 1, 2, 3].some(c => [0, 1, 2, 3].every(r => markedSet.has(grid[r][c])));
  },

  // 3. Any 4 in a Diagonal (Main or Anti Diagonal)
  four_in_a_diagonal: (grid, markedSet) => {
    const mainDiag = [0, 1, 2, 3].every(i => markedSet.has(grid[i][i]));
    const antiDiag = [0, 1, 2, 3].every(i => markedSet.has(grid[i][3 - i]));
    return mainDiag || antiDiag;
  },

  // 4. Any Line (Combined Form of Horizontal Row, Vertical Column, OR Corner-to-Corner Diagonal - 10 total straight lines)
  any_line_four: (grid, markedSet) => {
    // 1. Any of the 4 horizontal rows
    if ([0, 1, 2, 3].some(r => grid[r].every(num => markedSet.has(num)))) return true;
    // 2. Any of the 4 vertical columns
    if ([0, 1, 2, 3].some(c => [0, 1, 2, 3].every(r => markedSet.has(grid[r][c])))) return true;
    // 3. Either of the 2 corner-to-corner diagonals
    if ([0, 1, 2, 3].every(i => markedSet.has(grid[i][i]))) return true;
    if ([0, 1, 2, 3].every(i => markedSet.has(grid[i][3 - i]))) return true;
    return false;
  },
  any_straight_line: (grid, markedSet) => {
    return PATTERN_EVALUATORS.any_line_four(grid, markedSet);
  },

  // 5. Four Extreme Corners: [0,0], [0,3], [3,0], [3,3]
  four_corners: (grid, markedSet) => {
    return (
      markedSet.has(grid[0][0]) &&
      markedSet.has(grid[0][3]) &&
      markedSet.has(grid[3][0]) &&
      markedSet.has(grid[3][3])
    );
  },

  // 6. Corner 2x2 Box: Any 4 adjacent numbers in any of the 4 corners
  // Top-Left (0,0-1,1), Top-Right (0,2-1,3), Bottom-Left (2,0-3,1), Bottom-Right (2,2-3,3)
  corner_box_four: (grid, markedSet) => {
    const check2x2 = (r, c) =>
      markedSet.has(grid[r][c]) &&
      markedSet.has(grid[r][c + 1]) &&
      markedSet.has(grid[r + 1][c]) &&
      markedSet.has(grid[r + 1][c + 1]);

    return (
      check2x2(0, 0) || // Top-Left
      check2x2(0, 2) || // Top-Right
      check2x2(2, 0) || // Bottom-Left
      check2x2(2, 2)    // Bottom-Right
    );
  },

  // 7. Center Square (Inner 2x2): [1,1], [1,2], [2,1], [2,2]
  center_four: (grid, markedSet) => {
    return (
      markedSet.has(grid[1][1]) &&
      markedSet.has(grid[1][2]) &&
      markedSet.has(grid[2][1]) &&
      markedSet.has(grid[2][2])
    );
  },

  // 8. Any 2x2 Block (anywhere on the 4x4 card, 9 possible positions)
  any_2x2_square: (grid, markedSet) => {
    for (let r = 0; r <= 2; r++) {
      for (let c = 0; c <= 2; c++) {
        if (
          markedSet.has(grid[r][c]) &&
          markedSet.has(grid[r][c + 1]) &&
          markedSet.has(grid[r + 1][c]) &&
          markedSet.has(grid[r + 1][c + 1])
        ) {
          return true;
        }
      }
    }
    return false;
  },

  // 9. Connected Four (any 4 orthogonally adjacent connected numbers touching horizontally or vertically)
  connected_four: (grid, markedSet) => {
    return hasConnectedClusterOfSize(grid, markedSet, 4);
  },

  // Specific Individual Rows:
  top_line: (grid, markedSet) => grid[0].every(num => markedSet.has(num)),
  middle_line_1: (grid, markedSet) => grid[1].every(num => markedSet.has(num)),
  middle_line_2: (grid, markedSet) => grid[2].every(num => markedSet.has(num)),
  bottom_line: (grid, markedSet) => grid[3].every(num => markedSet.has(num)),

  // Specific Individual Columns:
  left_column: (grid, markedSet) => [0, 1, 2, 3].every(r => markedSet.has(grid[r][0])),
  middle_column_1: (grid, markedSet) => [0, 1, 2, 3].every(r => markedSet.has(grid[r][1])),
  middle_column_2: (grid, markedSet) => [0, 1, 2, 3].every(r => markedSet.has(grid[r][2])),
  right_column: (grid, markedSet) => [0, 1, 2, 3].every(r => markedSet.has(grid[r][3])),

  // Specific Diagonals:
  diagonal_main: (grid, markedSet) => [0, 1, 2, 3].every(i => markedSet.has(grid[i][i])),
  diagonal_anti: (grid, markedSet) => [0, 1, 2, 3].every(i => markedSet.has(grid[i][3 - i])),

  // Early Five & Full House:
  early_five: (grid, markedSet) => markedSet.size >= 5,
  full_house: (grid, markedSet) => markedSet.size === 16
};

/**
 * Check which enabled rules have been satisfied by this board
 */
function evaluateBoardWinningRules(grid, markedNumbers, sessionWinningRules, alreadyWonRules = []) {
  const markedSet = new Set(markedNumbers);
  const newlyWonRules = [];

  for (const rule of sessionWinningRules) {
    if (!rule.enabled) continue;

    const maxWinners = rule.maxWinners || 1;
    const currentWinnersCount = rule.winners ? rule.winners.length : 0;
    if (currentWinnersCount >= maxWinners) continue;

    if (alreadyWonRules.includes(rule.ruleKey)) continue;

    const evaluator = PATTERN_EVALUATORS[rule.ruleKey];
    if (evaluator && evaluator(grid, markedSet)) {
      newlyWonRules.push({
        ruleKey: rule.ruleKey,
        name: rule.name,
        prizeAmount: rule.prizeAmount
      });
    }
  }

  return newlyWonRules;
}

/**
 * Calculate progress percentages for user UI
 */
function getPatternProgress(grid, markedNumbers) {
  const markedSet = new Set(markedNumbers);

  const countRow = (r) => grid[r].filter(n => markedSet.has(n)).length;
  const countCol = (c) => [0, 1, 2, 3].filter(r => markedSet.has(grid[r][c])).length;
  const maxRow = () => Math.max(countRow(0), countRow(1), countRow(2), countRow(3));
  const maxCol = () => Math.max(countCol(0), countCol(1), countCol(2), countCol(3));
  const countDiag1 = () => [0, 1, 2, 3].filter(i => markedSet.has(grid[i][i])).length;
  const countDiag2 = () => [0, 1, 2, 3].filter(i => markedSet.has(grid[i][3 - i])).length;
  const maxDiag = () => Math.max(countDiag1(), countDiag2());
  const countCorners = () => [grid[0][0], grid[0][3], grid[3][0], grid[3][3]].filter(n => markedSet.has(n)).length;
  const countCenter = () => [grid[1][1], grid[1][2], grid[2][1], grid[2][2]].filter(n => markedSet.has(n)).length;

  return {
    four_in_a_row: { current: maxRow(), target: 4 },
    four_in_a_column: { current: maxCol(), target: 4 },
    four_in_a_diagonal: { current: maxDiag(), target: 4 },
    any_line_four: { current: Math.max(maxRow(), maxCol(), maxDiag()), target: 4 },
    any_straight_line: { current: Math.max(maxRow(), maxCol(), maxDiag()), target: 4 },
    four_corners: { current: countCorners(), target: 4 },
    center_four: { current: countCenter(), target: 4 },
    early_five: { current: Math.min(markedSet.size, 5), target: 5 },
    full_house: { current: markedSet.size, target: 16 }
  };
}

module.exports = {
  PATTERN_EVALUATORS,
  evaluateBoardWinningRules,
  getPatternProgress,
  hasConnectedClusterOfSize
};
