import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-secondary-bg/50 animate-pulse rounded-2xl ${className}`}
    />
  );
};

export default Skeleton;
