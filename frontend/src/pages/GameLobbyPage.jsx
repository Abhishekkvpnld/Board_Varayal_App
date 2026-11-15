import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Trophy,
  Users,
  Play,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import BoardSelectorModal from '../components/BoardSelectorModal';
import PaymentModal from '../components/PaymentModal';

export default function GameLobbyPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [lobbyData, setLobbyData] = useState({ liveGames: [], upcomingGames: [], pastGames: [] });
  const [loading, setLoading] = useState(true);
  const [selectedGameForBoard, setSelectedGameForBoard] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    fetchLobby();
    const interval = setInterval(fetchLobby, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLobby = async () => {
    try {
      const res = await api.get('/games/lobby');
      setLobbyData({
        liveGames: res.liveGames || [],
        upcomingGames: res.upcomingGames || [],
        pastGames: res.pastGames || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBoard = (game) => {
    if (!isAuthenticated) {
      navigate('/login');
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
            <span className="p-2 bg-brand-500/20 text-brand-400 rounded-xl">
              <Gamepad2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Board Varayal Arena Lobby</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time game sessions. Pick your 4×4 card, track live drawn numbers, and win prizes!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLobby}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setPaymentOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-dark-900 font-bold rounded-xl text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" /> Add Balance (₹{user?.walletBalance || 0})
            </button>
          )}
        </div>
      </div>

      {/* 1. Live Games Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Live Ongoing Sessions</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold">
              {lobbyData.liveGames.length} Active
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading live arena...</div>
        ) : lobbyData.liveGames.length === 0 ? (
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No game actively spinning right now.</p>
            <p className="text-xs text-slate-400">Check upcoming scheduled sessions below or create one from admin console.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lobbyData.liveGames.map((game) => (
              <div
                key={game._id}
                className="bg-dark-850 border-2 border-brand-500/40 hover:border-brand-500 rounded-2xl p-5 shadow-xl shadow-brand-500/5 flex flex-col justify-between space-y-4 relative overflow-hidden group transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 bg-brand-500/20 text-brand-400 font-mono font-bold rounded-lg border border-brand-500/30">
                      {game.gameCode}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {game.status === 'paused' ? 'PAUSED' : 'LIVE DRAWING'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {game.description || 'Live Board Varayal 4x4 session'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-dark-900 rounded-xl text-center text-xs border border-dark-700/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ticket</span>
                      <strong className="text-brand-400 font-bold">₹{game.ticketPrice}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Drawn</span>
                      <strong className="text-white font-mono font-bold">{game.drawnNumbers?.length || 0}/119</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Prize Pool</span>
                      <strong className="text-emerald-400 font-bold">₹{game.totalPrizePool || 1000}</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dark-800">
                  <button
                    onClick={() => handleSelectBoard(game)}
                    className="py-2.5 bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700 font-bold rounded-xl text-xs transition text-center"
                  >
                    Select Board
                  </button>
                  <Link
                    to={`/game/${game._id}`}
                    className="py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Join Arena
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Upcoming Scheduled Games */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-400" />
          <span>Upcoming Scheduled Rounds</span>
        </h2>

        {lobbyData.upcomingGames.length === 0 ? (
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-6 text-center text-xs text-slate-500">
            No upcoming sessions currently scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lobbyData.upcomingGames.map((game) => (
              <div
                key={game._id}
                className="bg-dark-850 border border-dark-700/80 hover:border-dark-600 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition"
              >
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
                  <span className="text-xs text-slate-300">
                    Ticket: <strong className="text-brand-400">₹{game.ticketPrice}</strong>
                  </span>
                  <button
                    onClick={() => handleSelectBoard(game)}
                    className="px-4 py-2 bg-brand-500/20 hover:bg-brand-500 text-brand-400 hover:text-white border border-brand-500/30 rounded-xl text-xs font-bold transition"
                  >
                    Pre-Book Card
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Completed Games Archive */}
      {lobbyData.pastGames.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Recent Completed Games & Results</span>
          </h2>

          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl overflow-hidden divide-y divide-dark-800 text-xs">
            {lobbyData.pastGames.map((game) => (
              <div
                key={game._id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-dark-800/40 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-400">{game.gameCode}</span>
                    <h4 className="font-bold text-white">{game.title}</h4>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Concluded on {new Date(game.completedAt || game.updatedAt).toLocaleString()} • {game.drawnNumbers?.length || 0} balls drawn
                  </p>
                </div>

                <Link
                  to={`/game/${game._id}`}
                  className="px-3.5 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-lg text-xs font-semibold self-start sm:self-auto border border-dark-700"
                >
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
          openPaymentModal={() => setPaymentOpen(true)}
          onBoardAllocated={(allocation) => {
            navigate(`/game/${selectedGameForBoard._id}`);
          }}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}

