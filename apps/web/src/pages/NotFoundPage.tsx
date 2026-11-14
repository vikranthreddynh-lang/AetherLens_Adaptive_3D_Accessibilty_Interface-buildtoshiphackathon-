import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
        <AlertCircle className="w-7 h-7" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400">
        The destination you are looking for does not exist or has been moved.
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-sense-600 hover:bg-sense-500 text-white font-bold text-sm inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to SenseWeave Home</span>
        </Link>
      </div>
    </div>
  );
};
