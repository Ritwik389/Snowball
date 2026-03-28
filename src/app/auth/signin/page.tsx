'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import VantaBackground from '@/frontend/components/VantaBackground';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const msg = searchParams.get('success');
    if (msg) setSuccess(msg);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password.');
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
            <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
            <p className="text-base-content/60 font-medium tracking-tight">Build your momentum today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              className="btn btn-primary btn-block h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium opacity-50">
            New here? 
            <Link href="/auth/signup" className="text-primary ml-1 hover:underline inline-flex items-center">
              Create an Account <ArrowRight className="w-3 h-3 ml-1" />
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
