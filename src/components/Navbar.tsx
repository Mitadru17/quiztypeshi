import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogOut, User, BookOpen, Menu, X, LayoutDashboard } from 'lucide-react';
import { auth } from '../services/firebase';
import { logoutUser, isAdmin } from '../services/auth';

const Navbar: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className={`${
        isActive(to)
          ? 'text-primary-600 border-primary-500'
          : 'text-gray-600 hover:text-primary-500 border-transparent'
      } px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200`}
    >
      {children}
    </Link>
  );

  if (loading) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="animate-pulse bg-neutral-200 h-6 w-24 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-soft-xl border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                C Quiz
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-8">
            <div className="flex space-x-1">
              <NavLink to="/">Home</NavLink>
              {user && <NavLink to="/quiz">Quiz</NavLink>}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                        className="h-8 w-8 rounded-full ring-2 ring-primary-100"
                    />
                  ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                  )}
                    <span className="text-sm font-medium text-gray-700">{getUserDisplayName()}</span>
                </div>
                  
                  {isAdmin(user) && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-primary-600 transition-colors"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
            ) : (
                <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                    className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                    className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} border-t border-gray-100 bg-white`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="px-4 pt-2 pb-3 space-y-2">
          <Link
            to="/"
            className={`${
              isActive('/')
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-50'
            } block px-4 py-3 rounded-lg text-base font-medium transition-colors`}
          >
            Home
          </Link>
          
          {user && (
            <Link
              to="/quiz"
              className={`${
                isActive('/quiz')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              } block px-4 py-3 rounded-lg text-base font-medium transition-colors`}
            >
              Quiz
            </Link>
          )}
        </div>

        {user ? (
          <div className="pt-4 pb-3 px-4 border-t border-gray-100">
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full ring-2 ring-primary-100"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{getUserDisplayName()}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              {isAdmin(user) && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-gray-100 space-y-2">
            <Link
              to="/login"
              className="block w-full px-4 py-3 text-center text-primary-600 hover:text-primary-700 transition-colors font-medium rounded-lg hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="block w-full px-4 py-3 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;