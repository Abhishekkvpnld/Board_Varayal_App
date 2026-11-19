
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Trophy, ShieldCheck, Zap, ArrowRight,
  Flame, CheckCircle2, Play, Crown, Gamepad2,
  Star, Users, Target, Gift, CircleDollarSign
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function LandingPage() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  const PATTERNS = [
    { title: 'Combined Line', desc: 'Complete any 4 numbers in a row, column, or diagonal.', prize: '₹75', tag: 'Special', icon: Target, color: 'from-violet-500 to-purple-600' },
    { title: '4 in a Row', desc: 'Any 4 contiguous numbers in a horizontal line.', prize: '₹75', tag: 'Horizontal', icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { title: '4 in a Column', desc: 'Any 4 contiguous numbers in a vertical line.', prize: '₹75', tag: 'Vertical', icon: Flame, color: 'from-orange-500 to-amber-500' },
    { title: '4 in a Diagonal', desc: 'Complete 4 connected diagonal numbers.', prize: '₹80', tag: 'Diagonal', icon: ArrowRight, color: 'from-pink-500 to-rose-500' },
    { title: 'Four Corners', desc: 'Mark all four corner numbers on your board.', prize: '₹85', tag: 'Corners', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { title: 'Corner 2×2 Box', desc: 'Complete a neighboring 2×2 block in any corner.', prize: '₹80', tag: 'Corner Block', icon: Gamepad2, color: 'from-emerald-500 to-teal-500' },
    { title: 'Center Square', desc: 'Complete the four central connected cells.', prize: '₹80', tag: 'Core Box', icon: Sparkles, color: 'from-indigo-500 to-blue-600' },
    { title: '4 Connected Numbers', desc: 'Any 4 orthogonally adjacent connected numbers.', prize: '₹60', tag: 'Contiguous', icon: Users, color: 'from-fuchsia-500 to-pink-500' },
    { title: 'Full House', desc: 'Mark all 16 numbers on your 4×4 board.', prize: '₹500+', tag: 'Mega Jackpot', icon: Crown, color: 'from-amber-400 to-yellow-600' },
  ];

  const board = [
    { n: 14, m: true }, { n: 42 }, { n: 88, m: true }, { n: 105 },
    { n: 23 }, { n: 57, m: true }, { n: 91 }, { n: 112 },
    { n: 31 }, { n: 64 }, { n: 79, m: true }, { n: 118 },
    { n: 7 }, { n: 49 }, { n: 83 }, { n: 99 },
  ];

  const features = [
    { icon: Sparkles, title: '2,000 Boards', sub: 'Unique combinations', color: 'text-violet-400', bg: 'bg-violet-500/15' },
    { icon: Zap, title: 'Live Spinner', sub: 'Numbers 1–119', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    { icon: Trophy, title: 'Exciting Prizes', sub: 'Multiple patterns', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    { icon: ShieldCheck, title: 'Secure System', sub: 'Verified gameplay', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090b18] text-white pb-20">

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs sm:text-sm font-bold mb-8 shadow-lg shadow-violet-500/10">
          <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          Kerala's Traditional Board Varayal
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Online
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.12]">
          Experience the
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400">
            Thrill of Board Varayal
          </span>
          <span className="block text-white mt-2">
            4×4 Gaming Arena
          </span>
        </h1>

        <p className="mt-7 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Choose your exclusive board from 2,000 unique cards.
          Follow the live 1–119 number spinner, mark your matches
          and compete across exciting winning patterns.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/lobby"
            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-purple-600/25 transition-all duration-300 hover:-translate-y-1"
          >
            <Play className="w-5 h-5 fill-current" />
            Enter Game Arena
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/how-to-play"
            className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/40 font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            How to Play
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto">
          {features.map((item, i) => (
            <div
              key={i}
              className="group relative p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-11 h-11 mx-auto mb-3 rounded-xl ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">{item.title}</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOARD PREVIEW */}
      <section className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#17152e] via-[#11162b] to-[#101d32] p-6 sm:p-10 shadow-2xl">

          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 blur-[100px] rounded-full" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-extrabold uppercase tracking-[0.2em]">
                <Sparkles className="w-4 h-4" />
                Authentic Gameplay
              </div>

              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Your Board.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                  Your Winning Moment.
                </span>
              </h2>

              <p className="text-sm text-slate-400 leading-7">
                Every player receives a 4×4 card containing 16 random,
                non-repeating numbers from 1 to 119. When the administrator
                spins a number, matching numbers on your card are highlighted
                with the traditional crossed-out Varayal mark.
              </p>

              <div className="space-y-4">
                {[
                  'Exclusive boards with no duplicates per session.',
                  'Automatic pattern detection using Socket.IO.',
                  'Non-repeating number draws from 1 to 119.',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>

              <Link
                to="/lobby"
                className="inline-flex items-center gap-2 text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors pt-2"
              >
                Explore Game Sessions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Board */}
            <div className="relative max-w-md w-full mx-auto">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-violet-600/30 via-pink-500/20 to-cyan-500/30 blur-xl" />

              <div className="relative rounded-3xl bg-[#0c1020] border border-white/10 p-5 sm:p-7 shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Your Sample Card</p>
                    <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                      #0412
                    </h3>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    ✓ 4 Matches
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {board.map((item, i) => (
                    <div
                      key={i}
                      className={`relative aspect-square rounded-xl flex items-center justify-center font-black text-base sm:text-xl border transition-all duration-300 ${
                        item.m
                          ? 'bg-gradient-to-br from-violet-500/30 to-pink-500/20 border-violet-400/60 text-white shadow-lg shadow-violet-500/10'
                          : 'bg-gradient-to-br from-[#1b2138] to-[#151a2c] border-white/[0.07] text-slate-300'
                      }`}
                    >
                      {item.n}
                      {item.m && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="absolute w-[120%] h-[3px] bg-gradient-to-r from-pink-400 to-orange-400 rotate-45 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                          <div className="absolute w-[120%] h-[3px] bg-gradient-to-r from-pink-400 to-orange-400 -rotate-45 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-slate-500">Latest drawn number</span>
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center font-black shadow-lg shadow-pink-500/20">
                    79
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WINNING PATTERNS */}
      <section className="relative max-w-7xl mx-auto px-4 pt-16">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Trophy className="w-4 h-4" />
            MULTIPLE WAYS TO WIN
          </div>

          <h2 className="text-3xl sm:text-4xl font-black">
            Winning <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400">Patterns</span>
          </h2>

          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Discover the different combinations and prizes available in each game session.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PATTERNS.map((p, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.035] border border-white/[0.08] p-6 hover:-translate-y-1.5 hover:border-white/20 transition-all duration-300"
            >
              <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full bg-gradient-to-br ${p.color} opacity-[0.12] blur-2xl group-hover:opacity-25 transition`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg`}>
                    <p.icon className="w-6 h-6 text-white" />
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold text-slate-400">
                    {p.tag}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white group-hover:text-violet-300 transition-colors">
                  {p.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mt-2 min-h-10">
                  {p.desc}
                </p>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/[0.07]">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Prize</span>
                  <span className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${p.color}`}>
                    {p.prize}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-6xl mx-auto px-4 pt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 p-8 sm:p-14 text-center shadow-2xl shadow-purple-900/30">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-400/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-pink-300/20 blur-[100px] rounded-full" />

          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <Crown className="w-7 h-7 text-amber-300" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to Enter the Arena?
            </h2>

            <p className="mt-4 text-sm text-white/70 max-w-xl mx-auto">
              Explore available game sessions and discover your exclusive board.
            </p>

            <Link
              to="/lobby"
              className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-xl bg-white text-violet-700 font-black text-sm hover:bg-cyan-50 hover:-translate-y-1 transition-all shadow-xl"
            >
              <Play className="w-5 h-5 fill-current" />
              Explore Game Arena
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="relative max-w-5xl mx-auto px-4 pt-16">
        <div className="rounded-2xl bg-white/[0.035] border border-white/[0.08] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white">Gaming & Fair Play Information</h3>
              <p className="text-[10px] text-slate-500">Responsible gaming and platform security</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-6">
            Board Varayal requires 18+ age verification and restricts real-money
            gameplay where applicable laws prohibit such contests. Please review
            applicable local laws before participating.
          </p>

          <p className="text-xs text-slate-400 leading-6 mt-3">
            Number generation is executed server-side using cryptographic
            entropy, with results recorded in MongoDB audit records.
          </p>
        </div>
      </section>

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
    </div>
  );
}
