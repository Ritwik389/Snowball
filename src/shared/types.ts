export interface SubTask {
  id: string;
  title: string;
  estimated_time_minutes: number;
  urgency_score: number;
  importance_score: number;
  deadline?: Date;
  created_at?: Date;
  eisenhower_score?: number;
}

export interface UserProgress {
  userId: string;
  momentum: number;
  points: number;
  lastUpdated: Date;
}
