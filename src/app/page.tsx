'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SplineBackground from '@/frontend/components/SplineBackground';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#040816] px-4 py-10 text-white">
      <SplineBackground forceTheme="synthwave" />

      <div className="relative z-20 mt-auto mb-14 flex w-full max-w-[14rem] flex-col items-center gap-3">
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
          className="btn h-11 w-full rounded-xl border-none bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 px-5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_16px_36px_rgba(14,165,233,0.35)] transition-all duration-300 hover:from-sky-400 hover:via-blue-500 hover:to-cyan-300"
        >
          Let&apos;s Do It
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center"
          >
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        </Link>
        </motion.div>

        <Link
          href="/how-it-works"
          className="btn h-10 w-full rounded-xl border border-white/15 bg-base-100/20 px-5 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-md hover:bg-base-100/30"
        >
          How It Works
        </Link>
      </div>
    </main>
  );
}
