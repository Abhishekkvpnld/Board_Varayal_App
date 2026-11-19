
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Gamepad2,
  LogOut,
  Menu,
  X,
  Sparkles,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  UserRound,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Game Lobby', path: '/lobby', icon: Trophy },
    { label: 'Rules & Patterns', path: '/how-to-play', icon: BookOpen },
    ...(isAuthenticated && !isAdmin
      ? [{ label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard }]
      : []),
  ];

  const linkClass = (path) =>
    `group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
      isActive(path)
        ? 'bg-violet-500/15 text-violet-300'
        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#090b18]/90 shadow-lg shadow-black/10 backdrop-blur-xl">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400" />

      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* LOGO */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex shrink-0 items-center gap-3"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 opacity-40 blur-md transition-opacity group-hover:opacity-80" />

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#211746] to-[#111b32]">
              <Gamepad2 className="h-6 w-6 text-violet-300 transition-transform duration-300 group-hover:rotate-[-10deg] group-hover:scale-110" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white sm:text-lg">
                Board <span className="text-violet-400">Varayal</span>
              </span>

              <span className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>

            <p className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-500">
              ബോർഡ് വരയൽ • 4×4 Arena
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-1 md:flex">
          {!isAdmin &&
            navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={linkClass(item.path)}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive(item.path)
                        ? 'text-violet-300'
                        : 'text-slate-500 group-hover:text-cyan-400'
                    }`}
                  />

                  {item.label}

                  {isActive(item.path) && (
                    <span className="absolute inset-x-4 -bottom-[1px] h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                  )}
                </Link>
              );
            })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                isActive('/admin')
                  ? 'border-amber-400/40 bg-amber-500/15 text-amber-300'
                  : 'border-amber-500/20 bg-amber-500/[0.06] text-amber-400 hover:border-amber-400/50 hover:bg-amber-500/15'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin Console
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          )}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {isAuthenticated ? (
            <>
              {/* User status */}
              <div className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 sm:flex">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isAdmin
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <UserRound className="h-4 w-4" />
                  )}
                </div>

                <div className="max-w-[115px]">
                  <p className="truncate text-xs font-bold text-white">
                    {user?.name || 'Player'}
                  </p>
                  <p
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isAdmin ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {isAdmin ? 'Administrator' : 'Verified Player'}
                  </p>
                </div>
              </div>

              {/* Desktop logout */}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/[0.06] text-slate-400 transition-all hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400 sm:flex"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/40"
              >
                Join Arena
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`grid transition-all duration-300 ease-in-out md:hidden ${
          mobileMenuOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-white/[0.07] bg-[#0d1020] px-4 py-4">

            {/* Mobile user info */}
            {isAuthenticated && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-300">
                  {isAdmin ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {user?.name || 'Player'}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500">
                    {isAdmin ? 'Administrator Account' : 'Verified Player'}
                  </p>
                </div>

                <span
                  className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase ${
                    isAdmin
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Player'}
                </span>
              </div>
            )}

            {/* Navigation links */}
            {!isAdmin &&
              navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive(item.path)
                        ? 'border border-violet-500/20 bg-violet-500/10 text-violet-300'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                );
              })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-400"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Console
              </Link>
            )}

            {/* Mobile authentication actions */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm font-bold text-rose-400 transition hover:bg-rose-500/15"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-white/10 py-3 text-center text-xs font-bold text-slate-300"
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-center text-xs font-bold text-white"
                >
                  Join Arena
                </Link>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-3 text-[10px] font-medium text-slate-600">
              <Sparkles className="h-3 w-3 text-violet-400" />
              BOARD VARAYAL • GAME ARENA
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
