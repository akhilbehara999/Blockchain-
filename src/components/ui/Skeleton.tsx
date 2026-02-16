import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-surface-tertiary dark:bg-surface-dark-tertiary animate-pulse rounded-xl ${className}`}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-surface-primary dark:bg-surface-dark-secondary rounded-2xl p-6 border border-surface-border dark:border-surface-dark-border ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <SkeletonText lines={3} />
      <div className="mt-4 pt-4 border-t border-surface-border dark:border-surface-dark-border flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
};

export const SkeletonTransaction: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-between p-4 bg-surface-primary dark:bg-surface-dark-secondary rounded-xl border border-surface-border dark:border-surface-dark-border ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-4 w-16 mb-1 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-surface-primary dark:bg-surface-dark-secondary rounded-2xl p-6 border border-surface-border dark:border-surface-dark-border ${className}`}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <SkeletonText lines={4} />
    </div>
  );
};

export default Skeleton;
