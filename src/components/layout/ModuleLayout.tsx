import React from 'react';
import ModuleHeader from '../shared/ModuleHeader';
import ExplanationPanel from '../shared/ExplanationPanel';
import { motion } from 'framer-motion';

interface ModuleLayoutProps {
  moduleId: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ModuleLayout: React.FC<ModuleLayoutProps> = ({ moduleId, title, subtitle, children }) => {
  return (
    <div className="space-y-8">
      <ModuleHeader title={title} subtitle={subtitle} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[400px]"
      >
        {children}
      </motion.div>

      <ExplanationPanel moduleId={moduleId} />
    </div>
  );
};

export default ModuleLayout;
