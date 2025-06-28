export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizAnswer {
  questionId: string;
  questionText: string;
  options: string[];
  selected: string;
  correct: string;
  isCorrect: boolean;
}