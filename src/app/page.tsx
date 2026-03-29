'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SplineBackground from '@/frontend/components/SplineBackground';
import { useTheme } from '@/frontend/context/ThemeContext';
import { Sun, Moon, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
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

      <div className="relative z-20 mt-auto mb-14 flex w-full max-w-sm flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            boxShadow: [
              '0 18px 40px rgba(30, 64, 175, 0.28)',
              '0 22px 55px rgba(37, 99, 235, 0.38)',
              '0 18px 40px rgba(30, 64, 175, 0.28)',
            ],
          }}
          transition={{
            opacity: { duration: 0.35 },
            y: { duration: 0.35 },
            scale: { duration: 0.35 },
            boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl"
        >
        <Link
          href="/auth/signin"
          className="btn h-14 w-full rounded-2xl border-none bg-blue-600 text-base font-black uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-blue-500"
        >
          Let&apos;s Do It
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </Link>
        </motion.div>

        <Link
          href="/how-it-works"
          className="btn h-12 w-full rounded-2xl border border-white/15 bg-base-100/20 px-6 text-sm font-black uppercase tracking-[0.2em] text-white backdrop-blur-md hover:bg-base-100/30"
        >
          How It Works
        </Link>
      </div>
    </main>
  );
}
