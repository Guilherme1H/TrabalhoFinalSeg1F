export type MealType = 'Café' | 'Almoço' | 'Lanche' | 'Jantar' | 'Ceia';

export interface Meal {
  id: string;
  date: string;
  description: string;
  calories: number;
  type: MealType;
}

export interface FastingSession {
  id: string;
  startTime: string;
  endTime?: string;
  plannedType: string;
  durationHours?: number;
}

export interface User {
  id: string;
  email: string;
  dailyGoal: number;
}