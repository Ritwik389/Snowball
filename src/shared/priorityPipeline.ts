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

  // 2. Score and Sort using Eisenhower Matrix with deadline urgency
  const now = new Date();
  const scoredTasks = feasibleTasks.map(task => {
    // Calculate deadline urgency (0-10): how soon is the deadline?
    let deadlineUrgency = task.urgency_score; // base on urgency_score
    if (task.deadline) {
      const timeUntilDeadline = new Date(task.deadline).getTime() - now.getTime();
      const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
      
      // Past deadline = CRITICAL
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

  // Sort by score (descending), then by time (ascending), then by importance (descending), then by creation date (ascending) for ties
  scoredTasks.sort((a, b) => {
    // 1. Eisenhower score (highest first)
    const scoreDiff = (b.eisenhower_score || 0) - (a.eisenhower_score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    
    // 2. Estimated time (shortest first)
    const timeDiff = a.estimated_time_minutes - b.estimated_time_minutes;
    if (timeDiff !== 0) return timeDiff;
    
    // 3. Importance score (highest first)
    const importanceDiff = (b.importance_score || 0) - (a.importance_score || 0);
    if (importanceDiff !== 0) return importanceDiff;
    
    // 4. Creation date (oldest first)
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    return 0; // Identical tasks
  });

  return scoredTasks[0];
}

export function calculatePotentialMomentum(task: SubTask): number {
  // Simple multiplier for now: base 10 + score/2
  const score = (task.urgency_score * task.importance_score) || 0;
  return Math.min(25, 10 + (score / 4));
}
