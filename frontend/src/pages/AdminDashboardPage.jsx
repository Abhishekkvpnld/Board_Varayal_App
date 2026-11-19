
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, CreditCard, Gamepad2, Trophy, History,
  Shield, Play, Pause, RotateCw, CheckCircle, XCircle, Plus,
  RefreshCw, Search, AlertCircle, Check, X, FileText,
  UserCheck, Ban, Clock, Edit3, ShieldCheck, UserX,
  Wallet, TrendingUp, CalendarDays, CircleDollarSign,
  Sparkles, ChevronRight, Crown, Activity, Settings,
  ArrowUpRight, Zap, Lock, UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  useAdminAnalytics, useAdminUsers, useAdminAuditLogs,
  useVerifyUser, useBlockUser, useUnblockUser, useToggleUserStatus,
  useAdjustBalance, useGameLobby, useAdminPayments, useVerifyPayment,
  useCreateGame, useUpdateGame, useStartGame, usePauseGame,
  useEndGame, useSpinBall, useBoardSummary, useGenerateBoards
} from '../hooks/useApi';

/* -------------------------------------------------------
   DESIGN COMPONENTS
------------------------------------------------------- */

const panelClass =
  'rounded-2xl border border-white/[0.07] bg-[#111528]/90 shadow-xl shadow-black/10';

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#090d1b] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10';

const labelClass =
  'mb-1.5 block text-xs font-semibold text-slate-300';

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white disabled:opacity-50';

