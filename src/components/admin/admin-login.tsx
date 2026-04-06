'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError('Invalid credentials');
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white dark:bg-[#050505]">
      <div className="w-full max-w-[320px]">
        <p className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-8 font-sans">
          Admin
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-[13px] focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-sans">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-[13px] focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {error && (
            <p className="text-[12px] text-neutral-500 dark:text-neutral-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[11px] font-sans font-medium uppercase tracking-wider hover:opacity-80 transition-all rounded-[2px] disabled:opacity-25 active:scale-[0.99] mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
