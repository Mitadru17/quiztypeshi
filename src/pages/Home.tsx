import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BookOpen, Trophy, Users, BarChart3, ArrowRight } from 'lucide-react';
import { auth } from '../services/firebase';
import { isAdmin } from '../services/auth';

const Home: React.FC = () => {
  const [user] = useAuthState(auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            C Programming Quiz
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto px-2">
            Master Structures and Functions in C Programming through our comprehensive quiz platform. 
            Test your knowledge with 15 carefully crafted questions and track your progress.
          </p>
          
          {user ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-4">
              <Link
                to="/quiz"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-medium rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Take Quiz Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              
              {isAdmin(user) && (
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-indigo-600 text-white text-base sm:text-lg font-medium rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-lg"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-medium rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-blue-600 text-base sm:text-lg font-medium rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-lg border border-blue-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <div className="text-center bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Comprehensive Content
            </h3>
            <p className="text-gray-600">
              15 carefully crafted questions covering C structures, functions, and memory management concepts.
            </p>
          </div>
          
          <div className="text-center bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Instant Results
            </h3>
            <p className="text-gray-600">
              Get immediate feedback with detailed explanations for correct and incorrect answers.
            </p>
          </div>
          
          <div className="text-center bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Progress Tracking
            </h3>
            <p className="text-gray-600">
              Admin dashboard to monitor student progress and export detailed performance reports.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {user && (
        <div className="bg-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12">
                Ready to Test Your Knowledge?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                <div className="text-center bg-gray-50 p-4 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">15</div>
                  <div className="text-gray-600">Questions</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">MCQ</div>
                  <div className="text-gray-600">Format</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">C</div>
                  <div className="text-gray-600">Programming</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">Free</div>
                  <div className="text-gray-600">Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;