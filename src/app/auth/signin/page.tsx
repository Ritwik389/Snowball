'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, Loader2, ArrowRight, Trophy, ShieldCheck, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/frontend/context/ThemeContext';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOverride, setSuccessOverride] = useState<string | null>(null);
  const success = successOverride ?? searchParams.get('success') ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessOverride('');

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password.');
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10">
      <div className="fixed inset-0 synth-grid pointer-events-none opacity-20 z-0"></div>

      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-primary hover:bg-primary/80 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-white" />
        ) : (
          <Sun className="w-5 h-5 text-white" />
        )}
      </button>

      <Link
        href="/"
        className={`fixed left-6 top-6 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-black uppercase tracking-[0.22em] backdrop-blur-md transition ${
          theme === 'light'
            ? 'border-black/10 bg-white/75 text-black hover:bg-white'
            : 'border-white/10 bg-base-100/40 text-white hover:bg-base-100/60'
        }`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section className={`hidden lg:block ${theme === 'light' ? 'text-black' : 'text-white'}`}>
          <span className={`inline-flex rounded-full border ${theme === 'light' ? 'border-black/10 bg-black/5 text-black/60' : 'border-white/10 bg-white/10 text-white/70'} px-4 py-2 text-xs font-black uppercase tracking-[0.3em]`}>
            Welcome Back, Operator
          </span>
          <h1 className={`mt-6 max-w-3xl text-6xl font-black uppercase leading-[0.92] tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Lock in.
            <span className="block text-blue-600 drop-shadow-[0_0_18px_rgba(59,130,246,0.45)] dark:text-sky-400 dark:drop-shadow-[0_0_22px_rgba(56,189,248,0.55)]">
              Stack wins.
            </span>
            <span className={`block ${theme === 'light' ? 'text-black/50' : 'text-white/70'}`}>Build momentum.</span>
          </h1>
          <p className={`mt-6 max-w-xl text-lg font-medium leading-relaxed ${theme === 'light' ? 'text-black/70' : 'text-white/72'}`}>
            Your dashboard is built like a game board on purpose. Sign in, pick the next mission, and keep the streak moving.
          </p>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4">
            <div className={`score-chip p-5 ${theme === 'light' ? 'bg-black/5 border border-black/10' : 'bg-white/5 border border-white/10'}`}>
              <Trophy className="mb-3 h-5 w-5 text-warning" />
              <p className={`text-xs font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}>Momentum Rank</p>
              <p className={`mt-2 text-2xl font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>Earn points fast</p>
            </div>
            <div className={`score-chip p-5 ${theme === 'light' ? 'bg-black/5 border border-black/10' : 'bg-white/5 border border-white/10'}`}>
              <ShieldCheck className="mb-3 h-5 w-5 text-secondary" />
              <p className={`text-xs font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}>Mission Control</p>
              <p className={`mt-2 text-2xl font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>One task at a time</p>
            </div>
          </div>
        </section>

        <div className={`game-shell rounded-[2.25rem] p-8 sm:p-10 ${theme === 'light' ? 'bg-white/80 text-black border border-black/10' : 'bg-black/20 text-white border border-white/10'}`}>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/35">
              <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <p className={`text-xs font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>Snowball Access</p>
            <h2 className={`mt-3 text-4xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>Enter The Arena</h2>
            <p className={`font-medium text-center mt-2 ${theme === 'light' ? 'text-black/70' : 'text-white/70'}`}>Break down your goals, build your legacy.</p>
            <p className={`mt-3 max-w-sm text-sm font-medium leading-relaxed ${theme === 'light' ? 'text-black/65' : 'text-white/65'}`}>
              Use your account to jump back into your mission queue and keep the streak alive.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label pb-2">
                <span className={`font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-xs ${theme === 'light' ? 'text-black/80' : 'text-white/80'}`}>
                  <Mail className="w-4 h-4" /> Email Address
                </span>
              </label>
              <input 
                type="email" 
                placeholder="ritwik@example.com" 
                className={`input input-bordered h-14 rounded-2xl ${theme === 'light' ? 'border-black/10 bg-black/5 text-black placeholder:text-black/30 focus:input-primary' : 'border-white/10 bg-white/6 text-white placeholder:text-white/30 focus:input-primary'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-control">
              <label className="label pb-2">
                <span className={`font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-xs ${theme === 'light' ? 'text-black/80' : 'text-white/80'}`}>
                  <Lock className="w-4 h-4" /> Password
                </span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={`input input-bordered h-14 rounded-2xl ${theme === 'light' ? 'border-black/10 bg-black/5 text-black placeholder:text-black/30 focus:input-primary' : 'border-white/10 bg-white/6 text-white placeholder:text-white/30 focus:input-primary'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            {error && (
              <div className="alert alert-error py-2 text-sm font-medium">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success py-2 text-sm font-medium">
                <span>{success}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block mt-2 h-16 rounded-2xl text-base font-black uppercase tracking-[0.25em] text-white shadow-2xl shadow-primary/25"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Launch Dashboard'}
            </button>
          </form>

          <div className={`mt-8 text-center text-sm font-medium ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>
            New here? 
            <Link href="/auth/signup" className="text-primary ml-2 inline-flex items-center font-black uppercase tracking-[0.18em] hover:underline">
              Create Account <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-base-200">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </main>
    }>
      <SignInForm />
    </Suspense>
  );
}
