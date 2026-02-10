import React from 'react';
import { NavLink } from 'react-router-dom';
import { MODULE_LIST } from '../../utils/constants';
import {
  BookOpen, Hash, Box, Link, Users, Coins, CircleDollarSign,
  Key, PenTool, ArrowRightLeft, Cpu, Hammer, Gauge, FileCode,
  Circle
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.FC<any>> = {
  BookOpen, Hash, Box, Link, Users, Coins, CircleDollarSign,
  Key, PenTool, ArrowRightLeft, Cpu, Hammer, Gauge, FileCode
};

interface ModuleNavigationProps {
  onItemClick?: () => void;
  isCollapsed?: boolean;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({ onItemClick, isCollapsed = false }) => {
  return (
    <nav className="space-y-2">
      {MODULE_LIST.map((module) => {
        const Icon = iconMap[module.icon] || Box;
        return (
          <NavLink
            key={module.id}
            to={module.path}
            onClick={onItemClick}
            className={({ isActive }) => `
              flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
              ${isActive
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:bg-tertiary-bg hover:text-text-primary'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeModule"
                    className="absolute left-0 w-1 h-8 bg-accent rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                <div className="flex items-center justify-center min-w-[24px]">
                  <Icon className={`w-6 h-6 ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'}`} />
                </div>

                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap"
                  >
                    <span className="font-medium text-sm">{module.title}</span>
                    <Circle className="w-4 h-4 text-border" />
                  </motion.div>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default ModuleNavigation;
