import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Gamepad2, LogOut, User, Menu, X, Sparkles, Trophy, LayoutDashboard, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-900/90 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">Board Varayal</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-brand-500/20 text-brand-400 rounded border border-brand-500/30">LIVE</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none">ബോർഡ് വരയൽ • 4×4 Realtime</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {!isAdmin && (
            <>
              <Link
                to="/lobby"
                className={`hover:text-brand-400 transition ${location.pathname === '/lobby' ? 'text-brand-400 font-semibold' : 'text-slate-300'}`}
              >
                Game Lobby
              </Link>
              <Link
                to="/how-to-play"
                className={`hover:text-brand-400 transition ${location.pathname === '/how-to-play' ? 'text-brand-400 font-semibold' : 'text-slate-300'}`}
              >
                Rules & Patterns
              </Link>
            </>
          )}
          {isAuthenticated && !isAdmin && (
            <Link
              to="/dashboard"
              className={`hover:text-brand-400 transition ${location.pathname === '/dashboard' ? 'text-brand-400 font-semibold' : 'text-slate-300'}`}
            >
              My Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Admin Console
            </Link>
          )}
        </nav>

        {/* User Status Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {isAdmin ? (
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase">
                  Admin Controller
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Player
                </span>
              )}

              <div className="hidden sm:flex items-center gap-2 border-l border-dark-800 pl-3">
                <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-dark-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white transition">
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 transition"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-slate-400 hover:text-white rounded-lg hover:bg-dark-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dark-800 bg-dark-900 px-4 py-3 space-y-2 text-sm font-medium">
          {!isAdmin && (
            <>
              <Link to="/lobby" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-brand-400">
                Game Lobby
              </Link>
              <Link to="/how-to-play" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-brand-400">
                Rules & Patterns
              </Link>
            </>
          )}
          {isAuthenticated && !isAdmin && (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-brand-400">
              My Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-amber-400 font-bold">
              Admin Console
            </Link>
          )}
          {isAuthenticated && (
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="w-full text-left py-2 text-rose-400 font-medium"
            >
              Log Out ({user?.name})
            </button>
          )}
        </div>
      )}
    </header>
  );
}
