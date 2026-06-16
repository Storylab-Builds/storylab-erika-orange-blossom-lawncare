import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Leaf, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

export default function ResetPassword() {
  // useSearchParams reads the query portion of the hash under HashRouter.
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      // 400 = invalid/expired/used token; surface the server message.
      setError(err instanceof ApiError ? err.message : 'Could not reset your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">OBS Lawncare</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-slate-200 dark:border-gray-700 p-6">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Reset password</h1>

          {done ? (
            <div>
              <div className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                Your password has been reset.
              </div>
              <Link
                to="/login"
                className="mt-3 block w-full text-center py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
              >
                Continue to sign in
              </Link>
            </div>
          ) : !token ? (
            <div>
              <div role="alert" className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                This reset link is invalid or incomplete. Please request a new one.
              </div>
              <Link
                to="/forgot-password"
                className="mt-3 block w-full text-center py-2.5 rounded-xl border border-primary text-primary font-medium text-sm hover:bg-primary/10 transition-colors"
              >
                Request a new link
              </Link>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-4 text-center">
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Back to sign in
                </Link>
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Choose a new password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">At least 8 characters.</p>
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {error && (
                  <div role="alert" className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Resetting…' : 'Reset password'}
                </button>
              </form>

              <p className="text-sm text-slate-500 dark:text-gray-400 mt-4 text-center">
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
