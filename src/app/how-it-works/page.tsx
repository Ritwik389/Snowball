'use client';

import Link from 'next/link';
import { useTheme } from '@/frontend/context/ThemeContext';
import { BADGES } from '@/shared/badges';
import { ArrowLeft, ArrowRight, Brain, ListTodo, Zap, Sun, Moon, Target, TimerReset, Trophy, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: Target,
    title: '1. Start With A Goal Or A Task',
    description:
      'You can either paste one big overwhelming goal and let Snowball break it down, or manually add a task yourself.',
  },
  {
    icon: ListTodo,
    title: '2. Build A Mission Queue',
    description:
      'Every task gets time, urgency, importance, and a deadline so the app can rank what matters most right now.',
  },
  {
    icon: TimerReset,
    title: '3. Play For Momentum',
    description:
      'Finish missions to build momentum, convert full momentum bars into points, and unlock stronger badges over time.',
  },
];

const inputGroups = [
  {
    icon: Brain,
    title: 'AI Mode Input',
    items: [
      'One messy goal, project, or outcome you want to make progress on.',
      'After generation, you set a deadline for each generated micro-task before saving them.',
    ],
  },
  {
    icon: ListTodo,
    title: 'Manual Mode Input',
    items: [
      'Task title',
      'Importance score from 1 to 10',
      'Urgency score from 1 to 10',
      'Estimated time in minutes',
      'Deadline date',
    ],
  },
  {
    icon: Zap,
    title: 'Focus Input',
    items: [
      'Available time in minutes or hours',
      'Then Snowball picks the best task that fits that time window.',
    ],
  },
];

const systemCards = [
  {
    icon: ShieldCheck,
    title: 'How Snowball Picks The Next Task',
    body:
      'The app filters out tasks that do not fit your available time, then scores the rest using urgency x importance. Deadlines can boost urgency even higher when time is running out, so near-due work rises to the top.',
  },
  {
    icon: Zap,
    title: 'Momentum And Streak Rules',
    body:
      'Completing a task adds momentum based on how important and urgent it was. The gain is capped, so every task helps but high-impact work helps more. Skipping a task drops momentum by 5, so the streak cools off instead of fully resetting.',
  },
  {
    icon: Trophy,
    title: 'Points And Badge Progression',
    body:
      'When momentum reaches 100, it rolls over into 1 point and your momentum resets to 0. Points are permanent progression. Badges are unlocked entirely from total points, so they show your long-term consistency.',
  },
];

