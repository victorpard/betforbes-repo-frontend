import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNavigation from '../BottomNavigation';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 shadow">
        <h1 className="text-2xl font-semibold">BetForbes</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm">Olá, {user.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
