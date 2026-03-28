import { SubTask } from './types';

/**
 * Priority Pipeline Utility
 * 1. Filters tasks by user's available time.
 * 2. Calculates Eisenhower score: urgency * importance.
 * 3. Returns the top-scoring task.
 */
export function getPriorityTask(tasks: SubTask[], availableTimeMinutes: number): SubTask | null {
  if (!tasks || tasks.length === 0) return null;

  // 1. Filter by time
  const feasibleTasks = tasks.filter(task => task.estimated_time_minutes <= availableTimeMinutes);

  if (feasibleTasks.length === 0) return null;

  // 2. Score and Sort
  const scoredTasks = feasibleTasks.map(task => ({
    ...task,
    eisenhower_score: task.urgency_score * task.importance_score
  }));

  // Sort by score (descending), then by time (ascending) for ties
  scoredTasks.sort((a, b) => {
    const diff = (b.eisenhower_score || 0) - (a.eisenhower_score || 0);
    if (diff !== 0) return diff;
    return a.estimated_time_minutes - b.estimated_time_minutes;
  });

  return scoredTasks[0];
}

export function calculatePotentialMomentum(task: SubTask): number {
  // Simple multiplier for now: base 10 + score/2
  const score = (task.urgency_score * task.importance_score) || 0;
  return Math.min(25, 10 + (score / 4));
}
