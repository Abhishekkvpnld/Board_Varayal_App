import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, Sparkles, Award, Zap } from 'lucide-react';
import { playMatchSound, playWinFanfare } from '../utils/soundEffects';

export default function GameBoardView({ allocation, lastDrawnNumber }) {
  const [highlightedCell, setHighlightedCell] = useState(null);
  const [celebrationRule, setCelebrationRule] = useState(null);

  if (!allocation) {
    return (
      <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-8 text-center text-slate-400 space-y-3">
        <Sparkles className="w-10 h-10 text-brand-400 mx-auto animate-pulse" />
        <h3 className="text-white font-bold text-base">No Board Selected Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Choose an available 4×4 board from the 2,000 unique boards pool to start playing!
        </p>
      </div>
    );
  }

  const { boardNumber, grid, markedNumbers = [], wonRules = [], progress } = allocation;
  const markedSet = new Set(markedNumbers);

  // Trigger celebration on new won rules
  useEffect(() => {
    if (wonRules && wonRules.length > 0) {
      const latest = wonRules[wonRules.length - 1];
      if (latest && latest.winningBallNumber === lastDrawnNumber) {
        setCelebrationRule(latest);
        playWinFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        const timer = setTimeout(() => setCelebrationRule(null), 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [wonRules?.length, lastDrawnNumber]);

  // Flash animation on matching number
  useEffect(() => {
    if (lastDrawnNumber && markedSet.has(lastDrawnNumber)) {
      setHighlightedCell(lastDrawnNumber);
      playMatchSound();
      const timer = setTimeout(() => setHighlightedCell(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastDrawnNumber]);

  const cornerCoords = new Set(['0-0', '0-3', '3-0', '3-3']);
  const centerCoords = new Set(['1-1', '1-2', '2-1', '2-2']);

  return (
    <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
      {/* Won Prize Celebration Alert */}
      {celebrationRule && (
        <div className="bg-gradient-to-r from-amber-500 via-brand-500 to-amber-600 text-dark-900 p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-amber-500/30 animate-bounce-short">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-dark-900 fill-current" />
            <div>
              <span>Congratulations! You won <strong>{celebrationRule.ruleName}</strong>!</span>
              <p className="text-[11px] text-dark-900/80 font-medium">Prize: ₹{celebrationRule.prizeAmount} automatically credited.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-dark-900 text-amber-300 rounded-lg text-xs font-mono font-extrabold">
            +₹{celebrationRule.prizeAmount}
          </span>
        </div>
      )}

      {/* Board Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-700/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Your Board</span>
              <span className="font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                #{boardNumber}
              </span>
            </h3>
            {wonRules.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Winner
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Marked: <strong className="text-emerald-400 font-mono">{markedNumbers.length}</strong> / 16 Numbers
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Auto-Sync</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
            <CheckCircle className="w-3.5 h-3.5" /> Live Varayal Active
          </span>
        </div>
      </div>

      {/* 4x4 Interactive Grid with 'Varayal' effect */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 bg-dark-900/90 p-2.5 sm:p-3 rounded-2xl border border-dark-700 shadow-inner">
        {grid.map((row, rIdx) =>
          row.map((num, cIdx) => {
            const isMarked = markedSet.has(num);
            const isRecentMatch = highlightedCell === num;
            const coord = `${rIdx}-${cIdx}`;
            const isCorner = cornerCoords.has(coord);
            const isCenter = centerCoords.has(coord);

            return (
              <div
                key={coord}
                className={`relative h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center font-mono font-extrabold text-base sm:text-lg border transition-all duration-300 select-none overflow-hidden ${
                  isRecentMatch
                    ? 'bg-amber-400 text-dark-900 border-amber-300 scale-105 shadow-lg shadow-amber-400/50 z-10'
                    : isMarked
                    ? 'bg-brand-500/25 text-brand-300 border-brand-500/70 shadow-inner'
                    : 'bg-dark-800 text-slate-200 border-dark-700 hover:border-slate-500'
                }`}
              >
                {/* Cell Number */}
                <span className={`z-10 transition ${isMarked ? 'opacity-90 font-black' : ''}`}>
                  {num}
                </span>

                {/* Varayal Strikethrough / Crossed-out Ribbon Effect */}
                {isMarked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Glowing diagonal cross slash */}
                    <div className="w-[120%] h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent rotate-45 transform shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
                    <div className="w-[120%] h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent -rotate-45 transform shadow-[0_0_8px_rgba(251,146,60,0.8)] absolute" />
                    {/* Verified check badge in corner */}
                    <span className="absolute bottom-1 right-1 text-[9px] text-amber-300 font-sans font-bold opacity-80">
                      ✓
                    </span>
                  </div>
                )}

                {/* Sub-label indicators for corner and center cells */}
                {!isMarked && (
                  <span className="absolute top-1 left-1 text-[8px] text-slate-500 uppercase">
                    {isCorner ? 'C' : isCenter ? 'M' : ''}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pattern Progress Meters */}
      <div className="pt-2 border-t border-dark-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> 4-Number Line & Corner Pattern Progress
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {/* Combined Any Line (Row, Col, or Diag) */}
          <div className="bg-dark-900 p-2 rounded-lg border border-brand-500/50 shadow-sm">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-bold">Any Line (Row/Col/Diag)</span>
              <span className="font-bold text-brand-400">{progress?.any_line_four?.current ?? Math.max(
                Math.max(...grid.map(r => r.filter(n => markedSet.has(n)).length)),
                Math.max(...[0,1,2,3].map(c => [0,1,2,3].filter(r => markedSet.has(grid[r][c])).length)),
                Math.max([0,1,2,3].filter(i => markedSet.has(grid[i][i])).length, [0,1,2,3].filter(i => markedSet.has(grid[i][3-i])).length)
              )}/4</span>
            </div>
            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 to-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((progress?.any_line_four?.current ?? Math.max(
                  Math.max(...grid.map(r => r.filter(n => markedSet.has(n)).length)),
                  Math.max(...[0,1,2,3].map(c => [0,1,2,3].filter(r => markedSet.has(grid[r][c])).length)),
                  Math.max([0,1,2,3].filter(i => markedSet.has(grid[i][i])).length, [0,1,2,3].filter(i => markedSet.has(grid[i][3-i])).length)
                )) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* 4 in a Row */}
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700/80">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">4 in Row</span>
              <span className="font-bold text-brand-400">{progress?.four_in_a_row?.current ?? Math.max(...grid.map(r => r.filter(n => markedSet.has(n)).length))}/4</span>
            </div>
            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((progress?.four_in_a_row?.current ?? Math.max(...grid.map(r => r.filter(n => markedSet.has(n)).length))) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* 4 in a Column */}
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700/80">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">4 in Col</span>
              <span className="font-bold text-brand-400">{progress?.four_in_a_column?.current ?? Math.max(...[0,1,2,3].map(c => [0,1,2,3].filter(r => markedSet.has(grid[r][c])).length))}/4</span>
            </div>
            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((progress?.four_in_a_column?.current ?? Math.max(...[0,1,2,3].map(c => [0,1,2,3].filter(r => markedSet.has(grid[r][c])).length))) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* 4 in a Diagonal */}
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700/80">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">4 Diagonal</span>
              <span className="font-bold text-brand-400">{progress?.four_in_a_diagonal?.current ?? Math.max([0,1,2,3].filter(i => markedSet.has(grid[i][i])).length, [0,1,2,3].filter(i => markedSet.has(grid[i][3-i])).length)}/4</span>
            </div>
            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((progress?.four_in_a_diagonal?.current ?? Math.max([0,1,2,3].filter(i => markedSet.has(grid[i][i])).length, [0,1,2,3].filter(i => markedSet.has(grid[i][3-i])).length)) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* 4 Corners */}
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700/80">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">4 Corners</span>
              <span className="font-bold text-amber-400">
                {[grid[0][0], grid[0][3], grid[3][0], grid[3][3]].filter(n => markedSet.has(n)).length}/4
              </span>
            </div>
            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${([grid[0][0], grid[0][3], grid[3][0], grid[3][3]].filter(n => markedSet.has(n)).length / 4) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Full House */}
          <div className="bg-dark-900 p-2 rounded-lg border border-dark-700/80">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Full House</span>
              <span className="font-bold text-emerald-400">{markedNumbers.length}/16</span>
            </div>
            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(markedNumbers.length / 16) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Won Prizes Tag Strip */}
      {wonRules.length > 0 && (
        <div className="pt-2 border-t border-dark-800 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Won on this board:
          </span>
          {wonRules.map((wr, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold"
            >
              {wr.ruleName} (₹{wr.prizeAmount})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

