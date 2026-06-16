import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-900 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-light dark:bg-gray-800 flex items-center justify-center mb-5">
        <Compass className="w-8 h-8 text-primary" />
      </div>
      <p className="text-5xl font-bold text-slate-900 dark:text-white">404</p>
      <h1 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mt-2">Page not found</h1>
      <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-sm">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <div className="flex gap-3 mt-6">
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Go to dashboard
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
