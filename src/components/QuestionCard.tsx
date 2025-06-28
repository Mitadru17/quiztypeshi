import React from 'react';
import { Question } from '../types/Question';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionNumber,
  totalQuestions
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-neutral-100 rounded-full mb-6">
            <div 
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
      </div>

      {/* Question Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
          Question {questionNumber} of {totalQuestions}
        </h2>
        <div className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-medium self-start sm:self-center">
          C Programming
          </div>
        </div>
        
      {/* Question Text */}
      <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
        <p className="text-base sm:text-lg text-neutral-800 font-medium">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 sm:space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(option)}
            className={`w-full min-h-[3.5rem] p-4 rounded-xl border-2 transition-all duration-200 
              flex items-center gap-4
              hover:border-primary-200 hover:bg-primary-50 
              active:scale-[0.99] 
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              touch-manipulation
              ${
              selectedAnswer === option
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-700'
            }`}
          >
            <div 
              className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 
                flex items-center justify-center flex-shrink-0 
                transition-colors duration-200
                ${
                  selectedAnswer === option
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-neutral-300'
                }`}
            >
                {selectedAnswer === option && (
                <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                )}
            </div>
            <span className="text-left text-base sm:text-sm flex-1 font-medium">
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;