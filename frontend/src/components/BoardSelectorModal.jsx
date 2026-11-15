import React, { useState, useEffect } from 'react';
import { X, Search, Check, AlertCircle, Sparkles, Filter, ChevronLeft, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BoardSelectorModal({ isOpen, onClose, gameSession, onBoardAllocated, openPaymentModal }) {
  const { user, setWalletBalance } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('available'); // 'available', 'all', 'booked'
  const [stats, setStats] = useState({ totalBooked: 0, totalAvailable: 2000, hasUserBooked: false, userBoardNumber: null });
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [allocating, setAllocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isOpen && gameSession?._id) {
      fetchBoards();
    }
  }, [isOpen, gameSession?._id, page, filter]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const queryParams = new URLSearchParams({
        page,
        limit: 48,
        filter,
        ...(search ? { search } : {})
      });

      const res = await api.get(`/boards/session/${gameSession._id}?${queryParams}`);
      setBoards(res.boards || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setStats(res.stats || { totalBooked: 0, totalAvailable: 2000, hasUserBooked: false });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBoards();
  };

  const handleConfirmAllocation = async () => {
    if (!selectedBoard || !gameSession) return;

    if ((user?.walletBalance || 0) < gameSession.ticketPrice) {
      setErrorMsg(`Insufficient balance. Board price is ₹${gameSession.ticketPrice}, your balance is ₹${user?.walletBalance || 0}.`);
      return;
    }

    try {
      setAllocating(true);
      setErrorMsg(null);
      const res = await api.post('/boards/allocate', {
        gameSessionId: gameSession._id,
        boardNumber: selectedBoard.boardNumber
      });

      // Update local wallet balance
      const newBal = (user?.walletBalance || 0) - gameSession.ticketPrice;
      setWalletBalance(newBal);

      if (onBoardAllocated) {
        onBoardAllocated(res.allocation);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to allocate board');
      fetchBoards(); // refresh in case it was just booked
    } finally {
      setAllocating(false);
    }
  };

  if (!isOpen || !gameSession) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-dark-850 border border-dark-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700 bg-dark-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold bg-brand-500/20 text-brand-400 rounded-md border border-brand-500/30">
                {gameSession.gameCode}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[280px] sm:max-w-md">
                Select Your 4×4 Board
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ticket: <strong className="text-brand-400">₹{gameSession.ticketPrice}</strong> | Your Balance:{' '}
              <strong className="text-emerald-400">₹{user?.walletBalance || 0}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-dark-700 bg-dark-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number"
                min="1"
                max="2000"
                placeholder="Search board # (1 - 2000)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-lg transition"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-1.5 bg-dark-800 p-1 rounded-lg border border-dark-700">
            {['available', 'all', 'booked'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold capitalize transition ${
                  filter === f
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="text-right text-[11px] text-slate-400 w-full sm:w-auto">
            Available: <strong className="text-emerald-400">{stats.totalAvailable}</strong> / 2,000
          </div>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {(user?.walletBalance || 0) < gameSession.ticketPrice && (
              <button
                onClick={() => {
                  if (openPaymentModal) openPaymentModal();
                }}
                className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-xs transition"
              >
                Add Funds
              </button>
            )}
          </div>
        )}

        {/* Boards Grid & Preview layout */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left 2 Cols: Board picker buttons */}
          <div className="md:col-span-2 space-y-3">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-500">Loading boards catalog...</div>
            ) : boards.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-500">No boards match your filter.</div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {boards.map((b) => {
                  const isSelected = selectedBoard?.boardNumber === b.boardNumber;
                  return (
                    <button
                      key={b.boardNumber}
                      disabled={b.isBooked}
                      onClick={() => setSelectedBoard(b)}
                      className={`relative p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        b.isMyBoard
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                          : b.isBooked
                          ? 'border-dark-700/50 bg-dark-900/60 text-slate-600 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-brand-500 bg-brand-500/20 text-white ring-2 ring-brand-500/50'
                          : 'border-dark-700 bg-dark-800/80 hover:border-brand-500/50 hover:bg-dark-700/60 text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">#{b.boardNumber}</span>
                      {b.isBooked ? (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                          <Lock className="w-2.5 h-2.5" /> Taken
                        </span>
                      ) : b.isMyBoard ? (
                        <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">You</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 mt-0.5">Free</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-dark-700/60 text-xs text-slate-400">
                <span>Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Selected Board 4x4 Preview */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-dark-800">
                <span className="text-xs text-slate-400 font-medium">Board Preview</span>
                {selectedBoard ? (
                  <span className="font-mono font-extrabold text-sm text-brand-400">
                    Board #{selectedBoard.boardNumber}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Pick any board</span>
                )}
              </div>

              {selectedBoard ? (
                <div className="mt-4 space-y-3">
                  {/* 4x4 Grid Render */}
                  <div className="grid grid-cols-4 gap-1.5 bg-dark-800/80 p-2 rounded-xl border border-dark-700">
                    {selectedBoard.grid.map((row, rIdx) =>
                      row.map((num, cIdx) => (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className="h-10 sm:h-12 flex items-center justify-center font-mono font-bold text-sm bg-dark-900/90 text-white rounded-lg border border-dark-700/70"
                        >
                          {num}
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Contains 16 non-repeating numbers from 1–119.
                  </p>
                </div>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-600 animate-pulse" />
                  <p>Click on any board number on the left to inspect its 4×4 number layout.</p>
                </div>
              )}
            </div>

            {/* Bottom Action */}
            {selectedBoard && (
              <div className="pt-2 border-t border-dark-800">
                {stats.hasUserBooked ? (
                  <div className="text-center p-2.5 bg-dark-800 rounded-lg text-xs text-slate-400">
                    You already have Board #{stats.userBoardNumber} for this game.
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmAllocation}
                    disabled={allocating || selectedBoard.isBooked}
                    className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {allocating ? (
                      'Securing Board...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Book Board #{selectedBoard.boardNumber} (₹{gameSession.ticketPrice})
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

