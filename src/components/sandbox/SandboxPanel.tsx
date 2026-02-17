import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SandboxPanelProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLive?: boolean;
  className?: string;
}

const SandboxPanel: React.FC<SandboxPanelProps> = ({
  title,
  icon: Icon,
  children,
  footer,
  isLive = false,
  className = '',
}) => {
  return (
    <div className={`h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90 ${className}`}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {isLive && (
          <div className="relative flex h-3 w-3" title="Live Update">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar relative">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
};

export default SandboxPanel;
