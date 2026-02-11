import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex space-x-1 bg-tertiary-bg/50 p-1 rounded-xl overflow-x-auto scrollbar-hide ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}
              flex-1 min-w-fit whitespace-nowrap
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-secondary-bg shadow-sm rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center space-x-2">
              {tab.icon}
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
