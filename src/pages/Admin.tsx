import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Download, Search, ChevronDown, ChevronUp, Eye, Calendar, Clock, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { auth } from '../services/firebase';
import { getAllResults, exportResultsToCSV, isAdminUser, getQuizResultById, deleteUserResults, deleteAllResults } from '../services/quiz';
import { QuizResult } from '../types/Result';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AdminResultsPDF from '../components/AdminResultsPDF';

const isValidQuizResult = (result: QuizResult | null): result is QuizResult => {
  return result !== null && 'userEmail' in result;
};

const Admin: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof QuizResult>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdminUser(user.email!)) {
      navigate('/');
        return;
      }
      loadResults();
    }
  }, [user, loading, navigate]);

  const loadResults = async () => {
    try {
      const allResults = await getAllResults();
      setResults(allResults);
      setFilteredResults(allResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = results.filter(result => 
      result.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      result.score.toString().includes(searchTerm)
    );
    setFilteredResults(filtered);
  }, [searchTerm, results]);

  const handleSort = (field: keyof QuizResult) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }

    const sorted = [...filteredResults].sort((a, b) => {
      if (field === 'timestamp') {
        return sortAsc 
          ? a[field].getTime() - b[field].getTime()
          : b[field].getTime() - a[field].getTime();
      }
      return sortAsc
        ? a[field] > b[field] ? 1 : -1
        : b[field] > a[field] ? 1 : -1;
    });
    setFilteredResults(sorted);
  };

  const handleViewResult = async (resultId: string) => {
    try {
      const result = await getQuizResultById(resultId);
      if (result) {
        setSelectedResult(result);
      }
    } catch (error) {
      console.error('Error fetching result:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleDeleteUserResults = async (userEmail: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteUserResults(userEmail);
      await loadResults(); // Reload the results after deletion
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user results:', error);
      setDeleteError('Failed to delete user results. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllResults = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAllResults();
      await loadResults(); // Reload the results after deletion
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Error deleting all results:', error);
      setDeleteError('Failed to delete all results. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {deleteError && (
          <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
            {deleteError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4 sm:mb-0">
            Quiz Results Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <PDFDownloadLink
              document={
                <AdminResultsPDF
                  results={results}
                  exportDate={new Date()}
                />
              }
              fileName={`quiz-results-${new Date().toISOString().split('T')[0]}.pdf`}
              className="btn-primary"
            >
              {({ blob, url, loading, error }) => (
                <>
                  {loading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Generating PDF...' : 'Export to PDF'}
                </>
              )}
            </PDFDownloadLink>

            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="btn-error"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5 mr-2" />
              )}
              Clear All Data
            </button>
          </div>
        </div>

        {/* Delete All Confirmation Modal */}
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4 text-error-600">
                <AlertTriangle className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">Delete All Data</h2>
              </div>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete all quiz results? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="btn-secondary"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllResults}
                  className="btn-error"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete All'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email or score..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Results Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500 cursor-pointer"
                      onClick={() => handleSort('userEmail')}>
                    <div className="flex items-center">
                      User
                      {sortField === 'userEmail' && (
                        sortAsc ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500 cursor-pointer"
                      onClick={() => handleSort('score')}>
                    <div className="flex items-center">
                      Score
                      {sortField === 'score' && (
                        sortAsc ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">Questions</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500 cursor-pointer"
                      onClick={() => handleSort('timestamp')}>
                    <div className="flex items-center">
                      Date
                      {sortField === 'timestamp' && (
                        sortAsc ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-neutral-800">
                          {result.userName || (result.userEmail && result.userEmail.split('@')[0]) || 'Anonymous User'}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {result.userEmail || 'No email provided'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.score >= 80 ? 'bg-success-100 text-success-800' :
                        result.score >= 60 ? 'bg-warning-100 text-warning-800' :
                        'bg-error-100 text-error-800'
                      }`}>
                        {result.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {result.answers.filter(a => a.isCorrect).length} / {result.totalQuestions}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {formatDate(result.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewResult(result.id)}
                          className="text-primary-600 hover:text-primary-700"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(result.userEmail)}
                          className="text-error-600 hover:text-error-700"
                          title="Delete User Data"
                          disabled={isDeleting}
                        >
                          {isDeleting && showDeleteConfirm === result.userEmail ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {/* Delete User Confirmation Modal */}
                      {showDeleteConfirm === result.userEmail && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center mb-4 text-error-600">
                              <AlertTriangle className="h-6 w-6 mr-2" />
                              <h2 className="text-xl font-bold">Delete User Data</h2>
                            </div>
                            <p className="text-neutral-600 mb-6">
                              Are you sure you want to delete all quiz results for {result.userName || result.userEmail}? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-4">
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="btn-secondary"
                                disabled={isDeleting}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDeleteUserResults(result.userEmail)}
                                className="btn-error"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Result Details Modal */}
        {isValidQuizResult(selectedResult) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                      Quiz Result Details
                    </h2>
                    <div>
                      <div className="text-lg font-medium text-neutral-800">
                        {selectedResult.userName || selectedResult.userEmail.split('@')[0]}
                      </div>
                      <div className="text-neutral-600">
                        {selectedResult.userEmail}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center text-neutral-600 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(selectedResult.timestamp)}
                    </div>
                    <div className="flex items-center text-neutral-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Time taken: {formatTime(selectedResult.timeSpent)}
              </div>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">
                      Score: {selectedResult.score}%
                    </div>
                    <div className="text-neutral-600">
                      {selectedResult.answers.filter(a => a.isCorrect).length} correct out of {selectedResult.totalQuestions}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedResult.answers.map((answer, index) => (
                    <div 
                      key={answer.questionId}
                      className={`p-4 rounded-lg border ${
                        answer.isCorrect 
                          ? 'border-success-200 bg-success-50'
                          : 'border-error-200 bg-error-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
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
                      <p className="text-neutral-800 font-medium mb-3">
                        {answer.questionText}
                      </p>
                      <div className="space-y-2">
                        {answer.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded ${
                              option === answer.correct
                                ? 'bg-success-100 text-success-700'
                                : option === answer.selected && !answer.isCorrect
                                ? 'bg-error-100 text-error-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;