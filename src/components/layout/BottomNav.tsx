import React from 'react';
import { Home, List, PieChart, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
  onModulesClick: () => void;
  onSettingsClick: () => void;
  onProgressClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onModulesClick, onSettingsClick, onProgressClick }) => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-secondary-bg/90 backdrop-blur-lg border-t border-border z-50 flex justify-around items-center px-4 pb-1 safe-area-bottom">
      <Link
        to="/"
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${location.pathname === '/' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
      >
        <Home className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      <button
        onClick={onModulesClick}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-text-secondary hover:text-text-primary`}
      >
        <List className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium">Modules</span>
      </button>

      <button
        onClick={onProgressClick}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-text-secondary hover:text-text-primary`}
      >
        <PieChart className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium">Progress</span>
      </button>

      <button
        onClick={onSettingsClick}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-text-secondary hover:text-text-primary`}
      >
        <Settings className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-medium">Settings</span>
      </button>
    </nav>
  );
};

export default BottomNav;