function SectionHeading({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-black text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color = 'violet', subtitle }) {
  const colors = {
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    pink: 'border-pink-500/20 bg-pink-500/10 text-pink-400',
  };

  return (
    <div className={`${panelClass} group relative overflow-hidden p-4 transition duration-300 hover:-translate-y-1 hover:border-white/15`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.025] blur-2xl transition group-hover:bg-white/[0.06]" />

      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-[10px] text-slate-500">{subtitle}</p>
          )}
        </div>

        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    scheduled: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    paused: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    completed: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
    pending: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    approved: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    rejected: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${styles[status] || styles.completed}`}>
      {status === 'active' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      )}
      {status}
    </span>
  );
}

function Modal({ title, description, onClose, children, maxWidth = 'max-w-2xl' }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`relative my-auto flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111528] shadow-2xl shadow-black/50`}>
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400" />

        <div className="flex items-center justify-between border-b border-white/[0.07] p-5 sm:p-6">
          <div>
            <h3 className="text-base font-black text-white">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon = FileText, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-bold text-slate-300">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function RuleEditor({ rules, setRules }) {
  const updateRule = (idx, changes) => {
    setRules((prev) =>
      prev.map((rule, i) =>
        i === idx ? { ...rule, ...changes } : rule
      )
    );
  };

  const total = rules
    .filter((rule) => rule.enabled)
    .reduce((sum, rule) => sum + (Number(rule.prizeAmount) || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-white">Prize Patterns</span>
        <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-400">
          Total Prize Pool: ₹{total}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rules.map((rule, idx) => (
          <div
            key={rule.ruleKey}
            className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition ${
              rule.enabled
                ? 'border-violet-500/30 bg-violet-500/[0.06]'
                : 'border-white/[0.06] bg-white/[0.015] opacity-60'
            }`}
          >
            <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(e) =>
                  updateRule(idx, { enabled: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-[#090d1b] text-violet-500 focus:ring-violet-500"
              />
              <span className="text-[11px] font-semibold leading-5 text-slate-300">
                {rule.name}
              </span>
            </label>

            <div className="flex shrink-0 items-center gap-1">
              <span className="text-[10px] text-slate-500">₹</span>
              <input
                type="number"
                min="0"
                disabled={!rule.enabled}
                value={rule.prizeAmount}
                onChange={(e) =>
                  updateRule(idx, { prizeAmount: Number(e.target.value) })
                }
                className="w-[68px] rounded-lg border border-white/10 bg-[#090d1b] px-2 py-1.5 text-right text-xs font-bold text-white outline-none focus:border-violet-500 disabled:opacity-30"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   MAIN DASHBOARD
------------------------------------------------------- */

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');

  // Games state
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

  // Edit game state
  const [editGameModalOpen, setEditGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState(25);
  const [editStartTime, setEditStartTime] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRules, setEditRules] = useState([]);

  // Payments state
  const [paymentFilter, setPaymentFilter] = useState('pending');
  const [reviewModalPayment, setReviewModalPayment] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Users state
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Queries
  const { data: analyticsData, refetch: refetchAnalytics } = useAdminAnalytics();
  const analytics = analyticsData?.stats;

  const { data: usersData, refetch: refetchUsers } = useAdminUsers(userFilter, userSearch);
  const usersList = usersData?.users || [];

  const { data: lobbyData, refetch: refetchGames } = useGameLobby();
  const games = [
    ...(lobbyData?.liveGames || []),
    ...(lobbyData?.upcomingGames || []),
    ...(lobbyData?.pastGames || [])
  ];

  const { data: paymentsData, refetch: refetchPayments } = useAdminPayments(paymentFilter);
  const payments = paymentsData?.payments || [];

  const { data: boardStatsData } = useBoardSummary();

  const { data: auditData } = useAdminAuditLogs();
  const auditLogs = auditData?.logs || [];

  // Mutations
  const verifyUserMut = useVerifyUser();
  const blockUserMut = useBlockUser();
  const unblockUserMut = useUnblockUser();
  const toggleStatusMut = useToggleUserStatus();
  const adjustBalanceMut = useAdjustBalance();

  const createGameMut = useCreateGame();
  const updateGameMut = useUpdateGame();
  const startGameMut = useStartGame();
  const pauseGameMut = usePauseGame();
  const endGameMut = useEndGame();
  const spinBallMut = useSpinBall();

  const generateBoardsMut = useGenerateBoards();
  const verifyPaymentMut = useVerifyPayment();

  useEffect(() => {
    if (!socket) return;

    const handleNewPayment = () => {
      refetchAnalytics();
      if (activeTab === 'payments') refetchPayments();
    };

    socket.on('NEW_PAYMENT_PENDING', handleNewPayment);

    return () => {
      socket.off('NEW_PAYMENT_PENDING', handleNewPayment);
    };
  }, [socket, activeTab, refetchAnalytics, refetchPayments]);

  const refreshAll = () => {
    refetchAnalytics();
    refetchGames();
    refetchUsers();
    refetchPayments();
  };

  // Create game
  const handleCreateGame = async (e) => {
    e.preventDefault();

    try {
      await createGameMut.mutateAsync({
        title: newGameTitle,
        ticketPrice: Number(newGamePrice),
        scheduledStartTime: newGameStartTime || new Date(),
        winningRules: configuredRules.filter((r) => r.enabled)
      });

      setCreateGameOpen(false);
      setNewGameTitle('');
      setNewGamePrice(25);
      setNewGameStartTime('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Edit game
  const openEditModal = (g) => {
    setEditingGame(g);
    setEditTitle(g.title || '');
    setEditPrice(g.ticketPrice || 25);
    setEditDescription(g.description || '');
    setEditStartTime(
      g.scheduledStartTime
        ? new Date(g.scheduledStartTime).toISOString().slice(0, 16)
        : ''
    );

    const merged = configuredRules.map((baseRule) => {
      const existing = (g.winningRules || []).find(
        (r) => r.ruleKey === baseRule.ruleKey
      );

      if (existing) {
        return {
          ...baseRule,
          name: existing.name || baseRule.name,
          prizeAmount:
            existing.prizeAmount !== undefined
              ? existing.prizeAmount
              : baseRule.prizeAmount,
          enabled:
            existing.enabled !== undefined ? existing.enabled : true
        };
      }

      return { ...baseRule, enabled: false };
    });

    setEditRules(merged);
    setEditGameModalOpen(true);
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    if (!editingGame) return;

    try {
      await updateGameMut.mutateAsync({
        gameId: editingGame._id,
        data: {
          title: editTitle,
          ticketPrice: Number(editPrice),
          scheduledStartTime: editStartTime || undefined,
          description: editDescription,
          winningRules: editRules.filter((r) => r.enabled)
        }
      });

      setEditGameModalOpen(false);
      setEditingGame(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Payment actions
  const handleVerifyPayment = async (action) => {
    if (!reviewModalPayment) return;

    try {
      await verifyPaymentMut.mutateAsync({
        paymentId: reviewModalPayment._id,
        action,
        adminNotes
      });

      setReviewModalPayment(null);
      setAdminNotes('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Wallet adjustment
  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!balanceModalUser) return;

    try {
      await adjustBalanceMut.mutateAsync({
        userId: balanceModalUser._id,
        amount: Number(adjustAmount),
        reason: adjustReason
      });

      setBalanceModalUser(null);
      setAdjustAmount('');
      setAdjustReason('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSearchUsers = () => {
    setUserSearch(searchInput);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', count: analytics?.pendingVerification || 0, icon: Users },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'payments', label: 'Payments', count: analytics?.pendingPaymentsCount || 0, icon: CreditCard },
    { id: 'boards', label: '2,000 Boards', icon: Trophy },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090b18] px-4 py-7 sm:px-6 lg:px-8">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/[0.08] blur-[140px]" />
        <div className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-pink-600/[0.05] blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-7">

        {/* HEADER */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#19162d] via-[#111528] to-[#101b2d] p-5 shadow-2xl shadow-black/20 sm:p-7">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-amber-500/[0.08] blur-[80px]" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-[80px]" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">
                <Crown className="h-3.5 w-3.5" />
                Master Control Center
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Admin <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">Dashboard</span>
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400 sm:text-sm">
                Welcome back, {user?.name || 'Administrator'}. Manage players,
                game sessions, payments, boards and platform activity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2 text-[10px] font-bold text-emerald-400">
                <Activity className="h-3.5 w-3.5" />
                SYSTEM ONLINE
              </div>

              <button
                onClick={refreshAll}
                className={secondaryButton}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh Data
              </button>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-1 gap-3 border-t border-white/[0.07] pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">ADMIN ACCESS</p>
                <p className="text-xs font-semibold text-slate-200">Control Only</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">PLAYER SECURITY</p>
                <p className="text-xs font-semibold text-slate-200">Admin Verification</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <Ban className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500">ACCESS CONTROL</p>
                <p className="text-xs font-semibold text-slate-200">Block / Unblock Users</p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-black text-white">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Platform Overview
            </h2>
            <span className="text-[10px] font-semibold text-slate-500">LIVE ANALYTICS</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            <KpiCard title="Total Users" value={analytics?.totalUsers || 0} icon={Users} color="violet" />
            <KpiCard title="Pending Verify" value={analytics?.pendingVerification || 0} icon={Clock} color="amber" />
            <KpiCard title="Verified" value={analytics?.verifiedUsers || 0} icon={UserCheck} color="emerald" />
            <KpiCard title="Blocked" value={analytics?.blockedUsers || 0} icon={UserX} color="rose" />
            <KpiCard title="Live Games" value={analytics?.liveGames || 0} icon={Gamepad2} color="cyan" />
            <KpiCard title="Cards Booked" value={analytics?.totalAllocations || 0} icon={Trophy} color="pink" />
            <KpiCard title="Pending UPI" value={analytics?.pendingPaymentsCount || 0} icon={CreditCard} color="rose" />
            <KpiCard title="Revenue" value={`₹${analytics?.totalRevenue || 0}`} icon={TrendingUp} color="emerald" />
          </div>
        </section>

        {/* NAVIGATION TABS */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111528]/90 p-1.5 shadow-xl">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/10 text-violet-300 shadow-inner'
                      : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}

                  {tab.count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-rose-500 px-1 text-[9px] font-black text-white">
                      {tab.count}
                    </span>
                  )}

                  {active && (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------
             OVERVIEW TAB
        ------------------------------------------------ */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <SectionHeading
              icon={LayoutDashboard}
              title="Console Overview"
              description="Your platform's administration and security controls."
            />

            <div className={`${panelClass} overflow-hidden`}>
              <div className="flex items-center gap-3 border-b border-white/[0.06] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Platform System Status</h3>
                  <p className="mt-0.5 text-[10px] text-slate-500">Core platform policies and controls</p>
                </div>
                <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black text-emerald-400">
                  OPERATIONAL
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
                  <Crown className="mb-3 h-5 w-5 text-amber-400" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin Policy</p>
                  <p className="mt-2 text-xs font-bold leading-5 text-amber-300">
                    Control Only — Cannot Participate or Buy Boards
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-400" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">User Verification</p>
                  <p className="mt-2 text-xs font-bold leading-5 text-emerald-300">
                    Admin Approval Required for Login & Games
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/15 bg-rose-500/[0.04] p-4">
                  <Ban className="mb-3 h-5 w-5 text-rose-400" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Access Controls</p>
                  <p className="mt-2 text-xs font-bold leading-5 text-rose-300">
                    Block / Unblock Users Instantly
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`${panelClass} group flex items-center gap-4 p-5 text-left transition hover:-translate-y-1 hover:border-violet-500/30`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <Users className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Manage Players</p>
                  <p className="mt-1 text-xs text-slate-500">Verify accounts and control access</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-violet-400" />
              </button>

              <button
                onClick={() => setActiveTab('games')}
                className={`${panelClass} group flex items-center gap-4 p-5 text-left transition hover:-translate-y-1 hover:border-cyan-500/30`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Game Sessions</p>
                  <p className="mt-1 text-xs text-slate-500">Create, schedule and manage games</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`${panelClass} group flex items-center gap-4 p-5 text-left transition hover:-translate-y-1 hover:border-emerald-500/30`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Wallet className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Payment Verification</p>
                  <p className="mt-1 text-xs text-slate-500">Review pending UPI transactions</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
              </button>

              <button
                onClick={() => setActiveTab('boards')}
                className={`${panelClass} group flex items-center gap-4 p-5 text-left transition hover:-translate-y-1 hover:border-amber-500/30`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Board Catalog</p>
                  <p className="mt-1 text-xs text-slate-500">Manage your 2,000 master boards</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------
             USERS TAB
        ------------------------------------------------ */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <SectionHeading
              icon={Users}
              title="User Management"
              description="Verify players, manage account access and adjust wallet balances."
            />

            <div className={`${panelClass} space-y-4 p-4 sm:p-5`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <button onClick={handleSearchUsers} className={secondaryButton}>
                  <Search className="h-3.5 w-3.5" />
                  Search Users
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Users' },
                  { key: 'pending', label: `Pending (${analytics?.pendingVerification || 0})` },
                  { key: 'verified', label: 'Verified' },
                  { key: 'blocked', label: 'Blocked' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setUserFilter(filter.key)}
                    className={`rounded-xl px-4 py-2 text-[11px] font-bold transition ${
                      userFilter === filter.key
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                        : 'border border-white/[0.07] bg-white/[0.03] text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${panelClass} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <h3 className="text-xs font-bold text-white">Player Directory</h3>
                <span className="text-[10px] text-slate-500">{usersList.length} records</span>
              </div>

              {usersList.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description="Try another filter or search term."
                />
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {usersList.map((u) => (
                    <div
                      key={u._id}
                      className="flex flex-col justify-between gap-4 p-4 transition hover:bg-white/[0.015] sm:flex-row sm:items-center sm:p-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                          u.role === 'admin'
                            ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                            : 'border-violet-500/20 bg-violet-500/10 text-violet-400'
                        }`}>
                          {u.role === 'admin' ? (
                            <Shield className="h-5 w-5" />
                          ) : (
                            <UserRound className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-white">{u.name}</span>

                            {u.role === 'admin' && (
                              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-400">
                                ADMIN
                              </span>
                            )}

                            {u.isBlocked ? (
                              <StatusBadge status="rejected" />
                            ) : u.isVerified ? (
                              <StatusBadge status="approved" />
                            ) : (
                              <StatusBadge status="pending" />
                            )}
                          </div>

                          <p className="font-mono text-[11px] text-slate-400">
                            +91 {u.phone}
                          </p>

                          <p className="text-[10px] text-slate-500">
                            {u.stateJurisdiction || 'Kerala'} · Joined {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <div className="mr-2 min-w-[75px] rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-2">
                          <p className="text-[9px] font-bold uppercase text-slate-500">Balance</p>
                          <p className="mt-0.5 font-mono text-sm font-black text-emerald-400">
                            ₹{u.walletBalance || 0}
                          </p>
                        </div>

                        {u.role !== 'admin' && (
                          <>
                            {!u.isVerified && !u.isBlocked && (
                              <button
                                onClick={() => verifyUserMut.mutate(u._id)}
                                disabled={verifyUserMut.isPending}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Verify
                              </button>
                            )}

                            {!u.isBlocked ? (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Block user "${u.name}"?`)) {
                                    blockUserMut.mutate(u._id);
                                  }
                                }}
                                disabled={blockUserMut.isPending}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-2 text-[10px] font-bold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Block
                              </button>
                            ) : (
                              <button
                                onClick={() => unblockUserMut.mutate(u._id)}
                                disabled={unblockUserMut.isPending}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Unblock
                              </button>
                            )}

                            <button
                              onClick={() => setBalanceModalUser(u)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-slate-300 transition hover:border-violet-500/30 hover:text-violet-300"
                            >
                              <Wallet className="h-3.5 w-3.5" />
                              Adjust ₹
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------
             GAMES TAB
        ------------------------------------------------ */}
        {activeTab === 'games' && (
          <div className="space-y-5">
            <SectionHeading
              icon={Gamepad2}
              title="Game Sessions"
              description="Create sessions, control the live draw and manage prize patterns."
              action={
                <button onClick={() => setCreateGameOpen(true)} className={primaryButton}>
                  <Plus className="h-4 w-4" />
                  Create New Game
                </button>
              }
            />

            {games.length === 0 ? (
              <div className={panelClass}>
                <EmptyState
                  icon={Gamepad2}
                  title="No game sessions yet"
                  description="Create your first game session to get started."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {games.map((g) => (
                  <div
                    key={g._id}
                    className={`${panelClass} group relative overflow-hidden p-5 transition hover:border-violet-500/20`}
                  >
                    <div className={`absolute inset-y-0 left-0 w-1 ${
                      g.status === 'active'
                        ? 'bg-emerald-400'
                        : g.status === 'paused'
                          ? 'bg-amber-400'
                          : 'bg-violet-500'
                    }`} />

                    <div className="flex flex-col justify-between gap-5 pl-2 lg:flex-row lg:items-center">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 font-mono text-[10px] font-black text-violet-300">
                            {g.gameCode}
                          </span>
                          <StatusBadge status={g.status} />
                        </div>

                        <div>
                          <h3 className="text-base font-black text-white">{g.title}</h3>
                          <p className="mt-1 text-[10px] text-slate-500">
                            Scheduled: {g.scheduledStartTime ? new Date(g.scheduledStartTime).toLocaleString() : 'Not specified'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                            <p className="text-[9px] font-bold uppercase text-slate-500">Ticket</p>
                            <p className="mt-1 text-xs font-black text-white">₹{g.ticketPrice}</p>
                          </div>

                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                            <p className="text-[9px] font-bold uppercase text-slate-500">Balls Drawn</p>
                            <p className="mt-1 text-xs font-black text-white">{g.drawnNumbers?.length || 0} / 119</p>
                          </div>

                          <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.04] px-3 py-2">
                            <p className="text-[9px] font-bold uppercase text-slate-500">Latest Ball</p>
                            <p className="mt-1 text-xs font-black text-amber-400">{g.currentNumber || 'None'}</p>
                          </div>

                          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-2">
                            <p className="text-[9px] font-bold uppercase text-slate-500">Booked Boards</p>
                            <p className="mt-1 text-xs font-black text-emerald-400">{g.totalBoardsBooked || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:max-w-[430px] lg:justify-end">
                        {g.status === 'scheduled' && (
                          <button
                            onClick={() => startGameMut.mutate(g._id)}
                            disabled={startGameMut.isPending}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Start Game
                          </button>
                        )}

                        {g.status === 'active' && (
                          <>
                            <button
                              onClick={() => spinBallMut.mutate(g._id)}
                              disabled={spinBallMut.isPending}
                              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                            >
                              <RotateCw className="h-3.5 w-3.5" />
                              Spin Ball
                            </button>

                            <button
                              onClick={() => pauseGameMut.mutate(g._id)}
                              disabled={pauseGameMut.isPending}
                              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                            >
                              <Pause className="h-3.5 w-3.5" />
                              Pause
                            </button>
                          </>
                        )}

                        {g.status === 'paused' && (
                          <button
                            onClick={() => startGameMut.mutate(g._id)}
                            disabled={startGameMut.isPending}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Resume
                          </button>
                        )}

                        {g.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => openEditModal(g)}
                              className={secondaryButton}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm('End this game session?')) {
                                  endGameMut.mutate(g._id);
                                }
                              }}
                              disabled={endGameMut.isPending}
                              className="rounded-xl bg-rose-500/10 px-3 py-2.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                            >
                              End Game
                            </button>
                          </>
                        )}

                        <a
                          href={`/game/${g._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.05] px-3 py-2.5 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500/10"
                        >
                          View Arena
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------
             PAYMENTS TAB
        ------------------------------------------------ */}
        {activeTab === 'payments' && (
          <div className="space-y-5">
            <SectionHeading
              icon={CreditCard}
              title="Payment Verification"
              description="Review UPI transactions and approve or reject pending payments."
            />

            <div className={`${panelClass} flex flex-wrap gap-2 p-4`}>
              {['pending', 'approved', 'rejected', 'all'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPaymentFilter(filter)}
                  className={`rounded-xl px-4 py-2 text-[11px] font-bold capitalize transition ${
                    paymentFilter === filter
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : 'border border-white/[0.07] bg-white/[0.03] text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className={`${panelClass} overflow-hidden`}>
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h3 className="text-xs font-bold text-white">UPI Transaction Queue</h3>
              </div>

              {payments.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No payment records"
                  description="There are no payment records for this filter."
                />
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {payments.map((p) => (
                    <div
                      key={p._id}
                      className="flex flex-col justify-between gap-4 p-4 transition hover:bg-white/[0.015] sm:flex-row sm:items-center sm:p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-400">
                          <CircleDollarSign className="h-5 w-5" />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-black text-emerald-400">₹{p.amount}</span>
                            <span className="text-xs font-semibold text-white">{p.userName}</span>
                            <span className="font-mono text-[10px] text-slate-500">+91 {p.userPhone}</span>
                          </div>

                          <p className="font-mono text-xs text-cyan-300">
                            UTR / Ref: {p.utrNumber}
                          </p>

                          <p className="text-[10px] text-slate-500">
                            Submitted: {new Date(p.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => {
                                setReviewModalPayment(p);
                                setAdminNotes('Verified bank UTR credit');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>

                            <button
                              onClick={() => {
                                setReviewModalPayment(p);
                                setAdminNotes('UTR not found');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <StatusBadge status={p.status} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------
             BOARDS TAB
        ------------------------------------------------ */}
        {activeTab === 'boards' && (
          <div className="space-y-5">
            <SectionHeading
              icon={Trophy}
              title="Master Board Catalog"
              description="Manage the collection of 2,000 unique 4×4 boards."
            />

            <div className={`${panelClass} relative overflow-hidden p-6 sm:p-8`}>
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/[0.08] blur-[70px]" />

              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                    <Trophy className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-black text-white">
                    2,000 Master 4×4 Boards
                  </h3>

                  <p className="mt-2 max-w-lg text-xs leading-6 text-slate-400">
                    Every board consists of 16 distinct random numbers between 1 and 119.
                    The board catalog is used for player board allocation.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:min-w-[190px]">
                  <button
                    disabled={generateBoardsMut.isPending}
                    onClick={() => {
                      if (window.confirm('Regenerate all 2,000 boards?')) {
                        generateBoardsMut.mutate(true);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${generateBoardsMut.isPending ? 'animate-spin' : ''}`} />
                    {generateBoardsMut.isPending ? 'Regenerating...' : 'Regenerate Boards'}
                  </button>

                  <p className="text-center text-[10px] text-slate-500">
                    This action replaces the board catalog.
                  </p>
                </div>
              </div>

              <div className="relative mt-7 grid grid-cols-1 gap-3 border-t border-white/[0.07] pt-6 sm:grid-cols-3">
                <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.05] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Boards</p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {boardStatsData?.totalCount || 2000}
                    <span className="ml-1 text-xs font-semibold text-slate-500">/ 2000</span>
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.05] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Board Format</p>
                  <p className="mt-2 text-2xl font-black text-cyan-400">4 × 4</p>
                </div>

                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Catalog Status</p>
                  <p className="mt-2 flex items-center gap-2 text-lg font-black text-emerald-400">
                    <CheckCircle className="h-5 w-5" />
                    Ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------
             AUDIT TAB
        ------------------------------------------------ */}
        {activeTab === 'audit' && (
          <div className="space-y-5">
            <SectionHeading
              icon={History}
              title="Audit Logs"
              description="Review administrative actions and platform activity records."
            />

            <div className={`${panelClass} overflow-hidden`}>
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h3 className="text-xs font-bold text-white">Compliance Activity History</h3>
              </div>

              {auditLogs.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No audit logs yet"
                  description="Administrative activity will appear here."
                />
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {auditLogs.map((log) => (
                    <div
                      key={log._id}
                      className="flex flex-col justify-between gap-3 p-4 transition hover:bg-white/[0.015] sm:flex-row sm:items-start"
                    >
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/[0.06] text-amber-400">
                          <FileText className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-amber-500/10 px-2 py-1 font-mono text-[10px] font-black text-amber-400">
                              {log.action}
                            </span>
                            <span className="text-xs font-semibold text-white">
                              {log.actorName || 'System'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ({log.actorRole || 'system'})
                            </span>
                          </div>

                          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-[#090d1b] p-3 font-mono text-[10px] leading-5 text-slate-400">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <span className="shrink-0 text-[10px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------
           CREATE GAME MODAL
      ------------------------------------------------ */}
      {createGameOpen && (
        <Modal
          title="Create Game Session"
          description="Configure a new game and its winning prize patterns."
          onClose={() => setCreateGameOpen(false)}
        >
          <form onSubmit={handleCreateGame} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4-Line Super Varayal"
                  value={newGameTitle}
                  onChange={(e) => setNewGameTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Ticket Price (₹)</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={newGamePrice}
                  onChange={(e) => setNewGamePrice(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newGameStartTime}
                  onChange={(e) => setNewGameStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="border-t border-white/[0.07] pt-5">
              <RuleEditor
                rules={configuredRules}
                setRules={setConfiguredRules}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCreateGameOpen(false)}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createGameMut.isPending}
                className={primaryButton}
              >
                <Plus className="h-4 w-4" />
                {createGameMut.isPending ? 'Creating...' : 'Create Game Session'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------
           EDIT GAME MODAL
      ------------------------------------------------ */}
      {editGameModalOpen && editingGame && (
        <Modal
          title={`Edit Game: ${editingGame.gameCode}`}
          description="Update session details and prize patterns."
          onClose={() => setEditGameModalOpen(false)}
        >
          <form onSubmit={handleUpdateGame} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Session Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Ticket Price (₹)</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Start Time</label>
                <input
                  type="datetime-local"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="border-t border-white/[0.07] pt-5">
              <RuleEditor
                rules={editRules}
                setRules={setEditRules}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditGameModalOpen(false)}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updateGameMut.isPending}
                className={primaryButton}
              >
                <Check className="h-4 w-4" />
                {updateGameMut.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------
           VERIFY PAYMENT MODAL
      ------------------------------------------------ */}
      {reviewModalPayment && (
        <Modal
          title="Review Payment"
          description="Verify the submitted transaction before approving."
          onClose={() => setReviewModalPayment(null)}
          maxWidth="max-w-md"
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Payment Amount
                </span>
                <CreditCard className="h-4 w-4 text-emerald-400" />
              </div>

              <p className="text-3xl font-black text-emerald-400">
                ₹{reviewModalPayment.amount}
              </p>

              <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
                <p className="text-xs text-slate-400">
                  User: <strong className="text-white">{reviewModalPayment.userName}</strong>
                </p>
                <p className="text-xs text-slate-400">
                  UTR: <strong className="break-all font-mono text-cyan-300">{reviewModalPayment.utrNumber}</strong>
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Admin Notes</label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={inputClass}
                placeholder="Enter verification notes..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVerifyPayment('approve')}
                disabled={verifyPaymentMut.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Approve & Credit
              </button>

              <button
                onClick={() => handleVerifyPayment('reject')}
                disabled={verifyPaymentMut.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-xs font-black text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </div>

            <button
              onClick={() => setReviewModalPayment(null)}
              className="w-full py-2 text-xs font-semibold text-slate-500 transition hover:text-white"
            >
              Cancel Review
            </button>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------
           ADJUST BALANCE MODAL
      ------------------------------------------------ */}
      {balanceModalUser && (
        <Modal
          title="Adjust Player Wallet"
          description={`Manage wallet balance for ${balanceModalUser.name}.`}
          onClose={() => setBalanceModalUser(null)}
          maxWidth="max-w-md"
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Current Wallet Balance
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-400">
                ₹{balanceModalUser.walletBalance || 0}
              </p>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <label className={labelClass}>Adjustment Amount (+/-)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 100 or -50"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1.5 text-[10px] text-slate-500">
                  Use a positive amount to credit or a negative amount to debit.
                </p>
              </div>

              <div>
                <label className={labelClass}>Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prize / Correction"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-2 border-t border-white/[0.07] pt-4">
                <button
                  type="submit"
                  disabled={adjustBalanceMut.isPending}
                  className={`${primaryButton} flex-1`}
                >
                  <Check className="h-4 w-4" />
                  {adjustBalanceMut.isPending ? 'Processing...' : 'Confirm Adjustment'}
                </button>

                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className={secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
