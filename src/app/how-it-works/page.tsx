'use client';

import Link from 'next/link';
import SplineBackground from '@/frontend/components/SplineBackground';
import { useTheme } from '@/frontend/context/ThemeContext';
import { ArrowLeft, ArrowRight, Brain, ListTodo, Zap, Sun, Moon } from 'lucide-react';

const steps = [
  {
    icon: Brain,
    title: 'Drop The Goal',
    description:
      'Bring Snowball the messy version: the big goal, the overwhelming project, or the thing you have been avoiding.',
  },
  {
    icon: ListTodo,
    title: 'Get Ranked Missions',
    description:
      'Snowball breaks the goal into smaller actions, scores them by urgency and impact, and builds a queue you can actually attack.',
  },
  {
    icon: Zap,
    title: 'Build Momentum',
    description:
      'You complete one mission at a time, earn momentum, and keep moving instead of stalling in planning mode.',
  },
];

export default function HowItWorksPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white">
      <SplineBackground />

      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={toggleTheme}
          className="btn btn-circle btn-ghost border border-white/10 bg-base-100/20 text-white shadow-xl backdrop-blur-md"
        >
          <span suppressHydrationWarning>
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          </span>
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center">
        <div className="w-full rounded-[2.5rem] border border-white/12 bg-base-100/28 p-6 shadow-[0_30px_120px_rgba(5,5,26,0.36)] backdrop-blur-md sm:p-8 lg:p-12">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-white/55">How Snowball Works</p>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">
              Stop staring at the mountain.
              <span className="block neon-text-primary">Start the next move.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-white/75 sm:text-lg">
              Snowball is built for the moment when your brain knows the goal but refuses to start. It turns vague pressure into concrete action.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 backdrop-blur-md">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/85 shadow-lg shadow-primary/25">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-white/35">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/72">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/auth/signin"
              className="btn btn-primary h-14 rounded-2xl px-8 text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/25"
            >
              Let&apos;s Do It
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/signup"
              className="btn h-14 rounded-2xl border border-white/15 bg-base-100/18 px-8 text-base font-black uppercase tracking-[0.2em] text-white backdrop-blur-md hover:bg-base-100/28"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