export default function HowItWorksPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className={`relative min-h-screen overflow-hidden px-4 py-8 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      <div
        className={`absolute inset-0 ${
          theme === 'light'
            ? 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.18),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_50%,#f9fcff_100%)]'
            : 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.16),transparent_28%),linear-gradient(180deg,#040816_0%,#091225_50%,#050915_100%)]'
        }`}
      />
      <div
        className={`absolute inset-0 ${
          theme === 'light'
            ? 'bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-60'
            : 'bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40'
        }`}
      />
      <div
        className={`absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
          theme === 'light' ? 'bg-sky-300/30' : 'bg-cyan-400/12'
        }`}
      />

      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={toggleTheme}
          className={`btn btn-circle btn-ghost border shadow-xl backdrop-blur-md ${theme === 'light' ? 'border-black/10 bg-white/20 text-black' : 'border-white/10 bg-base-100/20 text-white'}`}
        >
          <span suppressHydrationWarning>
            {theme === 'light' ? <Moon className="w-5 h-5 text-black" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          </span>
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center">
        <div className={`w-full rounded-[2.5rem] p-6 shadow-[0_30px_120px_rgba(5,5,26,0.36)] backdrop-blur-md sm:p-8 lg:p-12 ${theme === 'light' ? 'border-black/12 bg-white/28' : 'border-white/12 bg-base-100/28'}`}>
          <Link
            href="/"
            className={`mb-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] transition hover:text-white ${theme === 'light' ? 'text-black/70 hover:text-black' : 'text-white/70'}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="max-w-3xl">
            <p className={`text-xs font-black uppercase tracking-[0.35em] ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>How Snowball Works</p>
            <h1 className={`mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl ${theme === 'light' ? 'text-black' : 'text-white'}`}>
              Stop staring at the mountain.
              <span className="block text-blue-600 drop-shadow-[0_0_18px_rgba(59,130,246,0.45)] dark:text-sky-400 dark:drop-shadow-[0_0_22px_rgba(56,189,248,0.55)]">
                See the whole game plan.
              </span>
            </h1>
            <p className={`mt-5 max-w-2xl text-base font-medium leading-relaxed sm:text-lg ${theme === 'light' ? 'text-black/75' : 'text-white/75'}`}>
              Snowball is designed to take a vague, stressful goal and turn it into a ranked mission queue. You tell the app what you need to do, how urgent it is, how important it is, and how much time you have. Snowball then helps you act on the best next move instead of spiraling.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className={`rounded-[1.8rem] p-6 backdrop-blur-md shadow-xl ${theme === 'light' ? 'border-black/20 bg-white/10 shadow-black/10' : 'border-white/20 bg-white/8 shadow-white/10'}`}>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/85 shadow-lg shadow-primary/25">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/35' : 'text-white/35'}`}>
                    0{index + 1}
                  </span>
                </div>
                <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>{title}</h2>
                <p className={`mt-3 text-sm leading-relaxed ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {inputGroups.map(({ icon: Icon, title, items }) => (
              <div key={title} className={`rounded-[1.8rem] border p-6 backdrop-blur-md ${theme === 'light' ? 'border-black/15 bg-white/18' : 'border-white/12 bg-white/6'}`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/85 shadow-lg shadow-primary/25">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h2 className={`text-xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>{title}</h2>
                <ul className={`mt-4 space-y-2 text-sm leading-relaxed ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>
                  {items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {systemCards.map(({ icon: Icon, title, body }) => (
              <div key={title} className={`rounded-[1.8rem] border p-6 backdrop-blur-md ${theme === 'light' ? 'border-black/15 bg-white/16' : 'border-white/10 bg-base-100/22'}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/85 shadow-lg shadow-primary/25">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>{title}</h2>
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>{body}</p>
              </div>
            ))}
          </div>

          <div className={`mt-10 rounded-[2rem] border p-6 backdrop-blur-md sm:p-8 ${theme === 'light' ? 'border-black/15 bg-white/16' : 'border-white/10 bg-base-100/20'}`}>
            <div className="max-w-3xl">
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>Momentum, Points, And Tiers</p>
              <h2 className={`mt-3 text-3xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>How Progress Actually Works</h2>
              <p className={`mt-4 text-sm leading-relaxed sm:text-base ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>
                Momentum is your short-term streak meter. Snowball labels it as Warmup below 45, Hot Streak at 45 or more, and Overdrive at 80 or more. Completing missions fills that bar. Skipping chips away at it. Once the bar hits 100, you earn 1 point and start filling the bar again from zero.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className={`rounded-[1.4rem] border p-4 ${theme === 'light' ? 'border-black/10 bg-white/30' : 'border-white/10 bg-white/5'}`}>
                <p className={`text-xs font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Warmup</p>
                <p className={`mt-2 text-sm ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>0 to 44 momentum. You are moving, but the streak is still fragile.</p>
              </div>
              <div className={`rounded-[1.4rem] border p-4 ${theme === 'light' ? 'border-black/10 bg-white/30' : 'border-white/10 bg-white/5'}`}>
                <p className={`text-xs font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Hot Streak</p>
                <p className={`mt-2 text-sm ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>45 to 79 momentum. You have real traction and each finish pushes you closer to a point.</p>
              </div>
              <div className={`rounded-[1.4rem] border p-4 ${theme === 'light' ? 'border-black/10 bg-white/30' : 'border-white/10 bg-white/5'}`}>
                <p className={`text-xs font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Overdrive</p>
                <p className={`mt-2 text-sm ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>80 to 100 momentum. One or two good finishes can convert this streak into a point.</p>
              </div>
            </div>
          </div>

          <div className={`mt-10 rounded-[2rem] border p-6 backdrop-blur-md sm:p-8 ${theme === 'light' ? 'border-black/15 bg-white/16' : 'border-white/10 bg-base-100/20'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-xs font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>Badges</p>
                <h2 className={`mt-3 text-3xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>Every Badge In The App</h2>
              </div>
              <div className={`rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'bg-black/6 text-black/65' : 'bg-white/8 text-white/65'}`}>
                Points unlock rank
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {BADGES.map((badge) => (
                <div key={badge.id} className={`rounded-[1.5rem] border p-5 ${theme === 'light' ? 'border-black/10 bg-white/26' : 'border-white/10 bg-white/5'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-3xl">{badge.icon}</div>
                      <h3 className={`mt-3 text-xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>{badge.name}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'bg-black/6 text-black/60' : 'bg-white/8 text-white/60'}`}>
                      {badge.rarity}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm leading-relaxed ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>{badge.description}</p>
                  <p className={`mt-4 text-xs font-black uppercase tracking-[0.22em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>
                    {badge.maxPoints ? `${badge.minPoints} to ${badge.maxPoints} points` : `${badge.minPoints}+ points`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-10 rounded-[2rem] border p-6 backdrop-blur-md sm:p-8 ${theme === 'light' ? 'border-black/15 bg-white/16' : 'border-white/10 bg-base-100/20'}`}>
            <p className={`text-xs font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>What Happens End To End</p>
            <h2 className={`mt-3 text-3xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>The Full Loop</h2>
            <ol className={`mt-6 space-y-3 text-sm leading-relaxed sm:text-base ${theme === 'light' ? 'text-black/72' : 'text-white/72'}`}>
              <li>1. Sign in and create missions either from one big AI prompt or by entering tasks manually.</li>
              <li>2. Add deadlines, urgency, importance, and estimated time so the queue can be ranked properly.</li>
              <li>3. Set how much time you have right now and let Snowball surface the best task that fits.</li>
              <li>4. Complete the mission to gain momentum, or skip it and lose a little momentum.</li>
              <li>5. Reach 100 momentum to bank 1 permanent point.</li>
              <li>6. Keep earning points to unlock higher badges, from Recruit all the way to Grandmaster.</li>
            </ol>
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
              className={`btn h-14 rounded-2xl border px-8 text-base font-black uppercase tracking-[0.2em] backdrop-blur-md hover:bg-base-100/28 ${theme === 'light' ? 'border-black/15 bg-white/18 text-black hover:bg-black/10' : 'border-white/15 bg-base-100/18 text-white'}`}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
