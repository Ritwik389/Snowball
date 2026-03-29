'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, Loader2, ArrowRight, Trophy, ShieldCheck } from 'lucide-react';
import VantaBackground from '@/frontend/components/VantaBackground';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      <VantaBackground />
      <div className="fixed inset-0 synth-grid pointer-events-none opacity-20 z-0"></div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section className="hidden lg:block text-white">
          <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-white/70">
            Welcome Back, Operator
          </span>
          <h1 className="mt-6 max-w-3xl text-6xl font-black uppercase leading-[0.92] tracking-tight">
            Lock in.
            <span className="block neon-text-primary">Stack wins.</span>
            <span className="block text-white/70">Build momentum.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/72">
            Your dashboard is built like a game board on purpose. Sign in, pick the next mission, and keep the streak moving.
          </p>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4">
            <div className="score-chip p-5">
              <Trophy className="mb-3 h-5 w-5 text-warning" />
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/50">Momentum Rank</p>
              <p className="mt-2 text-2xl font-black text-white">Earn points fast</p>
            </div>
            <div className="score-chip p-5">
              <ShieldCheck className="mb-3 h-5 w-5 text-secondary" />
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/50">Mission Control</p>
              <p className="mt-2 text-2xl font-black text-white">One task at a time</p>
            </div>
          </div>
        </section>

        <div className="game-shell rounded-[2.25rem] p-8 text-white sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/35">
              <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/55">Snowball Access</p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight">Enter The Arena</h2>
            <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-white/65">
              Use your account to jump back into your mission queue and keep the streak alive.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label pb-2">
                <span className="font-bold flex items-center gap-2 text-white/80 uppercase tracking-[0.2em] text-xs">
                  <Mail className="w-4 h-4" /> Email Address
                </span>
              </label>
              <input 
                type="email" 
                placeholder="ritwik@example.com" 
                className="input input-bordered h-14 rounded-2xl border-white/10 bg-white/6 text-white placeholder:text-white/30 focus:input-primary" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-control">
              <label className="label pb-2">
                <span className="font-bold flex items-center gap-2 text-white/80 uppercase tracking-[0.2em] text-xs">
                  <Lock className="w-4 h-4" /> Password
                </span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered h-14 rounded-2xl border-white/10 bg-white/6 text-white placeholder:text-white/30 focus:input-primary" 
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

          <div className="mt-8 text-center text-sm font-medium text-white/55">
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
