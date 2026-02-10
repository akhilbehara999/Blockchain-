import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, BarChart2, Settings } from 'lucide-react';

interface BottomNavProps {
  onModulesClick?: () => void;
  onSettingsClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onModulesClick, onSettingsClick }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-secondary-bg border-t border-border z-30 flex items-center justify-around px-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-colors ${
            isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          }`
        }
      >
        <Home className="w-6 h-6" />
        <span className="text-xs font-medium">Home</span>
      </NavLink>

      <button
        onClick={onModulesClick}
        className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
      >
        <List className="w-6 h-6" />
        <span className="text-xs font-medium">Modules</span>
      </button>

      <NavLink
        to="/progress" // This route might not exist yet, but it's okay
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-colors ${
            isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          }`
        }
      >
        <BarChart2 className="w-6 h-6" />
        <span className="text-xs font-medium">Progress</span>
      </NavLink>

      <button
        onClick={onSettingsClick}
        className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
      >
        <Settings className="w-6 h-6" />
        <span className="text-xs font-medium">Settings</span>
      </button>
    </nav>
  );
};

export default BottomNav;
