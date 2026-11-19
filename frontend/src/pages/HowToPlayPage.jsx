
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
  Zap,
  Crown,
  Target,
  Flame,
  Star,
  Gift,
  CircleDollarSign,
  MousePointer2,
  Dices,
  Medal,
  Play,
} from 'lucide-react';

const PATTERNS_LIST = [
  {
    name: 'Combined Line',
    subtitle: 'Horizontal, Vertical or Diagonal',
    badge: 'SPECIAL PATTERN',
    description:
      'Complete ANY 4 numbers in a horizontal row, vertical column, OR either diagonal. Any one of the 10 lines qualifies!',
    color: 'from-violet-500 to-purple-600',
    glow: 'group-hover:shadow-violet-500/20',
    icon: Crown,
    sampleGrid: [
      [1, 1, 1, 1],
      [1, 1, 0, 0],
      [1, 0, 1, 0],
      [1, 0, 0, 1],
    ],
  },
  {
    name: '4 in a Row',
    subtitle: 'Horizontal Line',
    description:
      'Complete any 4 contiguous numbers forming a full horizontal line across your board.',
    color: 'from-blue-500 to-cyan-500',
    glow: 'group-hover:shadow-cyan-500/20',
    icon: ArrowRight,
    sampleGrid: [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: '4 in a Column',
    subtitle: 'Vertical Line',
    description:
      'Complete any 4 contiguous numbers forming a vertical line from top to bottom.',
    color: 'from-orange-500 to-amber-500',
    glow: 'group-hover:shadow-orange-500/20',
    icon: Zap,
    sampleGrid: [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ],
  },
  {
    name: '4 in a Diagonal',
    subtitle: 'Corner to Corner',
    description:
      'Complete 4 numbers aligned diagonally from one corner to the opposite corner.',
    color: 'from-pink-500 to-rose-500',
    glow: 'group-hover:shadow-pink-500/20',
    icon: Target,
    sampleGrid: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
  },
  {
    name: 'Four Corners',
    subtitle: 'Corner Wise',
    description:
      'Mark all four extreme outer corners: top-left, top-right, bottom-left and bottom-right.',
    color: 'from-yellow-500 to-orange-500',
    glow: 'group-hover:shadow-yellow-500/20',
    icon: Star,
    sampleGrid: [
      [1, 0, 0, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 0, 0, 1],
    ],
  },
  {
    name: 'Corner 2×2 Box',
    subtitle: 'Four Adjacent Corners',
    description:
      'Complete any 4 neighboring numbers forming a 2×2 cluster in any of the four corners.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'group-hover:shadow-emerald-500/20',
    icon: Gamepad2,
    sampleGrid: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'Center Square',
    subtitle: 'Inner 2×2',
    description:
      'Mark the four connected central cells of your 4×4 board.',
    color: 'from-indigo-500 to-blue-600',
    glow: 'group-hover:shadow-indigo-500/20',
    icon: Sparkles,
    sampleGrid: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: '4 Connected Numbers',
    subtitle: 'Adjacent Block',
    description:
      'Complete any 4 numbers touching each other horizontally or vertically in a connected shape.',
    color: 'from-fuchsia-500 to-pink-500',
    glow: 'group-hover:shadow-fuchsia-500/20',
    icon: Flame,
    sampleGrid: [
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'Full House',
    subtitle: 'All 16 Numbers',
    badge: 'MEGA JACKPOT',
    description:
      'The ultimate achievement! Every single number on your 4×4 card must be drawn and marked.',
    color: 'from-amber-400 to-yellow-600',
    glow: 'group-hover:shadow-amber-500/25',
    icon: Trophy,
    sampleGrid: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Select Your Card',
    description:
      'Browse 2,000 unique cards. Each board contains 16 non-repeating numbers from 1–119.',
    icon: MousePointer2,
    color: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/20',
  },
  {
    number: '02',
    title: 'Watch the Spinner',
    description:
      'Numbers are drawn live between 1 and 119 without repeats using the backend RNG.',
    icon: Dices,
    color: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-cyan-500/20',
  },
  {
    number: '03',
    title: 'Auto Varayal Strike',
    description:
      'When a number matches your card, the system automatically stamps it with the traditional cross.',
    icon: Zap,
    color: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/20',
  },
  {
    number: '04',
    title: 'Winning Moment',
    description:
      'Complete the configured winning patterns and follow the platform prize-claim process.',
    icon: Trophy,
    color: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-500/20',
  },
];

const PatternCard = ({ pat, idx }) => {
  const Icon = pat.icon;

  return (
    <div
      className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-white/10 via-white/[0.03] to-white/10 hover:from-violet-500/60 hover:via-cyan-500/30 hover:to-pink-500/60 transition-all duration-500 animate-card-enter"
      style={{ animationDelay: `${idx * 90}ms` }}
    >
      <div className={`relative h-full min-h-[330px] overflow-hidden rounded-[23px] bg-[#111528] p-5 sm:p-6 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl ${pat.glow}`}>

        {/* Decorative glow */}
        <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${pat.color} opacity-[0.08] blur-3xl transition-all duration-500 group-hover:opacity-25 group-hover:scale-150`} />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${pat.color} shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
              <Icon className="h-6 w-6 text-white" />
            </div>

            {pat.badge && (
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[9px] font-black tracking-wider text-amber-300">
                {pat.badge}
              </span>
            )}
          </div>

          <div className="mt-5">
            <h3 className="text-lg font-black text-white transition-colors group-hover:text-cyan-300">
              {pat.name}
            </h3>
            <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r ${pat.color} bg-clip-text text-transparent`}>
              {pat.subtitle}
            </p>
            <p className="mt-3 min-h-[60px] text-xs leading-6 text-slate-400">
              {pat.description}
            </p>
          </div>

          {/* Mini board */}
          <div className="mt-5 flex items-center justify-center">
            <div className="rounded-2xl border border-white/10 bg-[#090d1b] p-3 shadow-inner transition-all duration-500 group-hover:border-white/20">
              <div className="grid grid-cols-4 gap-1.5">
                {pat.sampleGrid.flat().map((cell, i) => (
                  <div
                    key={i}
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border text-xs font-black transition-all duration-500 ${
                      cell
                        ? `border-white/20 bg-gradient-to-br ${pat.color} text-white shadow-md`
                        : 'border-white/[0.05] bg-[#1b2238] text-slate-700'
                    }`}
                    style={{
                      transitionDelay: `${i * 25}ms`,
                    }}
                  >
                    {cell ? (
                      <CheckCircle2 className="h-4 w-4 animate-check-pop" />
                    ) : (
                      <span className="opacity-20">•</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Pattern Preview
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Visual Guide
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HowToPlayPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090b18] pb-20 text-white">

      <style>{`
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-13px); }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: .35; transform: scale(1); }
          50% { opacity: .75; transform: scale(1.12); }
        }

        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes checkPop {
          0% { transform: scale(.5); opacity: .4; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .animate-card-enter {
          animation: cardEnter .7s ease-out both;
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        .animate-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .animate-check-pop {
          animation: checkPop .5s ease-out both;
        }

        .animated-gradient {
          background-size: 200% 200%;
          animation: gradientMove 6s ease infinite;
        }

        .step-line {
          transform-origin: left;
          animation: lineGrow 1s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-card-enter,
          .animate-float,
          .animate-glow,
          .animate-check-pop,
          .animated-gradient,
          .step-line {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-violet-600/15 blur-[120px] animate-glow" />
        <div className="absolute -right-40 top-[25%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px] animate-glow" />
        <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-pink-600/10 blur-[120px]" />

        <div className="absolute right-[12%] top-32 animate-float text-violet-400/20">
          <Sparkles size={42} />
        </div>
        <div className="absolute left-[8%] top-[45%] animate-float text-cyan-400/20" style={{ animationDelay: '1s' }}>
          <Star size={30} />
        </div>
        <div className="absolute right-[8%] bottom-[15%] animate-float text-pink-400/20" style={{ animationDelay: '2s' }}>
          <Trophy size={35} />
        </div>
      </div>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 text-center sm:pt-24">

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300 shadow-lg shadow-violet-500/10">
          <Sparkles className="h-4 w-4 text-amber-400" />
          YOUR COMPLETE GAME GUIDE
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <h1 className="mx-auto mt-7 max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Learn the Game.
          <span className="animated-gradient mt-2 block bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Master the Patterns.
          </span>
          <span className="mt-2 block text-white">Win with Strategy.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Everything you need to know about Kerala's traditional Board Varayal.
          Follow the steps, understand the patterns and get ready for the game arena.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/lobby"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-3.5 text-sm font-extrabold shadow-xl shadow-purple-600/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-500/40"
          >
            <Gamepad2 className="h-5 w-5" />
            Enter Game Arena
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-3">
          {[
            { value: '2,000', label: 'Unique Boards', color: 'text-violet-400' },
            { value: '1–119', label: 'Number Range', color: 'text-cyan-400' },
            { value: '4×4', label: 'Board Format', color: 'text-amber-400' },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
            >
              <h3 className={`text-xl font-black sm:text-2xl ${item.color}`}>
                {item.value}
              </h3>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO PLAY */}
      <section className="relative mx-auto max-w-7xl px-4 pt-8">

        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
            <Zap className="h-4 w-4" />
            SIMPLE GAMEPLAY
          </div>
          <h2 className="text-3xl font-black sm:text-4xl">
            How to <span className="text-cyan-400">Play</span>
          </h2>
          <p className="mt-3 text-xs text-slate-500 sm:text-sm">
            Four simple steps to understand the game.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative animate-card-enter"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111528] p-6 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-xl">
                  <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${step.color} opacity-[0.08] blur-2xl transition-all group-hover:opacity-20`} />

                  <div className="relative flex items-center justify-between">
                    <span className="text-3xl font-black text-white/10">
                      {step.number}
                    </span>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg ${step.shadow} transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className="relative mt-7">
                    <h3 className="text-base font-black text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-xs leading-6 text-slate-400">
                      {step.description}
                    </p>
                  </div>

                  <div className={`mt-6 h-1 w-12 rounded-full bg-gradient-to-r ${step.color} transition-all duration-500 group-hover:w-full`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PATTERNS */}
      <section className="relative mx-auto max-w-7xl px-4 pt-24">

        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-300">
            <Trophy className="h-4 w-4" />
            WINNING COMBINATIONS
          </div>

          <h2 className="text-3xl font-black sm:text-4xl">
            Explore the
            <span className="animated-gradient ml-2 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              Patterns
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-slate-500 sm:text-sm">
            Each pattern has its own unique combination. Understand the highlighted
            cells in each visual preview.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PATTERNS_LIST.map((pat, idx) => (
            <PatternCard key={pat.name} pat={pat} idx={idx} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-pink-500">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </span>
            Highlighted number
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-5 w-5 rounded-md border border-white/10 bg-[#1b2238]" />
            Unmarked number
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="relative mx-auto max-w-6xl px-4 pt-24">

        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-[#10251f] via-[#111c27] to-[#111528] p-6 sm:p-9">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[90px]" />

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>

              <div>
                <h2 className="text-lg font-black text-white sm:text-xl">
                  Responsible Gaming & Fair Play
                </h2>
                <p className="mt-1 text-[10px] text-emerald-400">
                  PLATFORM SAFETY INFORMATION
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Age & Location Restrictions
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Participation is restricted to individuals aged 18 and above.
                  Paid game sessions must comply with applicable state and
                  national laws. Verify the current legal restrictions before
                  enabling participation.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  RNG & Game Integrity
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  The platform is designed to use server-side number generation
                  and record game activity, draws and prize claims in MongoDB
                  audit records.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5 sm:col-span-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CircleDollarSign className="h-4 w-4 text-cyan-400" />
                  Payment Verification
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Wallet deposits are subject to the platform's payment
                  verification process using official transaction references.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Medal className="h-4 w-4 text-amber-400" />
                Play responsibly and understand the rules.
              </div>

              <Link
                to="/lobby"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 hover:shadow-emerald-500/40"
              >
                Start Playing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative mx-auto max-w-5xl px-4 pt-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/20 bg-gradient-to-r from-violet-800 via-purple-700 to-pink-700 p-8 text-center shadow-2xl shadow-purple-900/30 sm:p-12">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-[90px]" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-pink-300/20 blur-[90px]" />

          <div className="relative">
            <div className="mx-auto mb-5 flex h-16 w-16 animate-float items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Gift className="h-8 w-8 text-amber-300" />
            </div>

            <h2 className="text-3xl font-black sm:text-4xl">
              Now You Know the Game!
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70">
              Put your knowledge to the test. Explore the available game sessions
              and discover your board.
            </p>

            <Link
              to="/lobby"
              className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-7 py-4 text-sm font-black text-violet-700 shadow-xl transition-all hover:-translate-y-1 hover:bg-cyan-50"
            >
              <Play className="h-5 w-5 fill-current" />
              Explore Game Arena
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
