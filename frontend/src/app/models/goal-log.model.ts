export enum GoalType {
  WEIGHT_GAIN = 'WEIGHT_GAIN',
  WEIGHT_LOSS = 'WEIGHT_LOSS'
}

export interface GoalLog {
  id?: number;
  userId?: number;
  goalType: GoalType;
  description: string;
  currentWeight: number;
  targetWeight: number;
  startDate: string;
  targetEndDate: string;
  progress?: number;
  suggestion?: string;
}