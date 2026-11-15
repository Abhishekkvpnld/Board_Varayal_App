import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Grid, Eye, Play, Pause, RotateCw, History } from 'lucide-react';
import { playBallDrawSound, playTickSound, announceNumberVoice } from '../utils/soundEffects';

export default function LiveSpinnerWheel({
  currentNumber,
  drawnNumbers = [],
  remainingCount = 119,
  isAutoSpinning = false,
  isAdmin = false,
  onSpinNext,
  onToggleAutoSpin
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showFullBoard, setShowFullBoard] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(currentNumber || '--');

  useEffect(() => {
    if (currentNumber) {
      setIsAnimating(true);
      if (soundEnabled) playBallDrawSound();
      if (voiceEnabled) announceNumberVoice(currentNumber);

      // Number tumble effect before landing
      let count = 0;
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 119) + 1);
        count++;
        if (count > 6) {
          clearInterval(interval);
          setDisplayNumber(currentNumber);
          setIsAnimating(false);
        }
      }, 60);

      return () => clearInterval(interval);
    } else {
      setDisplayNumber('--');
    }
  }, [currentNumber]);

  const drawnSet = new Set(drawnNumbers);

  return (
    <div className="bg-gradient-to-b from-dark-850 to-dark-900 border border-dark-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-brand-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Live Number Spinner (1–119)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition ${
              soundEnabled
                ? 'bg-dark-800 border-dark-700 text-brand-400'
                : 'bg-dark-900 border-dark-800 text-slate-500'
            }`}
            title="Toggle Sound FX"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
              voiceEnabled
                ? 'bg-dark-800 border-dark-700 text-brand-400'
                : 'bg-dark-900 border-dark-800 text-slate-500'
            }`}
            title="Speech Voice Callout"
          >
            {voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}
          </button>
          <button
            onClick={() => setShowFullBoard(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700 rounded-lg text-[11px] font-semibold transition"
          >
            <Grid className="w-3.5 h-3.5" /> 1–119 Grid
          </button>
        </div>
      </div>

      {/* Main Wheel / Ball Display Center */}
      <div className="py-6 flex flex-col items-center justify-center relative">
        {/* Animated Outer Rings */}
        <div className="relative flex items-center justify-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-brand-500/30 animate-spin-slow flex items-center justify-center" />
          <div className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-amber-500/20 animate-pulse" />

          {/* Central Sphere / Ball */}
          <div
            className={`absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-brand-600 via-amber-500 to-amber-300 shadow-2xl flex flex-col items-center justify-center text-white transition-transform duration-300 ${
              isAnimating ? 'scale-110 shadow-brand-500/60' : 'shadow-brand-500/40 hover:scale-105'
            }`}
          >
            <div className="w-[90%] h-[90%] rounded-full bg-dark-900/90 border-2 border-amber-400/60 flex flex-col items-center justify-center backdrop-blur-sm">
              <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold opacity-80">
                VARAYAL
              </span>
              <span className="font-extrabold text-3xl sm:text-5xl font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
                {displayNumber}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Ball #{drawnNumbers.length}</span>
            </div>
          </div>
        </div>

        {/* Stats counter badge */}
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="px-3 py-1 bg-dark-800/80 rounded-lg border border-dark-700 text-slate-300">
            Drawn: <strong className="text-white">{drawnNumbers.length}</strong> / 119
          </div>
          <div className="px-3 py-1 bg-dark-800/80 rounded-lg border border-dark-700 text-slate-300">
            Remaining: <strong className="text-emerald-400">{remainingCount}</strong>
          </div>
        </div>
      </div>

      {/* Admin Controls Toolbar (if in admin mode) */}
      {isAdmin && (
        <div className="p-3 bg-dark-900 border border-brand-500/30 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400 uppercase text-[10px]">Spinner Controls:</span>
            <button
              onClick={onSpinNext}
              disabled={isAutoSpinning || remainingCount === 0}
              className="px-3.5 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-lg shadow transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Spin Next Ball
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAutoSpin}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition ${
                isAutoSpinning
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isAutoSpinning ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Stop Auto-Spin
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Auto-Spin
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Drawn Numbers History Strip */}
      <div className="pt-3 border-t border-dark-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <History className="w-3.5 h-3.5" /> Recent Drawn Numbers
          </span>
          <span className="text-[10px]">Latest on left</span>
        </div>

        {drawnNumbers.length === 0 ? (
          <div className="py-2 text-center text-xs text-slate-500 italic">
            Waiting for first number to be spun...
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {[...drawnNumbers].reverse().map((num, idx) => (
              <div
                key={`${num}-${idx}`}
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs border transition ${
                  idx === 0
                    ? 'bg-brand-500 text-white border-amber-300 shadow-md shadow-brand-500/30 ring-2 ring-brand-500/40 scale-105'
                    : 'bg-dark-800 text-slate-300 border-dark-700'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full 1-119 Numbers Matrix Modal */}
      {showFullBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-dark-850 border border-dark-700 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-dark-700">
              <div>
                <h3 className="font-bold text-white text-sm">Full Numbers Board (1–119)</h3>
                <p className="text-xs text-slate-400">
                  <span className="text-brand-400 font-bold">{drawnNumbers.length}</span> drawn,{' '}
                  <span className="text-emerald-400 font-bold">{remainingCount}</span> remaining
                </p>
              </div>
              <button
                onClick={() => setShowFullBoard(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-dark-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4">
              <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5">
                {Array.from({ length: 119 }, (_, i) => i + 1).map((n) => {
                  const isDrawn = drawnSet.has(n);
                  return (
                    <div
                      key={n}
                      className={`h-8 rounded flex items-center justify-center font-mono text-xs font-bold border transition ${
                        isDrawn
                          ? 'bg-brand-500/30 text-brand-300 border-brand-500/60 shadow-inner'
                          : 'bg-dark-900 text-slate-500 border-dark-800/80'
                      }`}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-dark-700 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-brand-500/40 border border-brand-500 inline-block" /> Drawn
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-dark-900 border border-dark-800 inline-block" /> In Bag
                </span>
              </div>
              <button
                onClick={() => setShowFullBoard(false)}
                className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

