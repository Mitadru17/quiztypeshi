import React, { useState } from 'react';
import { QuizResult } from '../types/Result';
import { Download, Eye, Calendar, Mail, Trophy, ChevronRight } from 'lucide-react';

interface ResultTableProps {
  results: QuizResult[];
  onExport: () => void;
  onViewDetails: (result: QuizResult) => void;
}

const ResultTable: React.FC<ResultTableProps> = ({ results, onExport, onViewDetails }) => {
  const [sortBy, setSortBy] = useState<'score' | 'timestamp' | 'email'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterEmail, setFilterEmail] = useState('');

  const filteredAndSortedResults = results
    .filter(result => 
      filterEmail === '' || result.userEmail.toLowerCase().includes(filterEmail.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'email':
          comparison = a.userEmail.localeCompare(b.userEmail);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (column: 'score' | 'timestamp' | 'email') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-800">Quiz Results</h2>
            
            <button
              onClick={onExport}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm"
            >
              <Download className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by email..."
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  {sortBy === 'email' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Score</span>
                  {sortBy === 'score' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correct/Total
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {sortBy === 'timestamp' && (
                    <span className="text-blue-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedResults.map((result) => {
              const correctAnswers = result.answers.filter(a => a.isCorrect).length;
              const percentage = Math.round((correctAnswers / result.totalQuestions) * 100);
              
              return (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Trophy className={`h-4 w-4 ${percentage >= 80 ? 'text-yellow-500' : percentage >= 60 ? 'text-gray-400' : 'text-red-400'}`} />
                      <span className={`text-sm font-medium ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {correctAnswers}/{result.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{result.timestamp.toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewDetails(result)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {filteredAndSortedResults.map((result) => {
          const correctAnswers = result.answers.filter(a => a.isCorrect).length;
          const percentage = Math.round((correctAnswers / result.totalQuestions) * 100);
          
          return (
            <div 
              key={result.id} 
              className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onViewDetails(result)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    {result.userEmail}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className={`h-5 w-5 ${percentage >= 80 ? 'text-yellow-500' : percentage >= 60 ? 'text-gray-400' : 'text-red-400'}`} />
                    <span className={`text-base font-medium ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {percentage}% ({correctAnswers}/{result.totalQuestions})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{result.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredAndSortedResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No results found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default ResultTable;