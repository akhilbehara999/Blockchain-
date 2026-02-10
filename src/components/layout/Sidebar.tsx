import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ModuleList from './ModuleList';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-secondary-bg border-r border-border transition-all duration-300 z-20 overflow-y-auto overflow-x-hidden ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex flex-col h-full py-6">
        <ModuleList isCollapsed={isCollapsed} />

        <div className="p-4 mt-auto border-t border-border">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full p-2 text-text-secondary hover:text-text-primary hover:bg-tertiary-bg rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
              <div className="flex items-center w-full">
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
