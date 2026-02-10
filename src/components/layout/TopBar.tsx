import React from 'react';
import { useLocation } from 'react-router-dom';
import { MODULE_LIST } from '../../utils/constants';
import { Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';

interface TopBarProps {
  toggleTheme?: () => void;
  isDark?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ toggleTheme, isDark = true }) => {
  const location = useLocation();
  const currentModule = MODULE_LIST.find(m => m.path === location.pathname);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-primary-bg/80 backdrop-blur-md border-b border-border z-50 px-6 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center">
         <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer">
           BlockSim
         </div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 font-medium text-text-primary hidden md:block">
        {currentModule?.title}
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-text-secondary hidden sm:block bg-secondary-bg px-3 py-1 rounded-full border border-border">
           0% Complete
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="text-text-secondary hover:text-text-primary rounded-full w-10 h-10 p-0"
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
};

export default TopBar;
