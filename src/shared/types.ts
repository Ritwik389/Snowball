export interface SubTask {
  id: string;
  title: string;
  estimated_time_minutes: number;
  urgency_score: number; // 1-10
  importance_score: number; // 1-10
  deadline?: Date;
  created_at?: Date;
  eisenhower_score?: number;
}

export interface UserProgress {
  userId: string;
  momentum: number; // 0-100
  points: number;
  lastUpdated: Date;
}
