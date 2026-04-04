'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, CheckCircle, SkipForward, ArrowLeft, Loader2, Trophy, 
  Clock, Sun, Moon, List, Sparkles, LayoutDashboard,
  Calendar, AlertCircle, Flame, Crosshair, Mic, MicOff
} from 'lucide-react';
import axios from 'axios';
import { getPriorityTask, calculatePotentialMomentum } from '@/shared/priorityPipeline';
import { getCurrentBadge, getProgressToNextBadge, BADGES } from '@/shared/badges';
import { useTheme } from '@/frontend/context/ThemeContext';

const debounce = <T extends unknown[]>(
  fn: (...args: T) => Promise<void>,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout;
  return async (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

type GeneratedTask = {
  title: string;
  estimated_time_minutes: number;
  urgency_score: number;
  importance_score: number;
};

type TaskItem = {
  _id: string;
  title: string;
  description?: string;
  estimatedTime: number;
  urgency?: number;
  importance?: number;
  deadline?: string | Date;
  status?: string;
  createdAt?: string;
};

type CelebrationType = 'point' | 'badge' | null;
type SpeechTarget = 'goal' | 'manualTitle' | null;

const CONFETTI_PIECES = [
  { left: '4%', delay: '0s', duration: '3.2s', color: '#3b82f6', rotate: '-18deg' },
  { left: '10%', delay: '0.2s', duration: '3.6s', color: '#06b6d4', rotate: '12deg' },
  { left: '16%', delay: '0.1s', duration: '3.1s', color: '#f59e0b', rotate: '-8deg' },
  { left: '22%', delay: '0.35s', duration: '3.8s', color: '#60a5fa', rotate: '20deg' },
  { left: '28%', delay: '0.15s', duration: '3.3s', color: '#22c55e', rotate: '-14deg' },
  { left: '34%', delay: '0.45s', duration: '3.9s', color: '#38bdf8', rotate: '10deg' },
  { left: '40%', delay: '0.05s', duration: '3s', color: '#a855f7', rotate: '-20deg' },
  { left: '46%', delay: '0.25s', duration: '3.5s', color: '#f97316', rotate: '16deg' },
  { left: '52%', delay: '0.12s', duration: '3.4s', color: '#3b82f6', rotate: '-10deg' },
  { left: '58%', delay: '0.4s', duration: '3.7s', color: '#14b8a6', rotate: '22deg' },
  { left: '64%', delay: '0.18s', duration: '3.15s', color: '#eab308', rotate: '-12deg' },
  { left: '70%', delay: '0.3s', duration: '3.6s', color: '#818cf8', rotate: '14deg' },
  { left: '76%', delay: '0.08s', duration: '3.25s', color: '#0ea5e9', rotate: '-16deg' },
  { left: '82%', delay: '0.38s', duration: '3.85s', color: '#f43f5e', rotate: '18deg' },
  { left: '88%', delay: '0.22s', duration: '3.45s', color: '#3b82f6', rotate: '-6deg' },
  { left: '94%', delay: '0.5s', duration: '4s', color: '#06b6d4', rotate: '24deg' },
];

const formatDeadline = (deadline?: string | Date) => {
  if (!deadline) return 'No date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(deadline));
};

const getPriorityLabel = (importance = 5, urgency = 5) => {
  const score = importance * urgency;

  if (score >= 70) return 'Critical';
  if (score >= 40) return 'High';
  if (score >= 20) return 'Medium';
  return 'Low';
};

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'focus' | 'tasks' | 'badges'>('focus');
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskItem | null>(null);
  const [availableTime, setAvailableTime] = useState(180);
  const momentumRef = useRef(0);
  const pointsRef = useRef(0);
  const previousPointsRef = useRef<number | null>(null);
  
  const [creationMode, setCreationMode] = useState<'ai' | 'manual'>('ai');
  const [goal, setGoal] = useState('');
  const [manualTask, setManualTask] = useState({
    title: '',
    importance: '5',
    urgency: '5',
    estimatedTime: '30',
    deadline: ''
  });

  const [momentum, setMomentum] = useState(0); 
  const [points, setPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<CelebrationType>(null);
  const [showTaskConfetti, setShowTaskConfetti] = useState(false);
  const [speechTarget, setSpeechTarget] = useState<SpeechTarget>(null);
  const [speechError, setSpeechError] = useState('');
  const missionCount = tasks.length;
  const momentumTier = momentum >= 80 ? 'Overdrive' : momentum >= 45 ? 'Hot Streak' : 'Warmup';
  const currentBadge = getCurrentBadge(points);
  const badgeProgress = getProgressToNextBadge(points);
  const hasUnlockedBadge = currentBadge !== null;
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechDraftRef = useRef('');

  const speechSupported =
    typeof window !== 'undefined' &&
    typeof (window.SpeechRecognition ?? window.webkitSpeechRecognition) !== 'undefined';

  const mergeTranscript = (baseText: string, transcript: string) => {
    const trimmedBase = baseText.trimEnd();
    const trimmedTranscript = transcript.trim();

    if (!trimmedTranscript) {
      return baseText;
    }

    if (!trimmedBase) {
      return trimmedTranscript;
    }

    return `${trimmedBase} ${trimmedTranscript}`;
  };

  const updateSpeechField = useCallback((target: Exclude<SpeechTarget, null>, value: string) => {
    if (target === 'goal') {
      setGoal(value);
      return;
    }

    setManualTask((current) => ({
      ...current,
      title: value,
    }));
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startSpeechRecognition = useCallback((target: Exclude<SpeechTarget, null>) => {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined'
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) {
      setSpeechError('Speech to text is not supported in this browser.');
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognitionCtor();
    const baseText = target === 'goal' ? goal : manualTask.title;

    speechDraftRef.current = baseText;
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? '';
      }

      updateSpeechField(target, mergeTranscript(speechDraftRef.current, transcript));
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        setSpeechError('Voice capture failed. Please try again.');
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setSpeechTarget((current) => (current === target ? null : current));
    };

    recognitionRef.current = recognition;
    setSpeechError('');
    setSpeechTarget(target);
    recognition.start();
  }, [goal, manualTask.title, updateSpeechField]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/tasks?status=pending');
      const nextTasks = Array.isArray(data.tasks) ? (data.tasks as TaskItem[]) : [];
      setTasks(nextTasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  }, []);



  const fetchUserData = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/user');
      const momentum = data.momentum || 0;
      const points = data.points || 0;
      setMomentum(momentum);
      setPoints(points);
      momentumRef.current = momentum;
      pointsRef.current = points;
      previousPointsRef.current = points;
    } catch (err) {
      console.error('Failed to fetch user data', err);
      const savedMomentum = localStorage.getItem('snowball-momentum');
      const savedPoints = localStorage.getItem('snowball-points');
      if (savedMomentum) {
        const m = parseInt(savedMomentum);
        setMomentum(m);
        momentumRef.current = m;
      }
      if (savedPoints) {
        const p = parseInt(savedPoints);
        setPoints(p);
        pointsRef.current = p;
        previousPointsRef.current = p;
      }
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTasks();
      fetchUserData();
    }
  }, [status, router, fetchTasks, fetchUserData]);

  const debouncedUpdateUserData = useRef(
    debounce(async (m: number, p: number) => {
      try {
        await axios.patch('/api/user', { momentum: m, points: p });
      } catch (err) {
        console.error('Failed to update user data', err);
        localStorage.setItem('snowball-momentum', m.toString());
        localStorage.setItem('snowball-points', p.toString());
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (momentum >= 100) {
      const newPoints = pointsRef.current + 1;
      setPoints(newPoints);
      pointsRef.current = newPoints;
      setMomentum(0);
      momentumRef.current = 0;
      setCelebrationType('point');
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setCelebrationType(null);
      }, 3000);
      debouncedUpdateUserData(0, newPoints);
    } else {
      debouncedUpdateUserData(momentum, points);
    }
  }, [momentum, points, debouncedUpdateUserData]);

  useEffect(() => {
    if (previousPointsRef.current === null) {
      previousPointsRef.current = points;
      return;
    }

    const previousPoints = previousPointsRef.current;
    const previousBadge = getCurrentBadge(previousPoints);
    const newBadge = getCurrentBadge(points);
    
    if (points > previousPoints && newBadge && previousBadge?.id !== newBadge.id) {
      setCelebrationType('badge');
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setCelebrationType(null);
      }, 4000);
    }

    previousPointsRef.current = points;
  }, [points]);

  const handleAIGenerate = async () => {
    if (!goal) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/generate-tasks', { goal });
      const tasks = Array.isArray(data.tasks) ? data.tasks as GeneratedTask[] : [];

      if (tasks.length > 0) {
        await saveGeneratedTasks(tasks);
      }

      setGoal('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGeneratedTasks = async (tasksToSave: GeneratedTask[]) => {
    try {
      await Promise.all(
        tasksToSave.map((task) =>
          axios.post('/api/tasks', {
            title: task.title,
            estimatedTime: task.estimated_time_minutes,
            importance: task.importance_score,
            urgency: task.urgency_score,
          })
        )
      );
      await fetchTasks();
      setActiveTab('tasks');
    } catch (err) {
      console.error('Failed to save tasks', err);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const deadlineDate = new Date(manualTask.deadline);
      deadlineDate.setHours(23, 59, 59, 0);
      await axios.post('/api/tasks', {
        ...manualTask,
        deadline: deadlineDate.toISOString()
      });
      setManualTask({ title: '', importance: '5', urgency: '5', estimatedTime: '30', deadline: '' });
      await fetchTasks();
      setActiveTab('tasks');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJustDoIt = () => {
    if (tasks.length === 0) {
      setActiveTab('tasks');
      return;
    }
    const mappedTasks = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      estimated_time_minutes: t.estimatedTime,
      urgency_score: t.urgency ?? 5,
      importance_score: t.importance ?? 5,
      deadline: t.deadline ? new Date(t.deadline) : undefined,
      created_at: t.createdAt ? new Date(t.createdAt) : undefined
    }));

    const bestTaskData = getPriorityTask(mappedTasks, availableTime);
    if (bestTaskData) {
      const actualTask = tasks.find((t) => t._id === bestTaskData.id);
      if (actualTask) {
        setCurrentTask(actualTask);
      }
    } else {
      alert(`No tasks fit in your ${availableTime >= 60 ? `${Math.floor(availableTime / 60)}h ${availableTime % 60}m` : availableTime + 'm'} available time. Increase your available time or create shorter tasks.`);
    }
  };

  const markDone = async (task: TaskItem) => {
    try {
      const completedAllTasks = tasks.length === 1;
      await axios.patch('/api/tasks', { id: task._id, status: 'done' });
      const gain = calculatePotentialMomentum({
        id: task._id,
        title: task.title,
        estimated_time_minutes: task.estimatedTime,
        urgency_score: task.urgency ?? 5,
        importance_score: task.importance ?? 5
      });
      
      const newMomentum = Math.min(100, momentumRef.current + gain);
      momentumRef.current = newMomentum;
      setMomentum(newMomentum);
      
      await axios.patch('/api/user', { momentum: newMomentum, points: pointsRef.current });
      
      setCurrentTask(null);
      await fetchTasks();

      if (completedAllTasks) {
        setShowTaskConfetti(true);
        setTimeout(() => {
          setShowTaskConfetti(false);
        }, 4200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const skipTask = async (task: TaskItem) => {
    try {
      await axios.patch('/api/tasks', { id: task._id, status: 'skipped' });
      const newMomentum = Math.max(0, momentumRef.current - 5);
      momentumRef.current = newMomentum;
      setMomentum(newMomentum);
      
      await axios.patch('/api/user', { momentum: newMomentum, points: pointsRef.current });
      
      setCurrentTask(null);
      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-vh-screen bg-base-300">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden transition-colors duration-500" data-theme={theme}>
      <div className="fixed inset-0 synth-grid pointer-events-none opacity-20 z-0"></div>
      {showTaskConfetti && (
        <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden" aria-hidden="true">
          {CONFETTI_PIECES.map((piece, index) => (
            <span
              key={`${piece.left}-${index}`}
              className="task-confetti-piece"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotate})`,
              }}
            />
          ))}
        </div>
      )}

      <header className={`relative z-20 backdrop-blur-md ${theme === 'light' ? 'border-b border-black/10 bg-white/25' : 'border-b border-white/5 bg-base-100/25'}`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-2xl neon-border-primary">
                <Zap className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <p className={`text-[11px] font-black uppercase tracking-[0.35em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Mission Control</p>
                <span className="font-black text-2xl tracking-tighter text-blue-500 drop-shadow-[0_0_18px_rgba(59,130,246,0.75)] italic">SNOWBALL</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="score-chip px-4 py-3">
                <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Points</p>
                <div className="mt-1 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span className={`font-black text-lg ${theme === 'light' ? 'text-black' : 'text-white'}`}>{points}</span>
                </div>
              </div>
              <button onClick={toggleTheme} className={`btn btn-circle btn-sm btn-ghost border transition-colors ${theme === 'light' ? 'border-black/10 bg-white/10 hover:bg-black/10' : 'border-white/10 bg-base-100/25 hover:bg-white/10'}`}>
                <span suppressHydrationWarning>
                  {theme === 'light' ? <Moon className="w-4 h-4 text-black" /> : <Sun className="w-4 h-4 text-white" />}
                </span>
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="score-chip px-4 py-4">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-primary" />
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Momentum Tier</p>
                  <p className={`text-lg font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{momentumTier}</p>
                </div>
              </div>
            </div>
            <div className="score-chip px-4 py-4">
              <div className="flex items-center gap-3">
                <Crosshair className="w-5 h-5 text-secondary" />
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Pending Missions</p>
                  <p className={`text-lg font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{missionCount}</p>
                </div>
              </div>
            </div>
            <div className="score-chip px-4 py-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-warning" />
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Badge</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xl">{currentBadge?.icon ?? '🔒'}</span>
                    <span className={`text-lg font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                      {currentBadge?.name ?? 'No Badge Yet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className={`relative z-10 flex justify-center mt-8 px-4`}>
        <div className={`flex p-1.5 rounded-3xl border backdrop-blur-md ${theme === 'light' ? 'bg-black/5 border-black/10' : 'bg-base-200/45 border-white/10'}`}>
          <button 
            onClick={() => setActiveTab('focus')}
            className={`btn btn-sm sm:btn-md gap-2 rounded-xl transition-all duration-300 ${activeTab === 'focus' ? 'btn-primary neon-border-primary' : `btn-ghost ${theme === 'light' ? 'text-black' : 'text-white'}`}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Focus
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`btn btn-sm sm:btn-md gap-2 rounded-xl transition-all duration-300 ${activeTab === 'tasks' ? 'btn-primary neon-border-primary' : `btn-ghost ${theme === 'light' ? 'text-black' : 'text-white'}`}`}
          >
            <List className="w-4 h-4" />
            My Tasks
          </button>
          <button 
            onClick={() => setActiveTab('badges')}
            className={`btn btn-sm sm:btn-md gap-2 rounded-xl transition-all duration-300 ${activeTab === 'badges' ? 'btn-primary neon-border-primary' : `btn-ghost ${theme === 'light' ? 'text-black' : 'text-white'}`}`}
          >
            <Trophy className="w-4 h-4" />
            Badges
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center p-4 w-full pt-10 overflow-y-auto">
        
        <div className="mission-frame w-full max-w-6xl rounded-[2rem] px-5 py-5 mb-10">
          <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}>Combat Meter</p>
              <h2 className={`mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                Momentum at <span className="neon-text-primary">{momentum}%</span>
              </h2>
              <p className={`mt-2 text-sm font-medium ${theme === 'light' ? 'text-black/60' : 'text-white/60'}`}>Every completed task feeds the streak. Skips cool it off.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="score-chip px-4 py-3">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Rank</p>
                <p className={`mt-1 text-xl font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{points}</p>
              </div>
              <div className="score-chip px-4 py-3">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Queue</p>
                <p className={`mt-1 text-xl font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{missionCount}</p>
              </div>
              <div className="score-chip px-4 py-3">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Mode</p>
                <p className={`mt-1 text-xl font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{activeTab}</p>
              </div>
            </div>
          </div>
          <div className="h-5 w-full rounded-full border border-white/10 bg-base-100/40 p-[3px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${momentum}%` }}
              className="h-full rounded-full bg-gradient-to-r from-primary via-blue-500 to-secondary shadow-[0_0_25px_rgba(37,99,235,0.55)]"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'focus' && (
            <motion.div 
              key="focus"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              {!currentTask ? (
                <div className="w-full max-w-5xl px-4">
                  <div className="focus-frame rounded-[2.5rem] px-6 py-10 text-center sm:px-10 sm:py-14 flex flex-col items-center justify-center">
                  <h2 className={`text-5xl sm:text-7xl font-black mb-6 italic tracking-tighter uppercase ${theme === 'light' ? 'text-black' : 'text-white'}`}><span className="text-blue-500 drop-shadow-[0_0_22px_rgba(59,130,246,0.8)]">Press Start.</span></h2>
                  <p className={`text-xl mb-12 font-medium tracking-widest uppercase ${theme === 'light' ? 'text-black/60' : 'text-white/60'}`}>Your next best move is one hit away.</p>
                  
                  <button 
                    onClick={handleJustDoIt}
                    className="group relative flex items-center justify-center transform active:scale-95 transition-transform"
                  >
                    <div className="absolute inset-0 bg-primary blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="hero-orb w-56 h-56 sm:w-72 sm:h-72 rounded-full border-4 border-primary/50 flex flex-col items-center justify-center backdrop-blur-2xl hover:shadow-[0_0_80px_rgba(37,99,235,0.6)] transition-all duration-500 cursor-pointer neon-border-primary ring-8 ring-primary/10">
                        <Zap className="w-14 h-14 sm:w-20 sm:h-20 text-white fill-current mb-2 animate-pulse" />
                        <span className="text-2xl sm:text-4xl font-black tracking-widest text-white italic">JUST DO IT</span>
                    </div>
                  </button>

                  <div className="mt-16 w-full max-w-lg mx-auto">
                    <div className="mb-4">
                      <p className={`text-lg font-bold uppercase tracking-widest ${theme === 'light' ? 'text-black/80' : 'text-white/80'}`}>
                        How much time do you have?
                      </p>
                      <p className="mt-2 text-3xl font-black text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.78)]">
                        {availableTime >= 60 
                          ? `${Math.floor(availableTime / 60)}h ${availableTime % 60}m` 
                          : `${availableTime}m`}
                      </p>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="360"
                      step="15"
                      value={availableTime}
                      onChange={(e) => setAvailableTime(parseInt(e.target.value))}
                      className="range range-primary w-full"
                    />
                    <div className={`flex justify-between text-xs font-bold uppercase tracking-widest mt-3 ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}>
                      <span>30m</span>
                      <span>6h</span>
                    </div>
                  </div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-full max-w-xl glass-card rounded-[2.5rem] p-12 text-center relative mx-auto ${theme === 'light' ? 'text-black border-black/10' : 'text-white border-primary/30'}`}
                >
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full neon-border-primary ${theme === 'light' ? 'bg-primary text-white' : 'bg-primary text-white'}`}>
                    <span className="text-xs font-black uppercase tracking-widest">Active Objective</span>
                  </div>
                  
                  <h3 className={`text-4xl font-black mb-8 leading-tight uppercase ${theme === 'light' ? 'text-black' : 'neon-text-primary'}`}>
                    {currentTask.title}
                  </h3>
                  
                  <div className={`flex justify-center items-center gap-8 mb-12 ${theme === 'light' ? 'text-black/80' : 'text-white opacity-80'}`}>
                    <div className="flex items-center gap-2 font-bold">
                        <Clock className="w-5 h-5 text-secondary" />
                        {currentTask.estimatedTime} min
                    </div>
                    <div className="flex items-center gap-2 font-bold">
                        <Sparkles className="w-5 h-5 text-warning" />
                        Score: {(currentTask.importance || 5) * (currentTask.urgency || 5)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => markDone(currentTask)}
                      className="btn btn-primary btn-lg rounded-2xl h-20 shadow-xl neon-border-primary font-black text-xl italic"
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      DONE
                    </button>
                    <button 
                      onClick={() => skipTask(currentTask)}
                      className="btn btn-ghost btn-lg rounded-2xl h-20 border border-white/10 font-black text-xl opacity-60 hover:opacity-100 italic"
                    >
                      <SkipForward className="w-6 h-6 mr-2" />
                      SKIP
                    </button>
                  </div>

                  <button 
                    onClick={() => setCurrentTask(null)}
                    className="btn btn-link btn-xs mt-8 opacity-40 hover:opacity-100 no-underline italic"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" /> Back to Focus
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-6xl mx-auto"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme === 'light' ? 'text-black/40' : 'text-white/40'}`}>Tasks</p>
                  <h2 className={`mt-2 text-4xl font-semibold tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>Task database</h2>
                  <p className={`mt-2 text-sm ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>Create tasks and manage your queue in one calm workspace.</p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${theme === 'light' ? 'border-black/10 bg-white/80 text-black/70' : 'border-white/10 bg-white/5 text-white/70'}`}>
                  <span className={`h-2 w-2 rounded-full ${tasks.length > 0 ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                  {tasks.length} open tasks
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:items-start">
                <div className={`rounded-[1.5rem] border p-5 sm:p-6 ${theme === 'light' ? 'border-black/10 bg-[#fbfbfa] text-black shadow-[0_18px_60px_rgba(15,23,42,0.06)]' : 'border-white/10 bg-[#191919] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)]'}`}>
                  <div className="mb-6">
                    <p className={`text-xs font-medium uppercase tracking-[0.18em] ${theme === 'light' ? 'text-black/40' : 'text-white/40'}`}>New</p>
                    <h3 className={`mt-2 text-2xl font-semibold tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>Add a task</h3>
                    <p className={`mt-2 text-sm leading-6 ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>Use AI for a quick breakdown or enter a task manually like a Notion database row.</p>
                  </div>

                  <div className={`mb-6 rounded-2xl border px-4 py-3 text-xs font-medium ${theme === 'light' ? 'border-black/10 bg-white/80 text-black/60' : 'border-white/10 bg-white/5 text-white/60'}`}>
                    {speechSupported
                      ? speechTarget
                        ? `Listening for ${speechTarget === 'goal' ? 'AI brainstorm' : 'task title'}...`
                        : 'Use the mic to dictate your brainstorm or task title.'
                      : 'Speech to text is available in supported browsers like Chrome and Edge.'}
                    {speechError ? (
                      <span className={`ml-2 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>{speechError}</span>
                    ) : null}
                  </div>

                  <div className={`mb-6 inline-flex rounded-xl border p-1 ${theme === 'light' ? 'border-black/10 bg-white' : 'border-white/10 bg-black/20'}`}>
                    <button 
                      onClick={() => setCreationMode('ai')}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${creationMode === 'ai' ? 'bg-primary text-white shadow-sm' : `${theme === 'light' ? 'text-black/55 hover:bg-black/5' : 'text-white/60 hover:bg-white/5'}`}`}
                    >
                      <Sparkles className="w-4 h-4" /> AI
                    </button>
                    <button 
                      onClick={() => setCreationMode('manual')}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${creationMode === 'manual' ? 'bg-primary text-white shadow-sm' : `${theme === 'light' ? 'text-black/55 hover:bg-black/5' : 'text-white/60 hover:bg-white/5'}`}`}
                    >
                      <List className="w-4 h-4" /> Manual
                    </button>
                  </div>

                  {creationMode === 'ai' ? (
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>Brainstorm from a larger goal</h3>
                        <button
                          type="button"
                          onClick={() => (speechTarget === 'goal' ? stopSpeechRecognition() : startSpeechRecognition('goal'))}
                          className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black uppercase tracking-[0.18em] transition-colors ${
                            speechTarget === 'goal'
                              ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.35)]'
                              : theme === 'light'
                                ? 'border-black/10 bg-white text-black hover:bg-black/5'
                                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                          }`}
                          disabled={!speechSupported}
                        >
                          {speechTarget === 'goal' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {speechTarget === 'goal' ? 'Stop Mic' : 'Voice Input'}
                        </button>
                      </div>
                      <p className={`mt-2 text-sm leading-6 ${theme === 'light' ? 'text-black/55' : 'text-white/55'}`}>Paste the bigger project and Snowball will turn it into a short list of actionable tasks.</p>
                      <textarea 
                        className={`mt-5 min-h-48 w-full rounded-2xl border px-4 py-4 text-sm outline-none transition-colors ${theme === 'light' ? 'border-black/10 bg-white text-black placeholder:text-black/30 focus:border-primary' : 'border-white/10 bg-[#111111] text-white placeholder:text-white/30 focus:border-primary'}`}
                        placeholder="Write a project, goal, or messy brain dump..."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                      <button 
                        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        onClick={handleAIGenerate}
                        disabled={!goal || isLoading}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate tasks'}
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleManualCreate}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>Create manually</h3>
                        <button
                          type="button"
                          onClick={() => (speechTarget === 'manualTitle' ? stopSpeechRecognition() : startSpeechRecognition('manualTitle'))}
                          className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black uppercase tracking-[0.18em] transition-colors ${
                            speechTarget === 'manualTitle'
                              ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.35)]'
                              : theme === 'light'
                                ? 'border-black/10 bg-white text-black hover:bg-black/5'
                                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                          }`}
                          disabled={!speechSupported}
                        >
                          {speechTarget === 'manualTitle' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {speechTarget === 'manualTitle' ? 'Stop Mic' : 'Voice Input'}
                        </button>
                      </div>
                      
                      <div className="mt-5 grid gap-5">
                        <div className="form-control">
                          <label className={`mb-2 text-xs font-medium uppercase tracking-[0.16em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Title</label>
                          <input 
                            required
                            placeholder="Write a concise task name"
                            className={`h-11 rounded-xl border px-4 text-sm outline-none transition-colors ${theme === 'light' ? 'border-black/10 bg-white text-black placeholder:text-black/35 focus:border-primary' : 'border-white/10 bg-[#111111] text-white placeholder:text-white/35 focus:border-primary'}`}
                            value={manualTask.title}
                            onChange={(e) => setManualTask({...manualTask, title: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className={`mb-2 text-xs font-medium uppercase tracking-[0.16em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Importance</label>
                            <select 
                              className={`h-11 rounded-xl border px-4 text-sm outline-none transition-colors ${theme === 'light' ? 'border-black/10 bg-white text-black focus:border-primary' : 'border-white/10 bg-[#111111] text-white focus:border-primary'}`}
                              value={manualTask.importance}
                              onChange={(e) => setManualTask({...manualTask, importance: e.target.value})}
                            >
                              <option value="1">Low</option>
                              <option value="5">Medium</option>
                              <option value="9">High</option>
                              <option value="10">Critical</option>
                            </select>
                          </div>
                          <div className="form-control">
                            <label className={`mb-2 text-xs font-medium uppercase tracking-[0.16em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Time</label>
                            <input 
                              type="number"
                              className={`h-11 rounded-xl border px-4 text-sm outline-none transition-colors ${theme === 'light' ? 'border-black/10 bg-white text-black placeholder:text-black/35 focus:border-primary' : 'border-white/10 bg-[#111111] text-white placeholder:text-white/35 focus:border-primary'}`}
                              value={manualTask.estimatedTime}
                              onChange={(e) => setManualTask({...manualTask, estimatedTime: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="form-control">
                          <label className={`mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}><Calendar className="w-4 h-4" /> Deadline</label>
                          <input 
                            type="date"
                            className={`h-11 rounded-xl border px-4 text-sm outline-none transition-colors ${theme === 'light' ? 'border-black/10 bg-white text-black placeholder:text-black/35 focus:border-primary' : 'border-white/10 bg-[#111111] text-white placeholder:text-white/35 focus:border-primary'}`}
                            value={manualTask.deadline}
                            onChange={(e) => setManualTask({...manualTask, deadline: e.target.value})}
                            required
                          />
                          <p className={`mt-2 text-xs ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Due at 11:59 PM on this date.</p>
                        </div>

                        <button 
                          type="submit"
                          className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add task'}
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className={`overflow-hidden rounded-[1.5rem] border ${theme === 'light' ? 'border-black/10 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]' : 'border-white/10 bg-[#191919] shadow-[0_18px_60px_rgba(0,0,0,0.22)]'}`}>
                  <div className={`flex items-center justify-between border-b px-5 py-4 sm:px-6 ${theme === 'light' ? 'border-black/8 bg-[#fbfbfa]' : 'border-white/10 bg-black/10'}`}>
                    <div>
                      <h3 className={`text-xl font-semibold tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>All tasks</h3>
                      <p className={`mt-1 text-sm ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}>A simple view of what is open right now.</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${theme === 'light' ? 'bg-black/5 text-black/60' : 'bg-white/8 text-white/60'}`}>Table view</span>
                  </div>

                  <div className={`hidden sm:grid grid-cols-[minmax(0,1.6fr)_88px_96px_112px_120px] gap-3 px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] sm:px-6 ${theme === 'light' ? 'border-b border-black/8 text-black/40' : 'border-b border-white/10 text-white/40'}`}>
                    <span>Task</span>
                    <span>Time</span>
                    <span>Priority</span>
                    <span>Deadline</span>
                    <span>Actions</span>
                  </div>

                  {tasks.length === 0 ? (
                    <div className={`px-6 py-16 text-center ${theme === 'light' ? 'text-black/65' : 'text-white/65'}`}>
                      <div className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${theme === 'light' ? 'bg-black/5' : 'bg-white/5'}`}>
                        <AlertCircle className="w-5 h-5 text-primary" />
                      </div>
                      <p className={`text-lg font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>No tasks yet</p>
                      <p className="mt-2 text-sm">Use the left panel to add your first row.</p>
                    </div>
                  ) : (
                    <div>
                      {tasks.map((task) => {
                        const priorityLabel = getPriorityLabel(task.importance, task.urgency);

                        return (
                          <div key={task._id} className={`grid grid-cols-1 gap-3 px-5 py-4 transition-colors sm:grid-cols-[minmax(0,1.6fr)_88px_96px_112px_120px] sm:items-center sm:px-6 ${theme === 'light' ? 'border-t border-black/6 hover:bg-black/[0.025]' : 'border-t border-white/8 hover:bg-white/[0.025]'}`}>
                            <div className="min-w-0">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => markDone(task)}
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${theme === 'light' ? 'border-black/15 hover:border-primary hover:bg-primary/5' : 'border-white/15 hover:border-primary hover:bg-primary/10'}`}
                                  aria-label={`Mark ${task.title} done`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                                </button>
                                <div className="min-w-0">
                                  <p className={`truncate text-sm font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>{task.title}</p>
                                  <p className={`mt-1 text-xs ${theme === 'light' ? 'text-black/45' : 'text-white/45'}`}>Impact score {(task.importance || 5) * (task.urgency || 5)}</p>
                                </div>
                              </div>
                            </div>

                            <div className={`text-sm ${theme === 'light' ? 'text-black/65' : 'text-white/65'}`}>{task.estimatedTime}m</div>
                            <div>
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                priorityLabel === 'Critical'
                                  ? 'bg-red-500/12 text-red-500'
                                  : priorityLabel === 'High'
                                    ? 'bg-amber-500/12 text-amber-600'
                                    : priorityLabel === 'Medium'
                                      ? 'bg-blue-500/12 text-blue-500'
                                      : theme === 'light'
                                        ? 'bg-black/6 text-black/55'
                                        : 'bg-white/8 text-white/55'
                              }`}>
                                {priorityLabel}
                              </span>
                            </div>
                            <div className={`text-sm ${theme === 'light' ? 'text-black/65' : 'text-white/65'}`}>{formatDeadline(task.deadline)}</div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => markDone(task)} className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium ${theme === 'light' ? 'bg-black text-white hover:bg-black/85' : 'bg-white text-black hover:bg-white/85'}`}>Done</button>
                              <button onClick={() => skipTask(task)} className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium ${theme === 'light' ? 'bg-black/5 text-black/60 hover:bg-black/10' : 'bg-white/8 text-white/65 hover:bg-white/12'}`}>Skip</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div 
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]">Achievement Hall</h2>
                <div className="flex items-center gap-4">
                  <div className={`badge badge-primary font-black italic border-none px-4 py-4 ${theme === 'light' ? 'text-white' : 'text-white'}`}>
                    {points} POINTS
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className={`glass-card rounded-3xl p-8 text-center ${theme === 'light' ? 'border-black/10' : 'border-white/10'}`}>
                  <div className="mb-6">
                    {currentBadge ? (
                      <>
                        <div className={`text-6xl mb-4 ${currentBadge.color}`}>{currentBadge.icon}</div>
                        <h3 className={`text-3xl font-black uppercase tracking-tight mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                          {currentBadge.name}
                        </h3>
                        <p className={`text-lg font-medium ${theme === 'light' ? 'text-black/70' : 'text-white/70'}`}>
                          {currentBadge.description}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className={`text-6xl mb-4 ${theme === 'light' ? 'text-black/35' : 'text-white/35'}`}>🔒</div>
                        <h3 className={`text-3xl font-black uppercase tracking-tight mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                          No Badge Yet
                        </h3>
                        <p className={`text-lg font-medium ${theme === 'light' ? 'text-black/70' : 'text-white/70'}`}>
                          Earn your first point to unlock the Recruit badge.
                        </p>
                      </>
                    )}
                  </div>

                  {badgeProgress.progress < 100 && (
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className={theme === 'light' ? 'text-black/60' : 'text-white/60'}>
                          {badgeProgress.current} / {badgeProgress.next} points
                        </span>
                        <span className={theme === 'light' ? 'text-black/60' : 'text-white/60'}>
                          {Math.round(badgeProgress.progress)}%
                        </span>
                      </div>
                      <progress 
                        className="progress progress-primary w-full h-3" 
                        value={badgeProgress.progress} 
                        max="100"
                      ></progress>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BADGES.map((badge) => {
                  const isUnlocked = points >= badge.minPoints;
                  const isCurrent = badge.id === currentBadge?.id;

                  return (
                    <div 
                      key={badge.id}
                      className={`glass-card rounded-2xl p-6 transition-all ${
                        isCurrent 
                          ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
                          : isUnlocked 
                            ? 'opacity-75 hover:opacity-100' 
                            : 'opacity-50 grayscale'
                      } ${theme === 'light' ? 'border-black/10' : 'border-white/10'}`}
                    >
                      <div className="text-center">
                        <div className={`text-4xl mb-3 ${badge.color} ${!isUnlocked ? 'grayscale' : ''}`}>
                          {badge.icon}
                        </div>
                        <h4 className={`text-xl font-black uppercase tracking-tight mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                          {badge.name}
                        </h4>
                        <p className={`text-sm font-medium mb-4 ${theme === 'light' ? 'text-black/70' : 'text-white/70'}`}>
                          {badge.description}
                        </p>
                        <div className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-black/50' : 'text-white/50'}`}>
                          {badge.minPoints}+ points
                        </div>
                        {isCurrent && (
                          <div className="mt-3">
                            <span className="badge badge-primary badge-sm font-black">CURRENT</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className={`glass-card text-center p-12 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.4)] neon-border-primary ${theme === 'light' ? 'text-black' : 'text-white'}`}>
              {celebrationType === 'point' ? (
                <>
                  <Trophy className="w-20 h-20 text-warning mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,165,0,0.5)]" />
                  <h1 className={`text-5xl font-black italic tracking-tighter mb-2 ${theme === 'light' ? 'text-black' : 'neon-text-primary'}`}>MOMENTUM CRITICAL!</h1>
                  <p className={`font-black text-xl uppercase tracking-widest ${theme === 'light' ? 'text-black/80' : 'text-white/80'}`}>+1 RANK ACHIEVED</p>
                </>
              ) : celebrationType === 'badge' ? (
                <>
                  {hasUnlockedBadge && currentBadge ? (
                    <>
                      <div className={`text-6xl mb-6 ${currentBadge.color}`}>{currentBadge.icon}</div>
                      <h1 className={`text-5xl font-black italic tracking-tighter mb-2 ${theme === 'light' ? 'text-black' : 'neon-text-primary'}`}>BADGE UNLOCKED!</h1>
                      <p className={`font-black text-xl uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-black/80' : 'text-white/80'}`}>{currentBadge.name}</p>
                      <p className={`text-lg ${theme === 'light' ? 'text-black/60' : 'text-white/60'}`}>{currentBadge.description}</p>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
