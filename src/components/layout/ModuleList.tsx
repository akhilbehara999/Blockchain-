import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MODULE_LIST } from '../../utils/constants';
import { useProgressStore } from '../../stores/useProgressStore';
import { CheckCircle, Circle } from 'lucide-react';

interface ModuleListProps {
  onItemClick?: () => void;
  isCollapsed?: boolean;
}

const ModuleList: React.FC<ModuleListProps> = ({ onItemClick, isCollapsed = false }) => {
  const isModuleCompleted = useProgressStore((state) => state.isModuleCompleted);

  return (
    <nav className="space-y-1 px-3">
      {MODULE_LIST.map((module) => {
        const completed = isModuleCompleted(module.id);
        const Icon = module.icon;

        return (
          <NavLink
            key={module.id}
            to={module.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-xl transition-colors relative group ${
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-text-secondary hover:bg-tertiary-bg hover:text-text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeModule"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative flex-shrink-0">
                   <Icon className={`w-6 h-6 ${isActive ? 'text-accent' : 'text-text-tertiary group-hover:text-text-secondary'}`} />
                   {completed && (
                     <div className="absolute -top-1 -right-1 bg-secondary-bg rounded-full">
                       <CheckCircle className="w-3 h-3 text-success" />
                     </div>
                   )}
                </div>

                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 flex-1 overflow-hidden whitespace-nowrap"
                  >
                    <span className="block truncate">{module.title}</span>
                  </motion.div>
                )}

                {!isCollapsed && (
                   <div className="ml-auto flex-shrink-0">
                     {completed ? (
                       <CheckCircle className="w-4 h-4 text-success opacity-80" />
                     ) : (
                       <Circle className="w-4 h-4 text-tertiary-bg" />
                     )}
                   </div>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default ModuleList;
