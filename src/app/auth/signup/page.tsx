'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import VantaBackground from '@/frontend/components/VantaBackground';
import axios from 'axios';

export default function SignUpPage() {
  const router = useRouter();
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
    <main className="relative min-h-screen flex items-center justify-center p-4">
      <VantaBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="card bg-base-100/80 backdrop-blur-xl shadow-2xl border border-white/10 p-8 sm:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary p-3 rounded-2xl mb-4 shadow-lg shadow-primary/30">
              <Zap className="w-8 h-8 text-primary-content fill-current" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Join Snowball</h1>
            <p className="text-base-content/60 font-medium text-center">Break down your goals, build your legacy.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </span>
              </label>
              <input 
                type="text" 
                placeholder="Ritwik Jain" 
                className="input input-bordered focus:input-primary bg-base-200/50" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </span>
              </label>
              <input 
                type="email" 
                placeholder="ritwik@example.com" 
                className="input input-bordered focus:input-primary bg-base-200/50" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered focus:input-primary bg-base-200/50" 
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
              className="btn btn-primary btn-block h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium opacity-50">
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
