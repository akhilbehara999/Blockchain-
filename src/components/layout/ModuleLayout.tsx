import React from 'react';
import ModuleHeader from '../shared/ModuleHeader';
import ExplanationPanel from '../shared/ExplanationPanel';
import { motion } from 'framer-motion';

interface ModuleLayoutProps {
  moduleId: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  moduleId,
  title,
  subtitle,
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col space-y-8"
    >
      <ModuleHeader title={title} subtitle={subtitle} />

      <div className="min-h-[60vh] relative">
        {children}
      </div>

      <ExplanationPanel moduleId={moduleId} />
    </motion.div>
  );
};

export default ModuleLayout;
