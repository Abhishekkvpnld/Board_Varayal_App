import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, AlertCircle, Shield, Gamepad2, CheckCircle2, Clock, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setIsPending(false);
      setIsBlocked(false);
      const res = await login(phone, password);
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/lobby');
      }
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      if (msg.includes('pending') || msg.includes('verification')) {
        setIsPending(true);
      } else if (msg.includes('blocked')) {
        setIsBlocked(true);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (p, pwd) => {
    setPhone(p);
    setPassword(pwd);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-dark-850 border border-dark-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 bg-brand-500/15 text-brand-400 rounded-2xl border border-brand-500/20 mb-2">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your Board Varayal account</p>
        </div>

        {isPending && (
          <div className="mb-6 p-4 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Clock className="w-4 h-4" /> Account Pending Verification
            </div>
            <p className="text-amber-300/80 text-[11px]">
              Your account is waiting for administrator approval. You will be able to login once an admin verifies your registration.
            </p>
          </div>
        )}

        {isBlocked && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <Ban className="w-4 h-4" /> Account Blocked
            </div>
            <p className="text-rose-300/80 text-[11px]">
              Your account has been blocked by the administrator. Please contact support for assistance.
            </p>
          </div>
        )}

        {error && !isPending && !isBlocked && (
          <div className="mb-6 p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">10-Digit Mobile Number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">+91</span>
              <input type="tel" required maxLength="10" placeholder="9876543210" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input type="password" required placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2">
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-dark-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">Instant Demo Sign-In</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onClick={() => fillDemo('9895012345', 'PlayerPassword@2026')}
              className="p-2.5 bg-dark-900 border border-dark-700 hover:border-brand-500 rounded-xl text-left transition group">
              <div className="font-bold text-white group-hover:text-brand-300">Demo Player</div>
              <div className="text-[10px] text-slate-400">9895012345</div>
            </button>
            <button type="button" onClick={() => fillDemo('9876543210', 'AdminPassword@2026')}
              className="p-2.5 bg-dark-900 border border-dark-700 hover:border-amber-500 rounded-xl text-left transition group">
              <div className="font-bold text-amber-400 group-hover:text-amber-300">Master Admin</div>
              <div className="text-[10px] text-slate-400">9876543210</div>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-bold">Create Free Account</Link>
        </p>
      </div>
    </div>
  );
}
