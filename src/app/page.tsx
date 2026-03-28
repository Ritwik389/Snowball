'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import VantaBackground from '@/frontend/components/VantaBackground';
import { useTheme } from '@/frontend/context/ThemeContext';
import { Sun, Moon, Zap } from 'lucide-react';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <VantaBackground />
      
      {/* Theme Toggle */}
      <div className="absolute top-8 right-8 z-10">
        <button 
          onClick={toggleTheme}
          className="btn btn-circle btn-ghost bg-base-100/10 backdrop-blur-md border-base-content/10 shadow-xl"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/50">
              <Zap className="w-8 h-8 text-primary-content fill-current" />
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white">
              Snowball
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-white/80 mb-10 font-medium leading-relaxed">
            Stop overthinking. Start doing. 
            AI-powered micro-tasks that build massive momentum.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-lg px-12 rounded-full text-lg font-bold shadow-2xl shadow-primary/20"
              >
                Get Started
              </motion.button>
            </Link>
            
            <button className="btn btn-ghost hover:bg-white/10 text-white/70 border-white/10 border px-8 rounded-full">
              How it works
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 text-white/40 text-sm font-medium tracking-widest uppercase">
        Built for deep focus
      </div>
    </main>
  );
}
