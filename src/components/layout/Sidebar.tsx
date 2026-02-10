import React from 'react';
import ModuleNavigation from './ModuleNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, className = '' }) => {
  return (
    <aside
      className={`
        fixed left-0 top-16 bottom-0 z-40
        bg-secondary-bg/95 backdrop-blur-xl border-r border-border
        transition-all duration-300 ease-in-out
        flex flex-col
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${className}
      `}
    >
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <ModuleNavigation isCollapsed={isCollapsed} />
      </div>

      <div className="p-4 border-t border-border flex justify-end">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-tertiary-bg text-text-secondary hover:text-text-primary transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
