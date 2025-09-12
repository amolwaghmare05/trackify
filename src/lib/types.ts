export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
}
