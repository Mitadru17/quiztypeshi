import { QuizAnswer } from './Question';

export interface QuizResult {
  id: string;
  userEmail: string;
  userName?: string;
  score: number;
  answers: QuizAnswer[];
  timestamp: Date;
  totalQuestions: number;
  timeSpent: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}