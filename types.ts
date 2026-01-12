
export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 0
}

export interface DailyMethod {
  day: DayOfWeek;
  title: string;
  steps: string[];
  instruction: string;
}

export interface AccessCode {
  key: string;
  expiry: number;
  createdAt: number;
  description: string;
  isActive: boolean;
}

export interface WeekData {
  id: number;
  title: string;
  objective: string;
  internalFocus: string;
  tasks: string[];
  sessionStructure: string[];
}

export interface PhaseData {
  id: number;
  title: string;
  weeksRange: string;
  description: string;
  weeks: WeekData[];
}

export type ViewType = 'dashboard' | 'session' | 'stats' | 'syllabus' | 'admin';

export interface UserProgress {
  name: string;
  accessCode: string;
  completedWeekIds: number[];
  isAdmin: boolean;
}
