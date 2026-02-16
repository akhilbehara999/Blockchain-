import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, XCircle, Info, Hammer, Radio } from 'lucide-react';
import { useToast, Toast as ToastType } from '../../context/ToastContext';

const ToastItem: React.FC<{ toast: ToastType; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const getIcon = (type: ToastType['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-status-valid" />;
      case 'error': return <XCircle className="w-5 h-5 text-status-error" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-status-warning" />;
      case 'info': return <Info className="w-5 h-5 text-status-info" />;
      case 'mining': return <Hammer className="w-5 h-5 text-status-mining" />;
      case 'network': return <Radio className="w-5 h-5 text-brand-500" />; // Network using brand color or info
      default: return <Info className="w-5 h-5 text-status-info" />;
    }
  };

  const getStyles = (type: ToastType['type']) => {
    const base = "flex w-full max-w-sm rounded-xl border shadow-lg backdrop-blur-xl p-4";
    switch (type) {
      case 'success': return `${base} bg-emerald-500/10 border-emerald-500/20`;
      case 'error': return `${base} bg-red-500/10 border-red-500/20`;
      case 'warning': return `${base} bg-amber-500/10 border-amber-500/20`;
      case 'info': return `${base} bg-blue-500/10 border-blue-500/20`;
      case 'mining': return `${base} bg-violet-500/10 border-violet-500/20`;
      case 'network': return `${base} bg-indigo-500/10 border-indigo-500/20`;
      default: return `${base} bg-surface-primary/90 dark:bg-surface-dark-primary/90 border-surface-border dark:border-surface-dark-border`;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`pointer-events-auto mb-3 ${getStyles(toast.type)}`}
    >
      <div className="flex-shrink-0">
        {getIcon(toast.type)}
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {toast.message}
        </p>
      </div>
      <div className="ml-4 flex flex-shrink-0">
        <button
          type="button"
          className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          onClick={() => onRemove(toast.id)}
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Limit to last 3 toasts
  const visibleToasts = toasts.slice(-3);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-end sm:p-6 z-[100]"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence mode='popLayout'>
          {visibleToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToastContainer;
