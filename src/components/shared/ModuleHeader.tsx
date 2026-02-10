import React from 'react';

interface ModuleHeaderProps {
  title: string;
  subtitle: string;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
        {title}
      </h1>
      <p className="text-lg text-text-secondary max-w-3xl">
        {subtitle}
      </p>
    </div>
  );
};

export default ModuleHeader;
