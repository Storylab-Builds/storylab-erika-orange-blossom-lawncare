import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

type ForgotResponse = { ok: boolean; message: string; devToken?: string; devLink?: string };

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<ForgotResponse>('/auth/forgot-password', { email });
      setSent(true);
      // Build the reset link locally from the dev token so it routes correctly under HashRouter.
      if (res.devToken) setDevLink(`/reset-password?token=${encodeURIComponent(res.devToken)}`);
    } catch (err) {
      // The endpoint is designed to always 200, but guard anyway.
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
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
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Forgot password?</h1>
          {!sent && (
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          )}

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <div>
              <div className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                If that email is registered, a reset link is on its way.
              </div>
              {devLink && (
                <Link
                  to={devLink}
                  className="mt-3 block w-full text-center py-2.5 rounded-xl border border-primary text-primary font-medium text-sm hover:bg-primary/10 transition-colors"
                >
                  Dev: open reset link
                </Link>
              )}
            </div>
          )}

          <p className="text-sm text-slate-500 dark:text-gray-400 mt-4 text-center">
            Remembered it?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
