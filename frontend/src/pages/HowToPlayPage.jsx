import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

export default function HowToPlayPage() {
  const PATTERNS_LIST = [
    {
      name: 'Combined Line (Horizontal, Vertical, or Diagonal)',
      badge: '★ Combined Structure',
      description: 'The master line pattern: Completing ANY 4 numbers in a horizontal row, ANY vertical column, OR EITHER diagonal (10 total lines). Getting any one of these qualifies you immediately for the prize!',
      sampleGrid: [
        [1, 1, 1, 1],
        [1, 1, 0, 0],
        [1, 0, 1, 0],
        [1, 0, 0, 1]
      ]
    },
    {
      name: '4 in a Row (Horizontal Line)',
      description: 'Any 4 contiguous numbers forming a complete horizontal row across the board.',
      sampleGrid: [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      name: '4 in a Column (Vertical Line)',
      description: 'Any 4 contiguous numbers forming a complete vertical column from top to bottom.',
      sampleGrid: [
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0]
      ]
    },
    {
      name: '4 in a Diagonal (Corner-to-Corner)',
      description: 'Any 4 numbers aligned diagonally from corner to opposing corner (Main or Anti).',
      sampleGrid: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]
    },
    {
      name: 'Four Corners (Corner-Wise)',
      description: 'Marking all 4 extreme outer corners: [Top-Left, Top-Right, Bottom-Left, Bottom-Right].',
      sampleGrid: [
        [1, 0, 0, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 0, 0, 1]
      ]
    },
    {
      name: 'Corner 2×2 Box (4 Adjacent Corner Numbers)',
      description: 'Any 4 neighboring numbers forming a 2×2 cluster in any of the four corners.',
      sampleGrid: [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      name: 'Center Square (Inner 2×2)',
      description: 'Marking the four connected core inner cells of the 4×4 card.',
      sampleGrid: [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      name: 'Any 4 Connected Numbers (Adjacent Block)',
      description: 'Any 4 numbers touching each other horizontally or vertically in a connected shape.',
      sampleGrid: [
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
      ]
    },
    {
      name: 'Full House (All 16 Numbers)',
      description: 'The ultimate jackpot: every single number on your 4×4 card has been drawn and stamped.',
      sampleGrid: [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
          Traditional Kerala Board Game Guide
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          How to Play Board Varayal
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          Learn the rules, master the winning combinations, and understand our transparent fair-play mechanisms.
        </p>
      </div>

      {/* 4 Step Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-850 border border-dark-700/80 p-5 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h3 className="font-bold text-white text-sm">Select Your Card</h3>
          <p className="text-xs text-slate-400">
            Browse 2,000 unique cards. Each board contains 16 non-repeating numbers from 1–119.
          </p>
        </div>

        <div className="bg-dark-850 border border-dark-700/80 p-5 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h3 className="font-bold text-white text-sm">Watch the Spinner</h3>
          <p className="text-xs text-slate-400">
            Numbers are drawn live between 1 and 119 with zero repeats via cryptographic backend RNG.
          </p>
        </div>

        <div className="bg-dark-850 border border-dark-700/80 p-5 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h3 className="font-bold text-white text-sm">Auto Varayal Strike</h3>
          <p className="text-xs text-slate-400">
            When a number matches your card, our engine stamps it with the traditional cross (വരയൽ).
          </p>
        </div>

        <div className="bg-dark-850 border border-dark-700/80 p-5 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
            4
          </div>
          <h3 className="font-bold text-white text-sm">Instant Winnings</h3>
          <p className="text-xs text-slate-400">
            Complete lines, corners, or full house to claim instant wallet credits disbursed via UPI.
          </p>
        </div>
      </div>

      {/* Visual Winning Combinations Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Winning Patterns & Combinations</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PATTERNS_LIST.map((pat, idx) => (
            <div
              key={idx}
              className="bg-dark-850 border border-dark-700/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-white text-sm">{pat.name}</h3>
                  {pat.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pat.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{pat.description}</p>
              </div>

              {/* 4x4 Mini preview pattern */}
              <div className="bg-dark-900 p-2.5 rounded-xl border border-dark-700/70 w-36 mx-auto">
                <div className="grid grid-cols-4 gap-1.5">
                  {pat.sampleGrid.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`h-6 rounded flex items-center justify-center font-bold text-[10px] border transition ${
                          cell === 1
                            ? 'bg-brand-500 text-white border-amber-300 shadow-sm'
                            : 'bg-dark-800 text-slate-600 border-dark-700'
                        }`}
                      >
                        {cell === 1 ? '✓' : ''}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indian Gaming Compliance & Legal Disclaimers */}
      <div className="bg-dark-850 border border-dark-700/80 rounded-3xl p-6 sm:p-8 space-y-5 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Statutory Compliance & Responsible Play Policies</span>
        </div>

        <div className="space-y-3 leading-relaxed text-slate-400">
          <p>
            • <strong>Age Requirement (18+ Only):</strong> Participation on Board Varayal is strictly restricted to adult individuals who are at least 18 years old at the time of registration.
          </p>
          <p>
            • <strong>State Jurisdiction Restrictions:</strong> In compliance with prevailing state enactments governing prize contests and real-value gameplay, individuals residing in the states of <strong>Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, and Telangana</strong> are strictly prohibited from entering paid game sessions.
          </p>
          <p>
            • <strong>RNG Fairness & Auditability:</strong> Board Varayal utilizes cryptographically non-repeating random number generators on the server backend. All ball draws, game states, and prize claims are permanently logged into immutable MongoDB audit collections.
          </p>
          <p>
            • <strong>Payment & PMLA Integrity:</strong> All wallet deposits are authenticated manually against official banking UTR (Unique Transaction Reference) codes to ensure anti-fraud and clean financial accounting.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/lobby"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition"
          >
            Start Playing in the Arena <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

