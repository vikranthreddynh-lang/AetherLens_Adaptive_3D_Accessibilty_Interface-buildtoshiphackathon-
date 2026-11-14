import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { KeyRound, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await resetPasswordForEmail(email);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Reset Password</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter your email to receive a password recovery link.
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

      {sent ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-white">Check Your Email</h2>
          <p className="text-xs text-slate-400">
            If an account exists for {email}, a password reset link has been dispatched.
          </p>
          <Link
            to="/auth/sign-in"
            className="inline-flex items-center space-x-1.5 text-xs text-sense-400 hover:text-sense-300 font-semibold pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1">
              Account Email Address
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-sense-600 hover:bg-sense-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all"
          >
            <KeyRound className="w-4 h-4" aria-hidden="true" />
            <span>{loading ? 'Sending link...' : 'Send Recovery Link'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
