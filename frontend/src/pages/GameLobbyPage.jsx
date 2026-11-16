import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gamepad2, Trophy, Users, Play, Calendar, Clock, Sparkles,
  ArrowRight, Flame, CheckCircle, RefreshCw, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGameLobby } from '../hooks/useApi';
import BoardSelectorModal from '../components/BoardSelectorModal';

export default function GameLobbyPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: lobbyData, isLoading, refetch } = useGameLobby();
  const [selectedGameForBoard, setSelectedGameForBoard] = useState(null);

  const liveGames = lobbyData?.liveGames || [];
  const upcomingGames = lobbyData?.upcomingGames || [];
  const pastGames = lobbyData?.pastGames || [];

  const handleSelectBoard = (game) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isAdmin) { alert('Admins cannot participate in games. Use the Admin Console to manage games.'); return; }
    if (game.status !== 'scheduled') {
      alert('This game has already started! Boards cannot be selected once the game is live.');
      return;
    }
    setSelectedGameForBoard(game);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Lobby Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850 border border-dark-700/80 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-500/20 text-brand-400 rounded-xl"><Gamepad2 className="w-5 h-5" /></span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Board Varayal Arena Lobby</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time game sessions. Pre-book your 4×4 card before game start, track live drawn numbers, and win prizes!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-slate-300 rounded-xl text-xs font-semibold transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin && (
        <div className="p-4 bg-amber-950/30 border border-amber-800/30 text-amber-300 rounded-xl text-xs flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 shrink-0" />
          <span>You are logged in as <strong>Admin</strong>. Admins control and spin the games but cannot participate or select boards. Use the <Link to="/admin" className="underline font-bold">Admin Console</Link> to manage games.</span>
        </div>
      )}

      {/* 1. Live Games Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Live Ongoing Sessions</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold">
              {liveGames.length} Active
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading live arena...</div>
        ) : liveGames.length === 0 ? (
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No game actively spinning right now.</p>
            <p className="text-xs text-slate-400">Pre-book your board in upcoming scheduled sessions below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveGames.map((game) => (
              <div key={game._id}
                className="bg-dark-850 border-2 border-brand-500/40 hover:border-brand-500 rounded-2xl p-5 shadow-xl shadow-brand-500/5 flex flex-col justify-between space-y-4 relative overflow-hidden group transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 bg-brand-500/20 text-brand-400 font-mono font-bold rounded-lg border border-brand-500/30">{game.gameCode}</span>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {game.status === 'paused' ? 'PAUSED' : 'LIVE DRAWING'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition">{game.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{game.description || 'Live Board Varayal 4x4 session'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-dark-900 rounded-xl text-center text-xs border border-dark-700/80">
                    <div><span className="text-[10px] text-slate-400 block">Board Price</span><strong className="text-brand-400 font-bold">₹{game.ticketPrice}</strong></div>
                    <div><span className="text-[10px] text-slate-400 block">Drawn</span><strong className="text-white font-mono font-bold">{game.drawnNumbers?.length || 0}/119</strong></div>
                    <div><span className="text-[10px] text-slate-400 block">Prize Pool</span><strong className="text-emerald-400 font-bold">₹{game.totalPrizePool || 1000}</strong></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-dark-800 space-y-2">
                  <div className="text-[11px] text-amber-400/90 flex items-center justify-center gap-1 font-medium bg-amber-950/20 p-1.5 rounded-lg border border-amber-800/30">
                    <Lock className="w-3 h-3" /> Game in progress • Boards are locked
                  </div>
                  <Link to={`/game/${game._id}`}
                    className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition text-center">
                    <Play className="w-3.5 h-3.5 fill-current" /> Enter Live Arena
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Upcoming Scheduled Games (Where users CAN select & lock a board) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-400" />
          <span>Upcoming Scheduled Rounds</span>
          <span className="text-xs text-emerald-400 font-normal">(Board selection open until game starts)</span>
        </h2>
        {upcomingGames.length === 0 ? (
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-6 text-center text-xs text-slate-500">No upcoming sessions.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingGames.map((game) => (
              <div key={game._id} className="bg-dark-850 border border-dark-700/80 hover:border-dark-600 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-400">{game.gameCode}</span>
                    <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(game.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base">{game.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{game.description}</p>
                </div>
                <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Board Price: <strong className="text-brand-400">₹{game.ticketPrice}</strong></span>
                  {!isAdmin ? (
                    <button onClick={() => handleSelectBoard(game)}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/20">
                      Select & Lock Board
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Admin Controller</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Past Games */}
      {pastGames.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Recent Completed Games & Results
          </h2>
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl overflow-hidden divide-y divide-dark-800 text-xs">
            {pastGames.map((game) => (
              <div key={game._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-dark-800/40 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-400">{game.gameCode}</span>
                    <h4 className="font-bold text-white">{game.title}</h4>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Concluded on {new Date(game.completedAt || game.updatedAt).toLocaleString()} • {game.drawnNumbers?.length || 0} balls drawn
                  </p>
                </div>
                <Link to={`/game/${game._id}`}
                  className="px-3.5 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-lg text-xs font-semibold self-start sm:self-auto border border-dark-700">
                  View Game Board & Winners
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Board Selector Modal */}
      {selectedGameForBoard && (
        <BoardSelectorModal
          isOpen={Boolean(selectedGameForBoard)}
          onClose={() => setSelectedGameForBoard(null)}
          gameSession={selectedGameForBoard}
          onBoardAllocated={(allocation) => navigate(`/game/${selectedGameForBoard._id}`)}
        />
      )}
    </div>
  );
}
