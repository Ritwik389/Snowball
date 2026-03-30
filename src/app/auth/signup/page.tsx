'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, User, Loader2, ArrowRight, Sun, Moon, Trophy, ShieldCheck } from 'lucide-react';
import VantaBackground from '@/frontend/components/VantaBackground';
import { useTheme } from '@/frontend/context/ThemeContext';
import axios from 'axios';

export default function SignUpPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/signup', { name, email, password });
      router.push('/auth/signin?success=Account created! Please sign in.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create account.');
      } else {
        setError('Failed to create account.');
      }
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10">
      <VantaBackground />
      <div className="fixed inset-0 synth-grid pointer-events-none opacity-20 z-0"></div>

      {/* Theme Toggle Button */}
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

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section className={`hidden lg:block ${theme === 'light' ? 'text-black' : 'text-white'}`}>
          <span className={`inline-flex rounded-full border ${theme === 'light' ? 'border-black/10 bg-black/5 text-black/60' : 'border-white/10 bg-white/10 text-white/70'} px-4 py-2 text-xs font-black uppercase tracking-[0.3em]`}>
            Welcome Aboard, Operator
          </span>
          <h1 className={`mt-6 max-w-3xl text-6xl font-black uppercase leading-[0.92] tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Join the mission.
            <span className="block neon-text-primary">Break it down.</span>
            <span className={`block ${theme === 'light' ? 'text-black/50' : 'text-white/70'}`}>Build momentum.</span>
          </h1>
          <p className={`mt-6 max-w-xl text-lg font-medium leading-relaxed ${theme === 'light' ? 'text-black/70' : 'text-white/72'}`}>
            Your journey starts here. Create your account, set your first goal, and begin stacking wins that compound over time.
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
              <Zap className="w-8 h-8 text-primary-content fill-current" />
            </div>
            <p className={`text-xs font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>Snowball Access</p>
            <h2 className={`mt-3 text-4xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>Join The Arena</h2>
            <p className={`font-medium text-center mt-2 ${theme === 'light' ? 'text-black/70' : 'text-white/70'}`}>Break down your goals, build your legacy.</p>
            <p className={`mt-3 max-w-sm text-sm font-medium leading-relaxed ${theme === 'light' ? 'text-black/65' : 'text-white/65'}`}>
              Create your account and start your momentum-building journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className={`font-bold flex items-center gap-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                  <User className="w-4 h-4" /> Full Name
                </span>
              </label>
              <input 
                type="text" 
                placeholder="Name" 
                className={`input input-bordered focus:input-primary ${theme === 'light' ? 'border-black/10 bg-white/90 text-black placeholder:text-black/40' : 'bg-base-200/50 text-white placeholder:text-white/35'}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className={`font-bold flex items-center gap-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                  <Mail className="w-4 h-4" /> Email Address
                </span>
              </label>
              <input 
                type="email" 
                placeholder="ritwik@example.com" 
                className={`input input-bordered focus:input-primary ${theme === 'light' ? 'bg-black/80 border-black/10 text-white placeholder:text-white/35' : 'bg-base-200/50 text-white placeholder:text-white/35'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className={`font-bold flex items-center gap-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                  <Lock className="w-4 h-4" /> Password
                </span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={`input input-bordered focus:input-primary ${theme === 'light' ? 'bg-black/80 border-black/10 text-white placeholder:text-white/35' : 'bg-base-200/50 text-white placeholder:text-white/35'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
              />
            </div>

            {error && (
              <div className="alert alert-error py-2 text-sm font-medium">
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block h-14 rounded-xl text-lg font-bold text-white shadow-lg shadow-primary/20 mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className={`mt-8 text-center text-sm font-medium ${theme === 'light' ? 'text-black/60' : 'text-white/60'}`}>
            Already have an account? 
            <Link href="/auth/signin" className="text-primary ml-1 hover:underline inline-flex items-center">
              Sign In <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
