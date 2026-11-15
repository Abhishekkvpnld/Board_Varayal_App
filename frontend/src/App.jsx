import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LegalComplianceBanner from './components/LegalComplianceBanner';
import LandingPage from './pages/LandingPage';
import GameLobbyPage from './pages/GameLobbyPage';
import LiveGameArenaPage from './pages/LiveGameArenaPage';
import PlayerDashboardPage from './pages/PlayerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HowToPlayPage from './pages/HowToPlayPage';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400">
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/lobby" replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-dark-900 text-slate-100">
      {/* Top Legal & Compliance Disclaimer Banner */}
      <LegalComplianceBanner />

      {/* Main Navigation Header */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lobby" element={<GameLobbyPage />} />
          <Route path="/game/:id" element={<LiveGameArenaPage />} />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PlayerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 text-xs text-slate-500 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-300">Board Varayal (ബോർഡ് വരയൽ)</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Traditional Kerala 4×4 Board Game & Live 1–119 Realtime Spinner Platform.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 sm:text-right">
            <p>18+ Play Responsibly. Cryptographic RNG Verified.</p>
            <p>Restricted in AP, Assam, Nagaland, Odisha, Sikkim & Telangana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

