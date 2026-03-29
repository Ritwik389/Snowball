'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, CheckCircle, SkipForward, ArrowLeft, Loader2, Trophy, 
  Clock, Sun, Moon, List, PlusCircle, Sparkles, LayoutDashboard,
  Calendar, AlertCircle, Flame, Crosshair, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { getPriorityTask, calculatePotentialMomentum } from '@/shared/priorityPipeline';
import { useTheme } from '@/frontend/context/ThemeContext';
import VantaBackground from '@/frontend/components/VantaBackground';

type TaskItem = {
  _id: string;
  title: string;
  description?: string;
  estimatedTime: number;
  urgency?: number;
  importance?: number;
  status?: string;
  createdAt?: string;
};

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // App State
  const [activeTab, setActiveTab] = useState<'focus' | 'tasks' | 'create'>('focus');
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskItem | null>(null);
  
  // Creation State
  const [creationMode, setCreationMode] = useState<'ai' | 'manual'>('ai');
  const [goal, setGoal] = useState('');
  const [manualTask, setManualTask] = useState({
    title: '',
    importance: '5',
    urgency: '5',
    estimatedTime: '30',
    deadline: ''
  });

  // Gamification State
  const [momentum, setMomentum] = useState(0); 
  const [points, setPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const missionCount = tasks.length;
  const momentumTier = momentum >= 80 ? 'Overdrive' : momentum >= 45 ? 'Hot Streak' : 'Warmup';

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/tasks');
      const nextTasks = Array.isArray(data.tasks) ? (data.tasks as TaskItem[]) : [];
      setTasks(nextTasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTasks();
      
      const savedMomentum = localStorage.getItem('snowball-momentum');
      const savedPoints = localStorage.getItem('snowball-points');
      if (savedMomentum) setMomentum(parseInt(savedMomentum));
      if (savedPoints) setPoints(parseInt(savedPoints));
    }
  }, [status, router, fetchTasks]);

  useEffect(() => {
    localStorage.setItem('snowball-momentum', momentum.toString());
    localStorage.setItem('snowball-points', points.toString());
    
    if (momentum >= 100) {
      setPoints(p => p + 1);
      setMomentum(0);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [momentum, points]);

  // Actions
  const handleAIGenerate = async () => {
    if (!goal) return;
    setIsLoading(true);
    try {
      await axios.post('/api/generate-tasks', { goal });
      setGoal('');
      await fetchTasks();
      setActiveTab('tasks');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('/api/tasks', manualTask);
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
      setActiveTab('create');
      return;
    }
    // Use the algorithm to find the best task
    // Mapping our DB tasks to the SubTask type expected by the pipeline
    const mappedTasks = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      estimated_time_minutes: t.estimatedTime,
      urgency_score: t.urgency ?? 5,
      importance_score: t.importance ?? 5
    }));

    const bestTaskData = getPriorityTask(mappedTasks, 999); // No time limit for "Just Do It"
    if (bestTaskData) {
      const actualTask = tasks.find((t) => t._id === bestTaskData.id);
      if (actualTask) {
        setCurrentTask(actualTask);
      }
    }
  };

  const markDone = async (task: TaskItem) => {
    try {
      await axios.patch('/api/tasks', { id: task._id, status: 'done' });
      const gain = calculatePotentialMomentum({
        id: task._id,
        title: task.title,
        estimated_time_minutes: task.estimatedTime,
        urgency_score: task.urgency ?? 5,
        importance_score: task.importance ?? 5
      });
      setMomentum(m => Math.min(100, m + gain));
      setCurrentTask(null);
      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const skipTask = async (task: TaskItem) => {
    try {
      await axios.patch('/api/tasks', { id: task._id, status: 'skipped' });
      setMomentum(m => Math.max(0, m - 5));
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
      <VantaBackground />
      <div className="fixed inset-0 synth-grid pointer-events-none opacity-20 z-0"></div>

      <header className="relative z-20 border-b border-white/5 bg-base-100/25 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-2xl neon-border-primary">
                <Zap className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/45">Mission Control</p>
                <span className="font-black text-2xl tracking-tighter neon-text-primary italic">SNOWBALL</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="score-chip px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Points</p>
                <div className="mt-1 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span className="font-black text-lg text-white">{points}</span>
                </div>
              </div>
              <button onClick={toggleTheme} className="btn btn-circle btn-sm btn-ghost border border-white/10 bg-base-100/25 hover:bg-white/10">
                <span suppressHydrationWarning>
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </span>
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="score-chip px-4 py-4">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Momentum Tier</p>
                  <p className="text-lg font-black text-white">{momentumTier}</p>
                </div>
              </div>
            </div>
            <div className="score-chip px-4 py-4">
              <div className="flex items-center gap-3">
                <Crosshair className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Pending Missions</p>
                  <p className="text-lg font-black text-white">{missionCount}</p>
                </div>
              </div>
            </div>
            <div className="score-chip px-4 py-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Focus Protocol</p>
                  <p className="text-lg font-black text-white">Single-task attack</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="relative z-10 flex justify-center mt-8 px-4">
        <div className="flex bg-base-200/45 backdrop-blur-md p-1.5 rounded-3xl border border-white/10">
          <button 
            onClick={() => setActiveTab('focus')}
            className={`btn btn-sm sm:btn-md gap-2 rounded-xl transition-all duration-300 ${activeTab === 'focus' ? 'btn-primary neon-border-primary' : 'btn-ghost'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Focus
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`btn btn-sm sm:btn-md gap-2 rounded-xl transition-all duration-300 ${activeTab === 'tasks' ? 'btn-primary neon-border-primary' : 'btn-ghost'}`}
          >
            <List className="w-4 h-4" />
            My Tasks
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`btn btn-sm sm:btn-md gap-2 rounded-xl transition-all duration-300 ${activeTab === 'create' ? 'btn-primary neon-border-primary' : 'btn-ghost'}`}
          >
            <PlusCircle className="w-4 h-4" />
            Create
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center p-4 w-full pt-10 overflow-y-auto">
        
        <div className="mission-frame w-full max-w-6xl rounded-[2rem] px-5 py-5 mb-10">
          <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Combat Meter</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Momentum at <span className="neon-text-primary">{momentum}%</span>
              </h2>
              <p className="mt-2 text-sm font-medium text-white/60">Every completed task feeds the streak. Skips cool it off.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="score-chip px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Rank</p>
                <p className="mt-1 text-xl font-black text-white">{points}</p>
              </div>
              <div className="score-chip px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Queue</p>
                <p className="mt-1 text-xl font-black text-white">{missionCount}</p>
              </div>
              <div className="score-chip px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Mode</p>
                <p className="mt-1 text-xl font-black text-white">{activeTab}</p>
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
          {/* FOCUS TAB */}
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
                  <div className="mission-frame rounded-[2.5rem] px-6 py-10 text-center sm:px-10 sm:py-14">
                  <h2 className="text-5xl sm:text-7xl font-black mb-6 neon-text-primary italic tracking-tighter uppercase">Press Start.</h2>
                  <p className="text-xl opacity-60 mb-12 font-medium tracking-widest uppercase">Your next best move is one hit away.</p>
                  
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
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-xl glass-card rounded-[2.5rem] p-12 text-center relative border-primary/30 mx-auto"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary rounded-full neon-border-primary">
                    <span className="text-xs font-black uppercase tracking-widest text-white">Active Objective</span>
                  </div>
                  
                  <h3 className="text-4xl font-black mb-8 leading-tight neon-text-primary uppercase">
                    {currentTask.title}
                  </h3>
                  
                  <div className="flex justify-center items-center gap-8 mb-12 opacity-80">
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

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-4xl mx-auto"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black neon-text-primary italic uppercase tracking-tighter">Mission Log</h2>
                    <span className="badge badge-primary font-black italic border-none px-4 py-4">{tasks.length} PENDING</span>
                </div>

                {tasks.length === 0 ? (
                    <div className="glass-card rounded-3xl p-16 text-center opacity-70 border-white/5 mx-auto max-w-2xl">
                        <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6 border border-primary/20">
                            <AlertCircle className="w-12 h-12 text-primary" />
                        </div>
                        <p className="text-2xl font-black italic mb-2 uppercase">No active missions found.</p>
                        <p className="text-sm opacity-60 mb-8 uppercase tracking-widest">Initialize a new goal to begin your climb.</p>
                        <button onClick={() => setActiveTab('create')} className="btn btn-primary btn-md rounded-xl italic font-black">INITIALIZE GOAL</button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <div key={task._id} className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-primary/50 transition-all group hover:bg-white/5">
                                <div className="flex items-center gap-4 w-full">
                                    <div className={`p-4 rounded-xl bg-primary/10 border border-primary/20 group-hover:neon-border-primary transition-all`}>
                                        <Zap className="w-5 h-5 text-primary fill-current" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="text-xl font-black group-hover:neon-text-primary transition-all uppercase tracking-tight">{task.title}</h4>
                                        <div className="flex gap-4 mt-1 opacity-60 text-xs font-black uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.estimatedTime}m</span>
                                            <span className="flex items-center gap-1 text-secondary"><Sparkles className="w-3 h-3" /> Impact: {(task.importance || 5) * (task.urgency || 5)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => markDone(task)} className="btn btn-primary btn-sm px-6 italic font-black rounded-lg">DONE</button>
                                    <button onClick={() => skipTask(task)} className="btn btn-ghost btn-sm px-4 italic font-black opacity-40 hover:opacity-100 rounded-lg">SKIP</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
          )}

          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <motion.div 
              key="create"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="flex justify-center mb-10">
                <div className="tabs tabs-boxed bg-base-200/50 backdrop-blur-md p-1 border border-white/5 rounded-xl">
                    <button 
                        onClick={() => setCreationMode('ai')}
                        className={`tab tab-lg gap-2 rounded-lg font-black transition-all ${creationMode === 'ai' ? 'tab-active bg-primary text-white' : 'opacity-60'}`}
                    >
                        <Sparkles className="w-4 h-4" /> AI BRAINSTORM
                    </button>
                    <button 
                        onClick={() => setCreationMode('manual')}
                        className={`tab tab-lg gap-2 rounded-lg font-black transition-all ${creationMode === 'manual' ? 'tab-active bg-primary text-white' : 'opacity-60'}`}
                    >
                        <List className="w-4 h-4" /> MANUAL INPUT
                    </button>
                </div>
              </div>

              {creationMode === 'ai' ? (
                <div className="glass-card p-10 rounded-[2rem] border-primary/20">
                    <h2 className="text-2xl font-black mb-6 italic neon-text-primary">DUMP YOUR BRAIN</h2>
                    <p className="text-sm opacity-60 mb-6 font-medium uppercase tracking-widest">Type your overwhelming thoughts and let Gemini divide them.</p>
                    <textarea 
                        className="textarea textarea-bordered textarea-lg w-full h-48 mb-8 bg-base-100/30 border-white/10 focus:border-primary text-xl leading-relaxed"
                        placeholder="e.g., I need to launch my website, clean the garage, and find a gift for my friend's birthday..."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                    <button 
                        className="btn btn-primary btn-block btn-lg rounded-2xl h-16 shadow-lg shadow-primary/20 font-black italic text-xl"
                        onClick={handleAIGenerate}
                        disabled={!goal || isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'EXECUTE SNOWBALL'}
                        <Sparkles className="w-5 h-5 ml-2" />
                    </button>
                </div>
              ) : (
                <form onSubmit={handleManualCreate} className="glass-card p-10 rounded-[2rem] border-primary/20">
                    <h2 className="text-2xl font-black mb-8 italic neon-text-primary uppercase tracking-tight">New Mission Objective</h2>
                    
                    <div className="grid gap-8">
                        <div className="form-control">
                            <label className="label uppercase tracking-widest text-xs font-black opacity-60">Task Title</label>
                            <input 
                                required
                                className="input input-bordered bg-base-100/30 border-white/10 focus:border-primary text-lg"
                                value={manualTask.title}
                                onChange={(e) => setManualTask({...manualTask, title: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label uppercase tracking-widest text-xs font-black opacity-60">Importance</label>
                                <select 
                                    className="select select-bordered bg-base-100/30 border-white/10 focus:border-primary"
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
                                <label className="label uppercase tracking-widest text-xs font-black opacity-60">Estimated Time (Min)</label>
                                <input 
                                    type="number"
                                    className="input input-bordered bg-base-100/30 border-white/10 focus:border-primary"
                                    value={manualTask.estimatedTime}
                                    onChange={(e) => setManualTask({...manualTask, estimatedTime: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label uppercase tracking-widest text-xs font-black opacity-60 font-medium flex gap-2"><Calendar className="w-4 h-4" /> Deadline (Optional)</label>
                            <input 
                                type="date"
                                className="input input-bordered bg-base-100/30 border-white/10 focus:border-primary"
                                value={manualTask.deadline}
                                onChange={(e) => setManualTask({...manualTask, deadline: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit"
                            className="btn btn-primary btn-block btn-lg rounded-2xl h-16 shadow-lg shadow-primary/20 font-black italic text-xl mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'INITIALIZE MISSION'}
                            <Zap className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="glass-card text-center p-12 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.4)] border-primary neon-border-primary">
              <Trophy className="w-20 h-20 text-warning mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,165,0,0.5)]" />
              <h1 className="text-5xl font-black neon-text-primary italic tracking-tighter mb-2">MOMENTUM CRITICAL!</h1>
              <p className="font-black text-xl uppercase tracking-widest opacity-80">+1 RANK ACHIEVED</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
