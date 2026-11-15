import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, ArrowRight, AlertCircle, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Kerala',
  'Karnataka',
  'Tamil Nadu',
  'Maharashtra',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Punjab',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
  'Andhra Pradesh',
  'Assam',
  'Nagaland',
  'Odisha',
  'Sikkim',
  'Telangana'
];

const RESTRICTED = ['Andhra Pradesh', 'Assam', 'Nagaland', 'Odisha', 'Sikkim', 'Telangana'];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [stateJurisdiction, setStateJurisdiction] = useState('Kerala');
  const [isAdult, setIsAdult] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [adminSecret, setAdminSecret] = useState('');
  const [showAdminField, setShowAdminField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const isRestrictedSelected = RESTRICTED.includes(stateJurisdiction);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRestrictedSelected) {
      setError(`Notice: Gameplay is restricted in ${stateJurisdiction} by state statutes. Registration cannot proceed.`);
      return;
    }

    if (!isAdult) {
      setError('You must confirm you are at least 18 years of age.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await register({
        name,
        phone,
        password,
        stateJurisdiction,
        isAdult,
        termsAccepted,
        adminSecret: adminSecret.trim() || undefined
      });

      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/lobby');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-dark-850 border border-dark-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-brand-500/15 text-brand-400 rounded-2xl border border-brand-500/20 mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400">Join the live Board Varayal community</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Rahul Varma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">10-Digit Mobile Number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400">+91</span>
              <input
                type="tel"
                required
                maxLength="10"
                placeholder="9895012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-12 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength="6"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* State Jurisdiction Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>State / Residence Jurisdiction</span>
              <span className="text-[10px] text-slate-500">Regulatory Check</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={stateJurisdiction}
                onChange={(e) => setStateJurisdiction(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 appearance-none"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-dark-900 text-white">
                    {s} {RESTRICTED.includes(s) ? '(Restricted)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isRestrictedSelected && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-800/40 text-amber-300 rounded-xl text-[11px] leading-tight">
              ⚠️ Warning: Under state regulations in {stateJurisdiction}, paid online games are legally barred. You will not be permitted to register.
            </div>
          )}

          {/* Compliance Checkboxes */}
          <div className="space-y-2 pt-1 text-xs text-slate-300">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
                className="mt-0.5 rounded bg-dark-900 border-dark-700 text-brand-500 focus:ring-0"
              />
              <span>I confirm that I am <strong>18 years of age or older</strong>.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded bg-dark-900 border-dark-700 text-brand-500 focus:ring-0"
              />
              <span className="text-[11px] text-slate-400">
                I agree to the Fair Play Terms, RNG Verification Policy, and Community Guidelines.
              </span>
            </label>
          </div>

          {/* Optional Admin secret toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdminField(!showAdminField)}
              className="text-[11px] text-slate-500 hover:text-slate-400 underline"
            >
              {showAdminField ? 'Hide Admin Code' : 'Have an Admin Key?'}
            </button>
            {showAdminField && (
              <div className="mt-1.5">
                <input
                  type="text"
                  placeholder="Enter ADMIN_SECRET_KEY"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isRestrictedSelected}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 mt-3"
          >
            {loading ? 'Registering...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}

