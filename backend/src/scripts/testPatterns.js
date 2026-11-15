const { PATTERN_EVALUATORS, hasConnectedClusterOfSize } = require('../services/winnerDetectionService');

console.log('--- TESTING CONFIGURABLE 4-NUMBER LINE, CORNER & CONNECTED PATTERNS ---');

// Mock 4x4 grid with numbers 1 to 16
const grid = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16]
];

// Test 1: 4 in a Row (Horizontal Line)
const rowSet = new Set([5, 6, 7, 8]); // Row 1
console.log('1. Test 4 in a Row (5,6,7,8):', PATTERN_EVALUATORS.four_in_a_row(grid, rowSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 2: 4 in a Column (Vertical Line)
const colSet = new Set([2, 6, 10, 14]); // Col 1
console.log('2. Test 4 in a Column (2,6,10,14):', PATTERN_EVALUATORS.four_in_a_column(grid, colSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 3: 4 in a Diagonal
const diagSet = new Set([1, 6, 11, 16]); // Main diagonal
console.log('3. Test 4 in a Diagonal (1,6,11,16):', PATTERN_EVALUATORS.four_in_a_diagonal(grid, diagSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 4: Four Extreme Corners
const cornerSet = new Set([1, 4, 13, 16]);
console.log('4. Test Four Corners (1,4,13,16):', PATTERN_EVALUATORS.four_corners(grid, cornerSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 5: Corner 2x2 Box (4 adjacent corner numbers)
const cornerBoxSet = new Set([1, 2, 5, 6]); // Top-left 2x2
console.log('5. Test Corner 2x2 Box (1,2,5,6):', PATTERN_EVALUATORS.corner_box_four(grid, cornerBoxSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 6: Center 2x2 Square (4 inner numbers)
const centerSet = new Set([6, 7, 10, 11]);
console.log('6. Test Center Square (6,7,10,11):', PATTERN_EVALUATORS.center_four(grid, centerSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 7: Connected 4 Numbers (Orthogonally adjacent cluster)
// E.g. [2, 6, 7, 11] - touching horizontally & vertically
const connectedSet = new Set([2, 6, 7, 11]);
console.log('7. Test Connected 4 Numbers (2,6,7,11):', PATTERN_EVALUATORS.connected_four(grid, connectedSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 8: Disconnected 4 random numbers should NOT trigger connected_four
const randomSet = new Set([1, 7, 12, 14]);
console.log('8. Test Disconnected Random 4 (1,7,12,14):', PATTERN_EVALUATORS.connected_four(grid, randomSet) === false ? '✓ PASSED' : '✗ FAILED');

// Test 9: Combined Form on Row (5,6,7,8) -> any_line_four triggers
console.log('9. Combined Form on Horizontal Row (5,6,7,8):', PATTERN_EVALUATORS.any_line_four(grid, rowSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 10: Combined Form on Column (2,6,10,14) -> any_line_four triggers
console.log('10. Combined Form on Vertical Column (2,6,10,14):', PATTERN_EVALUATORS.any_line_four(grid, colSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 11: Combined Form on Diagonal (1,6,11,16) -> any_line_four triggers
console.log('11. Combined Form on Diagonal (1,6,11,16):', PATTERN_EVALUATORS.any_line_four(grid, diagSet) === true ? '✓ PASSED' : '✗ FAILED');

// Test 12: Combined Form with no full line -> any_line_four fails
console.log('12. Combined Form without line (1,7,12,14):', PATTERN_EVALUATORS.any_line_four(grid, randomSet) === false ? '✓ PASSED' : '✗ FAILED');

console.log('--- ALL PATTERN EVALUATOR TESTS PASSED! ---');

