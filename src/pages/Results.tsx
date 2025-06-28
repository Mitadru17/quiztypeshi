import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, Home, RotateCcw, Timer, AlertCircle, PieChart, BarChart, History, Download } from 'lucide-react';
import { QuizAnswer } from '../types/Question';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { getQuizResults } from '../services/quiz';
import { QuizResult } from '../types/Result';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResultPDF from '../components/ResultPDF';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ResultsState {
  id: string;
  score: number;
  answers: QuizAnswer[];
  totalQuestions: number;
  timeSpent: number;
  timestamp: Date;
}

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousResults, setPreviousResults] = useState<QuizResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ResultsState | null>(null);
  
  // Get state from location and parse timestamp
  const state = location.state ? {
    ...location.state,
    timestamp: location.state.timestamp ? new Date(location.state.timestamp) : new Date()
  } as ResultsState : null;

  useEffect(() => {
    // Check authentication first
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    // Load previous results
    const loadPreviousResults = async () => {
      try {
        if (user) {
          const results = await getQuizResults(user.email!);
          setPreviousResults(results);
          
          // If no current result, show the most recent one
          if (!state && results.length > 0) {
            const latestResult = results[0];
            setSelectedResult({
              id: latestResult.id,
              score: latestResult.score,
              answers: latestResult.answers,
              totalQuestions: latestResult.totalQuestions,
              timeSpent: latestResult.timeSpent,
              timestamp: latestResult.timestamp
            });
          }
        }
      } catch (error) {
        console.error('Error loading previous results:', error);
        setError('Failed to load previous results');
      }
    };

    loadPreviousResults();
  }, [user, loading, state, navigate]);

  // Use either the current quiz result or selected previous result
  const currentResult = selectedResult || state;

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (!currentResult) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">No Results Found</h1>
          <p className="text-neutral-600 mb-8">You haven't taken any quizzes yet.</p>
          <Link to="/quiz" className="btn-primary">
            Take a Quiz
          </Link>
        </div>
      </div>
    );
  }

  const { score, answers, totalQuestions, timeSpent, timestamp } = currentResult;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-success-100';
    if (score >= 60) return 'bg-warning-100';
    return 'bg-error-100';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! You have a strong understanding of C programming concepts.';
    if (score >= 60) return 'Good job! Keep practicing to improve your C programming skills.';
    return 'Keep learning! Review the concepts and try again to improve your score.';
  };

  const getAccuracyByTopic = () => {
    const topics: { [key: string]: { correct: number; total: number } } = {};
    
    answers.forEach(answer => {
      // Simple topic extraction based on question text
      const topic = answer.questionText.toLowerCase().includes('struct') ? 'Structures' :
                    answer.questionText.toLowerCase().includes('pointer') ? 'Pointers' :
                    answer.questionText.toLowerCase().includes('function') ? 'Functions' :
                    'Other Concepts';
      
      if (!topics[topic]) {
        topics[topic] = { correct: 0, total: 0 };
      }
      
      topics[topic].total++;
      if (answer.isCorrect) {
        topics[topic].correct++;
      }
    });

    return topics;
  };

  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [correctCount, incorrectCount],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderColor: ['#dcfce7', '#fee2e2'],
        borderWidth: 1,
      },
    ],
  };

  const topicsData = getAccuracyByTopic();
  const barChartData = {
    labels: Object.keys(topicsData),
    datasets: [
      {
        label: 'Accuracy by Topic',
        data: Object.values(topicsData).map(topic => (topic.correct / topic.total) * 100),
        backgroundColor: '#3b82f6',
        borderColor: '#bfdbfe',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Previous Results Dropdown */}
        {previousResults.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">Previous Results</h2>
              <select
                className="form-select rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                value={currentResult.id}
                onChange={(e) => {
                  const result = previousResults.find(r => r.id === e.target.value);
                  if (result) {
                    setSelectedResult({
                      id: result.id,
                      score: result.score,
                      answers: result.answers,
                      totalQuestions: result.totalQuestions,
                      timeSpent: result.timeSpent,
                      timestamp: result.timestamp
                    });
                  }
                }}
              >
                {previousResults.map((result) => (
                  <option key={result.id} value={result.id}>
                    {new Date(result.timestamp).toLocaleDateString()} - Score: {result.score}%
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Score Summary */}
        <div className="card mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(score)} mb-6`}>
              <Trophy className={`h-10 w-10 ${getScoreColor(score)}`} />
            </div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Quiz Result</h1>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className="text-neutral-600 mb-8 max-w-lg mx-auto">
              {getScoreMessage(score)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-neutral-100 rounded-xl p-4">
                <div className="text-2xl font-bold text-neutral-800">{totalQuestions}</div>
                <div className="text-sm text-neutral-600">Total Questions</div>
              </div>
              <div className="bg-success-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-success-600">{correctCount}</div>
                <div className="text-sm text-success-600">Correct</div>
              </div>
              <div className="bg-error-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-error-600">{incorrectCount}</div>
                <div className="text-sm text-error-600">Incorrect</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 text-neutral-600 mb-8">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5" />
                <span>Time taken: {formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Date: {timestamp.toLocaleDateString()}</span>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Overall Performance</h3>
                <div className="w-full max-w-xs mx-auto">
                  <Pie data={pieChartData} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Topic-wise Accuracy</h3>
                <Bar 
                  data={barChartData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(tickValue: number | string): string {
                            return `${tickValue}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn-secondary mb-8"
            >
              {showDetails ? 'Hide Details' : 'Show Detailed Review'}
            </button>
          </div>
        </div>

        {/* Detailed Answer Review */}
        {showDetails && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6">Detailed Review</h2>
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <div 
                key={answer.questionId} 
                  className={`p-6 rounded-xl border ${
                  answer.isCorrect 
                      ? 'border-success-200 bg-success-50'
                      : 'border-error-200 bg-error-50'
                }`}
              >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-neutral-600">
                        Question {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        answer.isCorrect 
                        ? 'bg-success-100 text-success-700'
                        : 'bg-error-100 text-error-700'
                      }`}>
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    
                  <p className="text-neutral-800 font-medium mb-4">
                    {answer.questionText}
                  </p>

                  <div className="grid gap-2">
                    {answer.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg flex items-center space-x-2 ${
                          option === answer.correct
                            ? 'bg-success-100 text-success-700'
                            : option === answer.selected && !answer.isCorrect
                            ? 'bg-error-100 text-error-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {option === answer.correct && (
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        )}
                        {option === answer.selected && !answer.isCorrect && (
                          <XCircle className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span>{option}</span>
                      </div>
                    ))}
                      </div>
                      
                      {!answer.isCorrect && (
                    <div className="mt-4 flex items-start space-x-2 text-sm">
                      <AlertCircle className="h-5 w-5 text-warning-500 flex-shrink-0" />
                      <p className="text-neutral-600">
                        The correct answer was <span className="font-medium text-success-600">{answer.correct}</span>
                      </p>
                        </div>
                      )}
                    </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Overview */}
        <div className="bg-white rounded-2xl shadow-soft-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <Trophy className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">Quiz Results</h1>
                <p className="text-neutral-600">{timestamp.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <PDFDownloadLink
                document={
                  <ResultPDF
                    score={score}
                    answers={answers}
                    totalQuestions={totalQuestions}
                    timeSpent={timeSpent}
                    timestamp={timestamp}
                    userName={user?.displayName || user?.email?.split('@')[0] || 'User'}
                  />
                }
                fileName={`quiz-result-${timestamp.toISOString().split('T')[0]}.pdf`}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
              >
                {({ blob, url, loading, error }) => (
                  <>
                    <Download className="h-5 w-5" />
                    <span>{loading ? 'Generating PDF...' : 'Download PDF'}</span>
                  </>
                )}
              </PDFDownloadLink>
              
              <Link
                to="/quiz"
                className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors font-medium"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Try Again</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${getScoreBgColor(score)} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800">Score</h3>
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
              </div>
              <p className="text-sm text-neutral-600">{getScoreMessage(score)}</p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800">Time</h3>
                <Timer className="h-5 w-5 text-neutral-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">{formatTime(timeSpent)}</p>
                  </div>

            <div className="bg-neutral-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800">Questions</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success-600" />
                  <span className="font-bold text-success-600">{correctCount}</span>
                  <span className="text-neutral-300">/</span>
                  <XCircle className="h-5 w-5 text-error-600" />
                  <span className="font-bold text-error-600">{incorrectCount}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-800">{totalQuestions} Total</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-secondary"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;