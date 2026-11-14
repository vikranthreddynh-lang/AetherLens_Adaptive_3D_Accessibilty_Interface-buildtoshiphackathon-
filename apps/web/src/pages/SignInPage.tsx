import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LogIn, AlertTriangle, Activity } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await signIn(email, password);
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-sense-500/10 text-sense-400 flex items-center justify-center mx-auto mb-2 border border-sense-500/20">
          <Activity className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Sign in to SenseWeave</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Access your saved session recaps and synced sensory preferences.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-sense-400 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-sense-400 hover:text-sense-300"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-sense-400 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-sense-600 hover:bg-sense-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-sense-600/20"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
        </button>
      </form>

      <p className="text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/auth/sign-up" className="text-sense-400 hover:text-sense-300 font-semibold">
          Create account
        </Link>
      </p>
    </div>
  );
};
