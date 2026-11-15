import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Gamepad2,
  Trophy,
  History,
  Shield,
  Play,
  Pause,
  RotateCw,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  AlertCircle,
  Check,
  X,
  FileText
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'games', 'payments', 'users', 'boards', 'audit'
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Games state
  const [games, setGames] = useState([]);
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGamePrice, setNewGamePrice] = useState(25);
  const [newGameStartTime, setNewGameStartTime] = useState('');
  const [configuredRules, setConfiguredRules] = useState([
    { ruleKey: 'four_in_a_row', name: '4 in a Row (Any Horizontal Line)', prizeAmount: 75, enabled: true },
    { ruleKey: 'four_in_a_column', name: '4 in a Column (Any Vertical Line)', prizeAmount: 75, enabled: true },
    { ruleKey: 'four_in_a_diagonal', name: '4 in a Diagonal (Corner-to-Corner)', prizeAmount: 80, enabled: true },
    { ruleKey: 'any_line_four', name: 'Combined Any 4 in Line (Row, Column, or Diagonal)', prizeAmount: 75, enabled: true },
    { ruleKey: 'four_corners', name: 'Four Corners [0,0 / 0,3 / 3,0 / 3,3]', prizeAmount: 85, enabled: true },
    { ruleKey: 'corner_box_four', name: 'Corner 2×2 Box (4 Adjacent Corner Numbers)', prizeAmount: 80, enabled: true },
    { ruleKey: 'center_four', name: 'Center Square (Inner 2×2 Core)', prizeAmount: 80, enabled: true },
    { ruleKey: 'connected_four', name: 'Any 4 Connected Numbers (Adjacent Block)', prizeAmount: 60, enabled: true },
    { ruleKey: 'early_five', name: 'Early Five (Fast 5 Any Numbers)', prizeAmount: 50, enabled: true },
    { ruleKey: 'full_house', name: 'Full House (All 16 Numbers Stamped)', prizeAmount: 500, enabled: true }
  ]);

  // Payments state
  const [payments, setPayments] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('pending');
  const [reviewModalPayment, setReviewModalPayment] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Boards state
  const [boardStats, setBoardStats] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  // Audit state
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchAll();
  }, [activeTab]);

  useEffect(() => {
    if (!socket) return;
    socket.on('NEW_PAYMENT_PENDING', () => {
      fetchAnalytics();
      if (activeTab === 'payments') fetchPayments();
    });
    return () => {
      socket.off('NEW_PAYMENT_PENDING');
    };
  }, [socket, activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await fetchAnalytics();
      if (activeTab === 'games') await fetchGames();
      if (activeTab === 'payments') await fetchPayments();
      if (activeTab === 'users') await fetchUsers();
      if (activeTab === 'boards') await fetchBoardStats();
      if (activeTab === 'audit') await fetchAuditLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    const res = await api.get('/admin/analytics');
    setAnalytics(res.stats);
  };

  const fetchGames = async () => {
    const res = await api.get('/games/lobby');
    setGames([...(res.liveGames || []), ...(res.upcomingGames || []), ...(res.pastGames || [])]);
  };

  const fetchPayments = async () => {
    const res = await api.get(`/payments/admin/all?status=${paymentFilter}`);
    setPayments(res.payments || []);
  };

  const fetchUsers = async () => {
    const res = await api.get(`/admin/users${userSearch ? `?search=${userSearch}` : ''}`);
    setUsersList(res.users || []);
  };

  const fetchBoardStats = async () => {
    const res = await api.get('/boards/summary');
    setBoardStats(res);
  };

  const fetchAuditLogs = async () => {
    const res = await api.get('/admin/audit-logs');
    setAuditLogs(res.logs || []);
  };

  // Game actions
  const handleCreateGame = async (e) => {
    e.preventDefault();
    try {
      await api.post('/games/create', {
        title: newGameTitle,
        ticketPrice: Number(newGamePrice),
        scheduledStartTime: newGameStartTime || new Date(),
        winningRules: configuredRules.filter(r => r.enabled)
      });
      setCreateGameOpen(false);
      setNewGameTitle('');
      fetchGames();
      fetchAnalytics();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartGame = async (id) => {
    await api.post(`/games/${id}/start`);
    fetchGames();
    fetchAnalytics();
  };

  const handlePauseGame = async (id) => {
    await api.post(`/games/${id}/pause`);
    fetchGames();
  };

  const handleEndGame = async (id) => {
    if (window.confirm('Are you sure you want to end this game session?')) {
      await api.post(`/games/${id}/end`);
      fetchGames();
      fetchAnalytics();
    }
  };

  const handleSpinBall = async (id) => {
    try {
      await api.post(`/games/${id}/spin`);
      fetchGames();
    } catch (e) {
      alert(e.message);
    }
  };

  // Payment actions
  const handleVerifyPayment = async (action) => {
    if (!reviewModalPayment) return;
    try {
      await api.post(`/payments/admin/verify/${reviewModalPayment._id}`, {
        action,
        adminNotes
      });
      setReviewModalPayment(null);
      setAdminNotes('');
      fetchPayments();
      fetchAnalytics();
    } catch (e) {
      alert(e.message);
    }
  };

  // User actions
  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!balanceModalUser) return;
    try {
      await api.post(`/admin/users/${balanceModalUser._id}/adjust-balance`, {
        amount: Number(adjustAmount),
        reason: adjustReason
      });
      setBalanceModalUser(null);
      setAdjustAmount('');
      setAdjustReason('');
      fetchUsers();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (e) {
      alert(e.message);
    }
  };

  // Board generation action
  const handleGenerateBoards = async (forceReset = false) => {
    if (forceReset && !window.confirm('WARNING: Force reset will recreate all 2,000 unique boards! Continue?')) {
      return;
    }
    try {
      setRegenerating(true);
      await api.post('/boards/generate', { forceReset });
      await fetchBoardStats();
      alert('2,000 Unique 4×4 Boards generated and stored successfully!');
    } catch (e) {
      alert(e.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-850 border border-amber-500/30 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Board Varayal Admin Console</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time control desk: Live spinner, game sessions, payments verification & audit trail.
          </p>
        </div>

        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-dark-700 hover:bg-dark-600 text-slate-200 rounded-xl text-xs font-semibold self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-dark-850 border border-dark-700/80 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Users</span>
          <div className="text-xl font-bold text-white mt-1">{analytics?.totalUsers || 0}</div>
        </div>
        <div className="bg-dark-850 border border-dark-700/80 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Games</span>
          <div className="text-xl font-bold text-amber-400 mt-1">{analytics?.liveGames || 0}</div>
        </div>
        <div className="bg-dark-850 border border-dark-700/80 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Cards Booked</span>
          <div className="text-xl font-bold text-brand-400 mt-1">{analytics?.totalAllocations || 0}</div>
        </div>
        <div className="bg-dark-850 border border-dark-700/80 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Master Boards</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{analytics?.totalMasterBoards || 2000}</div>
        </div>
        <div className="bg-dark-850 border border-dark-700/80 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending UPI</span>
          <div className="text-xl font-bold text-rose-400 mt-1">{analytics?.pendingPaymentsCount || 0}</div>
        </div>
        <div className="bg-dark-850 border border-dark-700/80 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Revenue</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">₹{analytics?.totalRevenue || 0}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-dark-700 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'overview', label: 'Console Overview', icon: LayoutDashboard },
          { id: 'games', label: 'Game Sessions & Spinner', icon: Gamepad2 },
          { id: 'payments', label: `Payments (${analytics?.pendingPaymentsCount || 0})`, icon: CreditCard },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'boards', label: '2,000 Boards Registry', icon: Trophy },
          { id: 'audit', label: 'Compliance Audit Logs', icon: FileText }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Platform System Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-3 bg-dark-900 rounded-xl border border-dark-700/80">
                <span className="text-slate-400 block mb-1">RNG Fairness Algorithm</span>
                <strong className="text-emerald-400">Cryptographic Non-repeatable (1–119)</strong>
              </div>
              <div className="p-3 bg-dark-900 rounded-xl border border-dark-700/80">
                <span className="text-slate-400 block mb-1">Unique 4×4 Boards in Database</span>
                <strong className="text-white">2,000 Unique Verified Matrices</strong>
              </div>
              <div className="p-3 bg-dark-900 rounded-xl border border-dark-700/80">
                <span className="text-slate-400 block mb-1">Socket.IO Live Synchronization</span>
                <strong className="text-emerald-400">Active & Connected</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Games Tab */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Live & Scheduled Game Sessions</h2>
            <button
              onClick={() => setCreateGameOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" /> Create New Game
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {games.map((g) => (
              <div
                key={g._id}
                className="bg-dark-850 border border-dark-700/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                      {g.gameCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        g.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : g.status === 'paused'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-dark-800 text-slate-400'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base">{g.title}</h3>
                  <p className="text-xs text-slate-400">
                    Ticket: ₹{g.ticketPrice} • Balls Drawn:{' '}
                    <strong className="text-white">{g.drawnNumbers?.length || 0} / 119</strong> • Latest Ball:{' '}
                    <strong className="text-amber-400">{g.currentNumber || 'None'}</strong> • Booked:{' '}
                    <strong className="text-emerald-400">{g.totalBoardsBooked || 0}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {g.status === 'scheduled' && (
                    <button
                      onClick={() => handleStartGame(g._id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Game
                    </button>
                  )}
                  {g.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleSpinBall(g._id)}
                        className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Spin Ball (1–119)
                      </button>
                      <button
                        onClick={() => handlePauseGame(g._id)}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition flex items-center gap-1"
                      >
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </button>
                    </>
                  )}
                  {g.status === 'paused' && (
                    <button
                      onClick={() => handleStartGame(g._id)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                    >
                      Resume Game
                    </button>
                  )}
                  {g.status !== 'completed' && (
                    <button
                      onClick={() => handleEndGame(g._id)}
                      className="px-3 py-2 bg-dark-700 hover:bg-rose-900 text-slate-300 hover:text-white font-bold rounded-xl transition"
                    >
                      End Game
                    </button>
                  )}
                  <a
                    href={`/game/${g._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 font-bold rounded-xl border border-dark-700 transition"
                  >
                    Open Arena ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Payments Verification Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-bold text-white">UPI Payment Verification Queue</h2>
            <div className="flex items-center gap-1.5 bg-dark-800 p-1 rounded-xl text-xs">
              {['pending', 'approved', 'rejected', 'all'].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setPaymentFilter(f);
                    fetchPayments();
                  }}
                  className={`px-3 py-1.5 rounded-lg capitalize font-bold transition ${
                    paymentFilter === f ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl overflow-hidden divide-y divide-dark-800 text-xs">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No payment records found for this filter.</div>
            ) : (
              payments.map((p) => (
                <div key={p._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">₹{p.amount}</span>
                      <span className="font-medium text-slate-300">from {p.userName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">(+91 {p.userPhone})</span>
                    </div>
                    <div className="font-mono text-brand-300 text-xs">UTR / Ref: {p.utrNumber}</div>
                    <p className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => {
                            setReviewModalPayment(p);
                            setAdminNotes('Verified bank UTR credit');
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Credit
                        </button>
                        <button
                          onClick={() => {
                            setReviewModalPayment(p);
                            setAdminNotes('UTR not found in bank statement');
                          }}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                          p.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-bold text-white">User Directory & Wallet Management</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="bg-dark-800 border border-dark-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl overflow-hidden divide-y divide-dark-800 text-xs">
            {usersList.map((u) => (
              <div key={u._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{u.name}</span>
                    <span className="font-mono text-slate-400 text-[11px]">+91 {u.phone}</span>
                    {u.role === 'admin' && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    State: {u.stateJurisdiction || 'Kerala'} • Status:{' '}
                    <strong className={u.isActive ? 'text-emerald-400' : 'text-rose-400'}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Balance</span>
                    <span className="font-mono font-extrabold text-emerald-400 text-sm">
                      ₹{u.walletBalance || 0}
                    </span>
                  </div>
                  <button
                    onClick={() => setBalanceModalUser(u)}
                    className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Adjust Balance
                  </button>
                  <button
                    onClick={() => handleToggleUserStatus(u._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      u.isActive
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Boards Registry Tab */}
      {activeTab === 'boards' && (
        <div className="space-y-6">
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-white">2,000 Master 4×4 Boards Catalog</h3>
                <p className="text-xs text-slate-400">
                  Every board consists of 16 distinct random numbers between 1 and 119 with verified non-duplicate hashes.
                </p>
              </div>
              <button
                disabled={regenerating}
                onClick={() => handleGenerateBoards(true)}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-200 border border-dark-600 font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate 2,000 Boards'}
              </button>
            </div>

            <div className="p-4 bg-dark-900 rounded-xl border border-dark-700/80 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">Current Catalog Count:</span>{' '}
                <strong className="text-white text-sm font-mono">{boardStats?.totalCount || 2000}</strong> / 2000
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Ready for allocation
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Regulatory & Compliance Audit Logs</h2>
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl overflow-hidden divide-y divide-dark-800 text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No logs recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-[11px]">{log.action}</span>
                      <span className="text-slate-300 font-medium">{log.actorName || 'System'}</span>
                      <span className="text-slate-500 text-[10px]">({log.actorRole || 'system'})</span>
                    </div>
                    <pre className="text-[10px] text-slate-400 font-mono">
                      {JSON.stringify(log.details)}
                    </pre>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE GAME MODAL WITH CONFIGURABLE PRIZE PATTERNS */}
      {createGameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-dark-850 border border-dark-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-dark-700">
              <div>
                <h3 className="font-bold text-white text-base">Schedule New Game Session</h3>
                <p className="text-xs text-slate-400">Configure 4-number line, column, diagonal, and corner prize patterns.</p>
              </div>
              <button onClick={() => setCreateGameOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGame} className="space-y-4 text-xs overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-slate-300 font-medium">Session Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4-Line Super Varayal"
                    value={newGameTitle}
                    onChange={(e) => setNewGameTitle(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Ticket Price (₹)</label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={newGamePrice}
                    onChange={(e) => setNewGamePrice(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newGameStartTime}
                    onChange={(e) => setNewGameStartTime(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>
              </div>

              {/* Configurable 4-Number Patterns Checklist */}
              <div className="space-y-2 pt-2 border-t border-dark-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">
                    Configurable 4-Number Line, Column, Diagonal & Corner Patterns:
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">
                    Total Pool: ₹{configuredRules.filter(r => r.enabled).reduce((sum, r) => sum + (Number(r.prizeAmount) || 0), 0)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {configuredRules.map((rule, idx) => (
                    <div
                      key={rule.ruleKey}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                        rule.enabled
                          ? 'bg-dark-900 border-brand-500/40 text-white'
                          : 'bg-dark-900/40 border-dark-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => {
                            const updated = [...configuredRules];
                            updated[idx].enabled = e.target.checked;
                            setConfiguredRules(updated);
                          }}
                          className="rounded bg-dark-800 border-dark-700 text-brand-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-semibold">{rule.name}</span>
                      </label>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[10px]">₹</span>
                        <input
                          type="number"
                          min="0"
                          disabled={!rule.enabled}
                          value={rule.prizeAmount}
                          onChange={(e) => {
                            const updated = [...configuredRules];
                            updated[idx].prizeAmount = Number(e.target.value);
                            setConfiguredRules(updated);
                          }}
                          className="w-16 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-right text-xs text-white font-mono font-bold focus:outline-none focus:border-brand-500 disabled:opacity-30"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-dark-800">
                <button
                  type="button"
                  onClick={() => setCreateGameOpen(false)}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-brand-500/20"
                >
                  Create & Launch Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY PAYMENT ACTION MODAL */}
      {reviewModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-dark-850 border border-dark-700 rounded-2xl p-5 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">Review Payment Submission</h3>
            <div className="p-3 bg-dark-900 rounded-xl space-y-1">
              <p className="text-slate-300">User: <strong className="text-white">{reviewModalPayment.userName}</strong></p>
              <p className="text-slate-300">Amount: <strong className="text-emerald-400">₹{reviewModalPayment.amount}</strong></p>
              <p className="font-mono text-brand-300">UTR: {reviewModalPayment.utrNumber}</p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Admin Notes / Verification Memo</label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleVerifyPayment('approve')}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
              >
                Approve & Credit
              </button>
              <button
                onClick={() => handleVerifyPayment('reject')}
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
              >
                Reject Request
              </button>
            </div>
            <button
              onClick={() => setReviewModalPayment(null)}
              className="w-full py-1.5 text-slate-400 hover:text-white text-[11px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ADJUST BALANCE MODAL */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-dark-850 border border-dark-700 rounded-2xl p-5 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">Adjust Wallet: {balanceModalUser.name}</h3>
            <p className="text-slate-400">Current Balance: <strong className="text-emerald-400">₹{balanceModalUser.walletBalance || 0}</strong></p>

            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-300">Amount to Credit (+) or Debit (-)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 100 or -50"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prize Disbursal / Manual Correction"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition"
                >
                  Confirm Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className="px-3 py-2.5 bg-dark-700 hover:bg-dark-600 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

