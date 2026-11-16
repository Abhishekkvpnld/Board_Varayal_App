import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Trophy,
  ArrowLeft,
  Share2,
  ShieldAlert,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Lock
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import LiveSpinnerWheel from '../components/LiveSpinnerWheel';
import GameBoardView from '../components/GameBoardView';
import BoardSelectorModal from '../components/BoardSelectorModal';

export default function LiveGameArenaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { socket, joinGame, leaveGame } = useSocket();

  const [game, setGame] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

  // Fetch initial game state and user allocation
  useEffect(() => {
    fetchGameData();
    joinGame(id);

    return () => {
      leaveGame(id);
    };
  }, [id]);

  // Socket.IO event listeners for real-time synchronization
  useEffect(() => {
    if (!socket) return;

    // 1. Number drawn broadcast
    const handleNumberDrawn = (data) => {
      if (data.gameId === id) {
        setGame((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            drawnNumbers: data.drawnNumbers,
            currentNumber: data.drawnNumber,
            remainingNumbers: data.remainingNumbers || prev.remainingNumbers,
            winningRules: data.winningRules || prev.winningRules,
            status: data.status || prev.status
          };
        });
      }
    };

    // 2. Player's board updated with newly marked number
    const handleBoardUpdated = (data) => {
      setAllocation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          markedNumbers: data.markedNumbers,
          wonRules: data.wonRules || prev.wonRules
        };
      });
    };

    // 3. Game status change
    const handleStatusChanged = (data) => {
      if (data.gameId === id) {
        setGame((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
    };

    // 4. Auto-spin status update
    const handleAutoSpinStatus = (data) => {
      setIsAutoSpinning(data.enabled);
    };

    // 5. Board taken in the session
    const handleBoardTaken = (data) => {
      setGame((prev) => (prev ? { ...prev, totalBoardsBooked: data.totalBooked } : prev));
    };

    socket.on('NUMBER_DRAWN', handleNumberDrawn);
    socket.on('MY_BOARD_UPDATED', handleBoardUpdated);
    socket.on('GAME_STATUS_CHANGED', handleStatusChanged);
    socket.on('AUTO_SPIN_STATUS', handleAutoSpinStatus);
    socket.on('BOARD_TAKEN', handleBoardTaken);

    return () => {
      socket.off('NUMBER_DRAWN', handleNumberDrawn);
      socket.off('MY_BOARD_UPDATED', handleBoardUpdated);
      socket.off('GAME_STATUS_CHANGED', handleStatusChanged);
      socket.off('AUTO_SPIN_STATUS', handleAutoSpinStatus);
      socket.off('BOARD_TAKEN', handleBoardTaken);
    };
  }, [socket, id]);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch game details
      const gameRes = await api.get(`/games/${id}`);
      setGame(gameRes.game);
      setIsAutoSpinning(gameRes.isAutoSpinning);

      // Fetch user's board allocation for this game (if authenticated)
      if (isAuthenticated) {
        const boardRes = await api.get(`/boards/my/${id}`);
        setAllocation(boardRes.allocation || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load game arena');
    } finally {
      setLoading(false);
    }
  };

  // Admin Spin actions
  const handleAdminSpin = async () => {
    try {
      await api.post(`/games/${id}/spin`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminToggleAutoSpin = async () => {
    try {
      await api.post(`/games/${id}/auto-spin`, {
        enabled: !isAutoSpinning,
        intervalSeconds: 6
      });
      setIsAutoSpinning(!isAutoSpinning);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-xs text-slate-400 space-y-3">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p>Connecting to Live Varayal Arena Room...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-lg mx-auto my-12 p-6 bg-dark-850 border border-dark-700 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Arena Error</h2>
        <p className="text-xs text-slate-400">{error || 'Game session not found'}</p>
        <Link
          to="/lobby"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Lobby
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Arena Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-dark-850 border border-dark-700/80 px-5 py-3.5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            to="/lobby"
            className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-xl transition"
            title="Back to Lobby"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-brand-400 text-xs px-2 py-0.5 bg-brand-500/10 rounded border border-brand-500/20">
                {game.gameCode}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {game.title}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Ticket: <strong className="text-white">₹{game.ticketPrice}</strong> • Boards Booked:{' '}
              <strong className="text-emerald-400">{game.totalBoardsBooked || 0}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
              game.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : game.status === 'paused'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-dark-800 text-slate-400 border-dark-700'
            }`}
          >
            {game.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            {game.status}
          </span>

          {!allocation && !isAdmin && (
            game.status === 'scheduled' ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else setBoardModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/25 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Pick 4×4 Board (₹{game.ticketPrice})
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-dark-800 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Boards Locked (Game Live)
              </span>
            )
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              Admin Console ↗
            </Link>
          )}
        </div>
      </div>

      {/* Main Arena Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Live Number Spinner */}
        <div className="lg:col-span-5 space-y-6">
          <LiveSpinnerWheel
            currentNumber={game.currentNumber}
            drawnNumbers={game.drawnNumbers || []}
            remainingCount={119 - (game.drawnNumbers?.length || 0)}
            isAutoSpinning={isAutoSpinning}
            isAdmin={isAdmin}
            onSpinNext={handleAdminSpin}
            onToggleAutoSpin={handleAdminToggleAutoSpin}
          />

          {/* Quick How to Win mini widget */}
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Auto-Varayal Protection:
            </span>
            <p className="leading-relaxed text-[11px]">
              Every time a ball is spun, your 4×4 board is automatically checked on the backend and stamped in real time. Prize payouts are credited immediately upon rule completion.
            </p>
          </div>
        </div>

        {/* Right Column (7 Cols): Player's Board & Winning Rules */}
        <div className="lg:col-span-7 space-y-6">
          {allocation ? (
            <GameBoardView
              allocation={allocation}
              lastDrawnNumber={game.currentNumber}
            />
          ) : isAdmin ? (
            <div className="bg-dark-850 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                  <Gamepad2 className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Administrator Game Monitor</h3>
                  <p className="text-xs text-slate-400">You are monitoring this session as Administrator. Admins control the game and live spinner but do not play.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-3 bg-dark-900 rounded-xl border border-dark-700/80">
                  <span className="text-[10px] text-slate-400 block">Total Booked</span>
                  <strong className="text-base font-bold text-emerald-400">{game.totalBoardsBooked || 0} / 2000</strong>
                </div>
                <div className="p-3 bg-dark-900 rounded-xl border border-dark-700/80">
                  <span className="text-[10px] text-slate-400 block">Drawn Balls</span>
                  <strong className="text-base font-bold text-white font-mono">{game.drawnNumbers?.length || 0} / 119</strong>
                </div>
                <div className="p-3 bg-dark-900 rounded-xl border border-dark-700/80">
                  <span className="text-[10px] text-slate-400 block">Remaining Balls</span>
                  <strong className="text-base font-bold text-amber-400 font-mono">{119 - (game.drawnNumbers?.length || 0)}</strong>
                </div>
                <div className="p-3 bg-dark-900 rounded-xl border border-dark-700/80">
                  <span className="text-[10px] text-slate-400 block">Prize Pool</span>
                  <strong className="text-base font-bold text-brand-400">₹{game.totalPrizePool || 0}</strong>
                </div>
              </div>
            </div>
          ) : game.status !== 'scheduled' ? (
            <div className="bg-dark-850 border border-dark-700 rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Board Selection is Locked</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This game has already started drawing numbers. New boards cannot be selected once the game is live. You can follow the live spinner or return to the lobby to pre-book a board for the next game.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/lobby"
                  className="px-5 py-2.5 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Go to Game Lobby
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-dark-850 to-dark-900 border-2 border-dashed border-dark-700 rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/20 shadow-inner">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Join This Varayal Round!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Pick any available 4×4 card containing 16 random numbers (1–119) from our catalog of 2,000 unique boards.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else setBoardModalOpen(true);
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl text-sm shadow-xl shadow-brand-500/20 transition hover:scale-105"
                >
                  Select My 4×4 Board (₹{game.ticketPrice})
                </button>
              </div>
            </div>
          )}

          {/* Active Winning Rules & Live Winners Feed */}
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Prizes & Winning Rules</span>
              </h3>
              <span className="text-xs text-emerald-400 font-bold">
                Pool: ₹{game.totalPrizePool || 1000}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {game.winningRules?.map((rule, idx) => {
                const isClaimed = rule.claimed || (rule.winners && rule.winners.length >= (rule.maxWinners || 1));
                const winner = rule.winners?.[0];

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      isClaimed
                        ? 'bg-amber-950/20 border-amber-800/40 text-slate-300'
                        : 'bg-dark-900 border-dark-700/80 text-white hover:border-brand-500/40'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{rule.name}</span>
                        {isClaimed && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold uppercase">
                            Won
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isClaimed && winner ? (
                          <>Won by <strong className="text-amber-300">{winner.userName}</strong> (Board #{winner.boardNumber})</>
                        ) : (
                          'Open for claims'
                        )}
                      </p>
                    </div>

                    <div className="text-right font-mono font-extrabold text-sm text-emerald-400">
                      ₹{rule.prizeAmount}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Board Selector Modal */}
      {boardModalOpen && (
        <BoardSelectorModal
          isOpen={boardModalOpen}
          onClose={() => setBoardModalOpen(false)}
          gameSession={game}
          onBoardAllocated={(newAlloc) => {
            setAllocation(newAlloc);
            fetchGameData();
          }}
        />
      )}
    </div>
  );
}

