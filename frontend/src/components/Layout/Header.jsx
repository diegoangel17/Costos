import React from 'react';
import { TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ title, showUser = true }) {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
              {title || 'FinReport'}
            </h1>
          </div>
          {showUser && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px]">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {currentUser?.email}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                  Cerrar Sesión
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}