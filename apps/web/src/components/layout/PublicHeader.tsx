import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Radio, Eye, Shield, Sliders, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export const PublicHeader: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { to: '/demo', label: 'Interactive Demo', icon: Eye },
    { to: '/how-it-works', label: 'How It Works', icon: Radio },
    { to: '/accessibility', label: 'Accessibility', icon: Sliders },
    { to: '/privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-3 text-white font-bold text-xl tracking-tight focus:ring-2 focus:ring-sense-400 rounded-md p-1"
          aria-label="SenseWeave Home"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sense-600 to-sense-400 flex items-center justify-center text-white shadow-lg shadow-sense-500/25">
            <Activity className="w-5 h-5" aria-hidden="true" />
          </div>
          <span>SenseWeave</span>
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-sense-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link
            to="/session/new"
            className="px-3.5 py-2 rounded-lg bg-sense-600 hover:bg-sense-500 text-white font-semibold text-sm transition-all shadow-md shadow-sense-600/20 flex items-center space-x-2"
          >
            <Radio className="w-4 h-4 animate-pulse" aria-hidden="true" />
            <span>Start Live Session</span>
          </Link>

          {user ? (
            <Link
              to="/dashboard"
              className="p-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition-colors"
              aria-label="User Dashboard"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              to="/auth/sign-in"
              className="px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-medium text-sm transition-colors flex items-center space-x-1.5"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
