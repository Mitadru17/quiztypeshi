import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ChevronLeft, ChevronRight, Send, Timer, AlertCircle } from 'lucide-react';
import { auth } from '../services/firebase';
import { generateQuestions, saveQuizResult, saveQuizState, getQuizState, clearQuizState } from '../services/quiz';
import { Question, QuizAnswer } from '../types/Question';
import QuestionCard from '../components/QuestionCard';

const QUIZ_TIME_LIMIT = 30 * 60; // 30 minutes in seconds

const Quiz: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load saved quiz state
  useEffect(() => {
    const savedState = getQuizState();
    if (savedState) {
      setQuestions(savedState.questions);
      setAnswers(savedState.answers);
      setCurrentQuestionIndex(savedState.currentQuestionIndex);
      setTimeLeft(savedState.timeLeft);
      setQuizStarted(true);
      setStartTime(savedState.startTime);
    }
  }, []);

  // Save quiz state when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && quizStarted) {
        saveQuizState({
          questions,
          answers,
          currentQuestionIndex,
          timeLeft,
          startTime
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quizStarted, questions, answers, currentQuestionIndex, timeLeft, startTime]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 300 && !showTimeWarning) {
          setShowTimeWarning(true);
        }
        if (newTime <= 0) {
          submitQuiz();
          return 0;
        }
        
        // Save state every minute
        if (newTime % 60 === 0) {
          saveQuizState({
            questions,
            answers,
            currentQuestionIndex,
            timeLeft: newTime,
            startTime
          });
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, questions, answers, currentQuestionIndex, startTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startQuiz = async () => {
    try {
      const generatedQuestions = await generateQuestions();
      const startTimeMs = Date.now();
      setQuestions(generatedQuestions);
      setQuizStarted(true);
      setTimeLeft(QUIZ_TIME_LIMIT);
      setStartTime(startTimeMs);
      
      // Save initial state
      saveQuizState({
        questions: generatedQuestions,
        answers: {},
        currentQuestionIndex: 0,
        timeLeft: QUIZ_TIME_LIMIT,
        startTime: startTimeMs
      });
    } catch (error) {
      console.error('Error generating questions:', error);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestionIndex].id]: answer
    };
    setAnswers(newAnswers);
    
    // Save state after answer
    saveQuizState({
      questions,
      answers: newAnswers,
      currentQuestionIndex,
      timeLeft,
      startTime
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // Save state after navigation
      saveQuizState({
        questions,
        answers,
        currentQuestionIndex: newIndex,
        timeLeft,
        startTime
      });
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // Save state after navigation
      saveQuizState({
        questions,
        answers,
        currentQuestionIndex: newIndex,
        timeLeft,
        startTime
      });
    }
  };

  const submitQuiz = async () => {
    if (!user || submitting) {
      console.log('Submission blocked:', { user: !!user, submitting });
      return;
    }

    setSubmitting(true);
    try {
      console.log('Starting quiz submission...', {
        userEmail: user.email,
        userName: user.displayName,
        questionsCount: questions.length,
        answersCount: Object.keys(answers).length
      });
      
      const quizAnswers: QuizAnswer[] = questions.map(question => ({
        questionId: question.id,
        questionText: question.question,
        options: question.options,
        selected: answers[question.id] || '',
        correct: question.correctAnswer,
        isCorrect: answers[question.id] === question.correctAnswer
      }));

      console.log('Prepared quiz answers:', {
        totalAnswers: quizAnswers.length,
        correctAnswers: quizAnswers.filter(a => a.isCorrect).length
      });

      const score = Math.round((quizAnswers.filter(a => a.isCorrect).length / questions.length) * 100);
      const timeSpent = QUIZ_TIME_LIMIT - timeLeft;

      console.log('Saving quiz result to Firebase...', {
        score,
        timeSpent,
        timestamp: new Date().toISOString()
      });

      const resultId = await saveQuizResult({
        userEmail: user.email!,
        userName: user.displayName || undefined,
        score,
        answers: quizAnswers,
        timestamp: new Date(),
        totalQuestions: questions.length,
        timeSpent
      });
      console.log('Quiz result saved with ID:', resultId);

      // Clear quiz state before navigation
      clearQuizState();

      // Prepare navigation state
      const navigationState = { 
        id: resultId,
        score, 
        answers: quizAnswers, 
        totalQuestions: questions.length,
        timeSpent,
        timestamp: new Date()
      };
      
      console.log('Navigating to results with state:', navigationState);
      
      // Navigate to results with the complete data
      navigate('/results', { 
        state: navigationState,
        replace: true // Use replace to prevent going back to the quiz
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setSubmitting(false);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Timer and Warning */}
      <div className="fixed top-16 left-0 right-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Timer Display */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center rounded-lg px-3 py-1.5 ${
                timeLeft <= 300 
                  ? 'bg-red-50 text-red-600' 
                  : timeLeft <= 600 
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-blue-50 text-blue-600'
              }`}>
                <Timer className="w-5 h-5 mr-2" />
                <span className="font-mono text-lg font-medium tabular-nums">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="hidden sm:block text-sm text-neutral-600">
                Time Remaining
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-neutral-600">
                Question {currentQuestionIndex + 1}/15
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-600">
                <span className="font-medium text-primary-600">
                  {Object.keys(answers).length}
                </span> 
                answered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Toast for Low Time */}
      {showTimeWarning && (
        <div className="fixed top-32 left-0 right-0 z-50 animate-slide-down">
          <div className="max-w-md mx-auto m-4">
            <div className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg shadow-lg border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">5 minutes remaining!</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 pt-32 pb-20 sm:pb-16">
        {!quizStarted ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-6 text-center">
            {/* Timer Info Card */}
            <div className="w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-4">
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                  <Timer className="w-8 h-8 text-primary-600 mb-2" />
                  <span className="text-lg font-medium text-neutral-800">
                    {QUIZ_TIME_LIMIT / 60} Minutes
                  </span>
                  <span className="text-sm text-neutral-600">Time Limit</span>
                </div>
                <div className="h-12 w-px bg-neutral-200"></div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                    <span className="text-primary-600 font-medium">15</span>
                  </div>
                  <span className="text-lg font-medium text-neutral-800">Questions</span>
                  <span className="text-sm text-neutral-600">To Answer</span>
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">
              Ready to start your C Programming Quiz?
            </h1>
            <p className="text-neutral-600">
              Make sure you're in a quiet place and won't be disturbed.
            </p>
            <button
              onClick={startQuiz}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium
                hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                transition-colors duration-200"
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {questions.length > 0 && (
        <QuestionCard
                question={questions[currentQuestionIndex]}
                selectedAnswer={answers[questions[currentQuestionIndex].id] || ''}
          onAnswerSelect={handleAnswerSelect}
          questionNumber={currentQuestionIndex + 1}
                totalQuestions={15}
              />
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {quizStarted && questions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200
                  ${currentQuestionIndex === 0
                    ? 'text-neutral-400 bg-neutral-100'
                    : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300'
                  }`}
          >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
          </button>

              <div className="flex-1 sm:flex-none">
            <button
              onClick={submitQuiz}
                  disabled={submitting || Object.keys(answers).length !== 15}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium
                    transition-colors duration-200
                    ${submitting || Object.keys(answers).length !== 15
                      ? 'bg-neutral-100 text-neutral-400'
                      : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800'
                    }`}
            >
                  <Send className="w-5 h-5" />
                  <span>Submit Quiz</span>
            </button>
              </div>

            <button
              onClick={goToNextQuestion}
                disabled={currentQuestionIndex === 14}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200
                  ${currentQuestionIndex === 14
                    ? 'text-neutral-400 bg-neutral-100'
                    : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300'
                  }`}
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;