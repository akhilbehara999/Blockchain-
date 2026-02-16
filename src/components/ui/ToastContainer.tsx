import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, XCircle, Info, Hammer, Radio } from 'lucide-react';
import { useToast, Toast, ToastType } from '../../context/ToastContext';

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'mining': return <Hammer className="w-5 h-5 text-purple-500" />;
      case 'network': return <Radio className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-emerald-500/20 bg-emerald-500/5';
      case 'error': return 'border-red-500/20 bg-red-500/5';
      case 'warning': return 'border-amber-500/20 bg-amber-500/5';
      case 'info': return 'border-blue-500/20 bg-blue-500/5';
      case 'mining': return 'border-purple-500/20 bg-purple-500/5';
      case 'network': return 'border-indigo-500/20 bg-indigo-500/5';
      default: return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={`pointer-events-auto flex w-full max-w-sm rounded-lg border shadow-lg backdrop-blur-xl ${getBorderColor(toast.type)}`}
    >
      <div className="flex w-full p-4">
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
            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => onRemove(toast.id)}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-[100]"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence mode='popLayout'>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToastContainer;
