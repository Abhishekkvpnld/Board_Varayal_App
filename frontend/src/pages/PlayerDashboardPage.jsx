import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Trophy,
  History,
  Gamepad2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

export default function PlayerDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      await refreshUser();
      const res = await api.get('/payments/my');
      setPayments(res.payments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner / User KPI Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="bg-dark-850 border border-dark-700/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
              Verified Player Profile
            </span>
            <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono">+91 {user?.phone}</p>
          </div>
          <div className="pt-3 border-t border-dark-800 flex items-center justify-between text-xs text-slate-400">
            <span>Jurisdiction: <strong className="text-white">{user?.stateJurisdiction || 'Kerala'}</strong></span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 18+ Verified
            </span>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-dark-850 via-dark-850 to-dark-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" /> Available Wallet Balance
            </span>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              ₹{user?.walletBalance || 0}
            </div>
            <p className="text-xs text-slate-400">Ready for instant board allocation</p>
          </div>
          <button
            onClick={() => setPaymentOpen(true)}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-dark-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
          >
            <PlusCircle className="w-4 h-4" /> Deposit via UPI / QR
          </button>
        </div>

        {/* Quick Arena Entrance */}
        <div className="bg-dark-850 border border-dark-700/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Live Varayal Action
            </span>
            <h3 className="text-base font-bold text-white">Join Live Games Lobby</h3>
            <p className="text-xs text-slate-400">Select cards & track live number spins</p>
          </div>
          <Link
            to="/lobby"
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-brand-500/20 text-center"
          >
            <Gamepad2 className="w-4 h-4" /> Enter Game Lobby
          </Link>
        </div>
      </div>

      {/* Payment Deposit & Verification History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" />
            <span>Deposit & Payment Verification History</span>
          </h2>
          <button
            onClick={fetchUserData}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            Refresh
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl p-8 text-center text-xs text-slate-500">
            No deposits yet. Click "Deposit via UPI" above to add balance.
          </div>
        ) : (
          <div className="bg-dark-850 border border-dark-700/80 rounded-2xl overflow-hidden divide-y divide-dark-800 text-xs">
            {payments.map((p) => (
              <div key={p._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">₹{p.amount}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="font-mono text-slate-400 text-[11px]">UTR / Banking Ref: {p.utrNumber}</p>
                  <p className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleString()}</p>
                </div>

                <div className="text-right text-xs">
                  {p.status === 'approved' ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Credited to Wallet
                    </span>
                  ) : p.status === 'pending' ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4 animate-pulse" /> Verifying against Bank Logs
                    </span>
                  ) : (
                    <span className="text-rose-400">{p.adminNotes || 'Declined'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <PaymentModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}

