import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  Flame,
  CheckCircle2,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BoardSelectorModal from '../components/BoardSelectorModal';
import PaymentModal from '../components/PaymentModal';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const PATTERNS = [
    { title: '4 in a Row', desc: 'Any 4 contiguous numbers in any horizontal line', prize: '₹75', tag: 'Horizontal' },
    { title: '4 in a Column', desc: 'Any 4 contiguous numbers in any vertical line', prize: '₹75', tag: 'Vertical' },
    { title: '4 in a Diagonal', desc: '4 contiguous numbers from corner to corner', prize: '₹80', tag: 'Diagonal' },
    { title: 'Four Corners', desc: 'Top-Left, Top-Right, Bottom-Left, Bottom-Right', prize: '₹85', tag: 'Corners' },
    { title: 'Corner 2×2 Box', desc: '4 neighboring numbers forming a 2×2 cluster in any corner', prize: '₹80', tag: 'Corner Block' },
    { title: 'Center Square', desc: 'Inner 2×2 four central connected cells', prize: '₹80', tag: 'Core Box' },
    { title: '4 Connected Numbers', desc: 'Any 4 orthogonally adjacent connected numbers', prize: '₹60', tag: 'Contiguous' },
    { title: 'Full House', desc: 'All 16 numbers marked on your 4×4 board', prize: '₹500+', tag: 'Mega Jackpot' }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-amber-500/15 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-800/90 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6 shadow-md shadow-brand-500/10">
          <Flame className="w-4 h-4 text-brand-400 fill-current animate-pulse" />
          <span>Kerala's Traditional Board Varayal (ബോർഡ് വരയൽ) — Live Online</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Real-time <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-amber-300 to-amber-500">4×4 Board Varayal</span> with Live 1–119 Spinner
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Select your unique card from 2,000 verified boards. Watch the live randomized number spinner, mark your board in real time, and win instant cash prizes on lines, corners, and full house!
        </p>

        {/* Call to actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/lobby"
            className="px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-xl shadow-brand-500/25 flex items-center gap-2 text-sm sm:text-base transition hover:scale-105"
          >
            <Play className="w-5 h-5 fill-current" /> Enter Live Game Arena
          </Link>
          <Link
            to="/how-to-play"
            className="px-6 py-3.5 bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700 font-bold rounded-xl text-sm sm:text-base transition"
          >
            How to Play & Rules
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-xs text-slate-300">
          <div className="bg-dark-850/80 border border-dark-700/80 p-3 rounded-xl flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>2,000 Unique Boards</span>
          </div>
          <div className="bg-dark-850/80 border border-dark-700/80 p-3 rounded-xl flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Live 1–119 RNG Spinner</span>
          </div>
          <div className="bg-dark-850/80 border border-dark-700/80 p-3 rounded-xl flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Instant Prize Claims</span>
          </div>
          <div className="bg-dark-850/80 border border-dark-700/80 p-3 rounded-xl flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Verified UPI Payouts</span>
          </div>
        </div>
      </section>

      {/* Interactive 4x4 Sample Board Preview */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-b from-dark-850 to-dark-900 border border-dark-700 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left text */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                Authentic Gameplay
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                How Board Varayal Works
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every player receives a 4×4 card containing 16 random, non-repeating numbers from 1 to 119. When the administrator spins a number, matching numbers on your card are highlighted with the traditional crossed-out <em>Varayal</em> mark.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No duplicate boards: Each 4×4 board is exclusive per game session.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic pattern detection: Wins are verified instantly via Socket.IO.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Non-repeating spinner: Each ball 1–119 is drawn at most once.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/lobby"
                  className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-bold text-sm"
                >
                  Browse Available Game Sessions <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Mock interactive board */}
            <div className="bg-dark-900 p-5 rounded-2xl border border-dark-700/80 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-dark-800 text-xs">
                <span className="font-mono font-bold text-brand-400">Sample Card #0412</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">
                  4 Matches Marked
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-3">
                {[
                  { n: 14, m: true }, { n: 42, m: false }, { n: 88, m: true }, { n: 105, m: false },
                  { n: 23, m: false }, { n: 57, m: true }, { n: 91, m: false }, { n: 112, m: false },
                  { n: 31, m: false }, { n: 64, m: false }, { n: 79, m: true }, { n: 118, m: false },
                  { n: 7, m: false }, { n: 49, m: false }, { n: 83, m: false }, { n: 99, m: false }
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`h-14 rounded-xl flex items-center justify-center font-mono font-bold text-sm sm:text-base border relative select-none ${
                      item.m
                        ? 'bg-brand-500/25 text-brand-300 border-brand-500/70 shadow-inner'
                        : 'bg-dark-800 text-slate-200 border-dark-700'
                    }`}
                  >
                    <span>{item.n}</span>
                    {item.m && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[110%] h-0.5 bg-brand-400 rotate-45 transform shadow-[0_0_6px_rgba(251,146,60,0.8)]" />
                        <div className="w-[110%] h-0.5 bg-brand-400 -rotate-45 transform shadow-[0_0_6px_rgba(251,146,60,0.8)] absolute" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Winning Patterns Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
            Multiple Ways to Win
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Configurable Prize Patterns
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Each game session features active prizes across traditional board combinations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PATTERNS.map((p, idx) => (
            <div
              key={idx}
              className="bg-dark-850 border border-dark-700/80 hover:border-brand-500/50 p-5 rounded-2xl transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-brand-500/10 text-brand-400 rounded-md text-[11px] font-bold border border-brand-500/20">
                  {p.tag}
                </span>
                <span className="font-mono font-extrabold text-sm text-emerald-400">{p.prize}</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition">
                {p.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance & Fair Play Assurance Card */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-dark-850/80 border border-dark-700 p-6 rounded-2xl space-y-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Strict Indian Gaming & Financial Compliance</span>
          </div>
          <p className="leading-relaxed">
            Board Varayal operates strictly within applicable Indian legal frameworks. We require 18+ age verification and prohibit real-money gameplay for users residing in states with statutory restrictions on prize contests (Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, Telangana).
          </p>
          <p className="leading-relaxed">
            All number generation is executed via server-side cryptographic entropy and logged immutably in MongoDB audit records.
          </p>
        </div>
      </section>

      <PaymentModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}

