import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, History, Gamepad2, ArrowRight, ShieldCheck, Clock,
  CheckCircle2, Lock, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMyAllocationsHistory } from '../hooks/useApi';

export default function PlayerDashboardPage() {
  const { user } = useAuth();
  const { data: historyData, refetch, isLoading } = useMyAllocationsHistory();
  const allocations = historyData?.allocations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner / User KPI Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="bg-dark-850 border border-dark-700/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Player Profile
            </span>
            <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono">+91 {user?.phone}</p>
          </div>
          <div className="pt-3 border-t border-dark-800 flex items-center justify-between text-xs text-slate-400">
            <span>Jurisdiction: <strong className="text-white">{user?.stateJurisdiction || 'Kerala'}</strong></span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Admin
            </span>
          </div>
        </div>

        {/* Total Boards Locked Card */}
        <div className="bg-dark-850 border border-dark-700/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> My Locked Boards
            </span>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {allocations.length}
            </div>
            <p className="text-xs text-slate-400">Pre-booked cards across sessions</p>
          </div>
          <div className="pt-3 border-t border-dark-800 text-xs text-slate-400">
            1 card per game session policy
          </div>
        </div>

        {/* Quick Arena Entrance */}
        <div className="bg-dark-850 border border-dark-700/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Live Varayal Action
            </span>
            <h3 className="text-base font-bold text-white">Join Live Games Lobby</h3>
            <p className="text-xs text-slate-400">Pre-book cards & track live number spins</p>
          </div>
          <Link
            to="/lobby"
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-brand-500/20 text-center"
          >
            <Gamepad2 className="w-4 h-4" /> Enter Game Lobby
          </Link>
        </div>
      </div>

      {/* Locked Boards & Game History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" /> My Selected Boards & Rounds
          </h2>
          <button
            onClick={() => refetch()}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading your board history...</div>
        ) : allocations.length === 0 ? (
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-8 text-center text-xs text-slate-400 space-y-2">
            <Gamepad2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-white">You haven't locked in any boards yet.</p>
            <p className="text-slate-400">Visit the Game Lobby before a round starts to choose your 4×4 board.</p>
            <div className="pt-2">
              <Link
                to="/lobby"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Go to Game Lobby <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allocations.map((alloc) => {
              const game = alloc.gameSessionId;
              const isGameLive = game?.status === 'active';
              return (
                <div
                  key={alloc._id}
                  className="bg-dark-850 border border-dark-700/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                        {game?.gameCode || 'BV-GAME'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isGameLive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-dark-800 text-slate-400'
                        }`}
                      >
                        {game?.status || 'Scheduled'}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{game?.title || 'Varayal Game'}</h4>

                    <div className="flex items-center justify-between p-2.5 bg-dark-900 rounded-xl border border-dark-700 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Locked Board</span>
                        <strong className="text-emerald-400 font-mono text-sm font-bold">
                          #{alloc.boardNumber}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Board Price</span>
                        <strong className="text-white font-mono text-xs">₹{game?.ticketPrice || 25}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Numbers marked:{' '}
                      <strong className="text-white font-mono">
                        {alloc.markedNumbers?.length || 0} / 16
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dark-800">
                    <Link
                      to={`/game/${game?._id || alloc.gameSessionId}`}
                      className="w-full py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      Open Live Arena ↗
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
