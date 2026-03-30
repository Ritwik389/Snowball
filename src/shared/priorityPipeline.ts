import { SubTask } from './types';

export function getPriorityTask(tasks: SubTask[], availableTimeMinutes: number): SubTask | null {
  if (!tasks || tasks.length === 0) return null;

  const feasibleTasks = tasks.filter(task => task.estimated_time_minutes <= availableTimeMinutes);

  if (feasibleTasks.length === 0) return null;

  const now = new Date();
  const scoredTasks = feasibleTasks.map(task => {
    let deadlineUrgency = task.urgency_score;
    if (task.deadline) {
      const timeUntilDeadline = new Date(task.deadline).getTime() - now.getTime();
      const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
      
      if (hoursUntilDeadline < 0) {
        deadlineUrgency = 10;
      } else if (hoursUntilDeadline <= 1) {
        deadlineUrgency = Math.max(deadlineUrgency, 10);
      } else if (hoursUntilDeadline <= 4) {
        deadlineUrgency = Math.max(deadlineUrgency, 8);
      } else if (hoursUntilDeadline <= 24) {
        deadlineUrgency = Math.max(deadlineUrgency, 7);
      }
    }
    
    return {
      ...task,
      urgency_score: deadlineUrgency,
      eisenhower_score: deadlineUrgency * task.importance_score
    };
  });

  scoredTasks.sort((a, b) => {
    const scoreDiff = (b.eisenhower_score || 0) - (a.eisenhower_score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    
    const timeDiff = a.estimated_time_minutes - b.estimated_time_minutes;
    if (timeDiff !== 0) return timeDiff;
    
    const importanceDiff = (b.importance_score || 0) - (a.importance_score || 0);
    if (importanceDiff !== 0) return importanceDiff;
    
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    return 0;
  });

  return scoredTasks[0];
}

export function calculatePotentialMomentum(task: SubTask): number {
  const score = (task.urgency_score * task.importance_score) || 0;
  return Math.min(25, 10 + (score / 4));
}
