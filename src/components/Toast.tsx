import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import type { Toast } from '../contexts/ToastContext';

interface ToastItemProps {
  toast: Toast;
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast();

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          className: 'bg-white/10 border-white/20 text-white'
        };
      case 'error':
        return {
          icon: AlertCircle,
          className: 'bg-white/10 border-white/20 text-white'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'bg-white/10 border-white/20 text-white'
        };
      default:
        return {
          icon: Info,
          className: 'bg-white/10 border-white/20 text-white'
        };
    }
  };

  const { icon: Icon, className } = getToastStyles(toast.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        duration: 0.4
      }}
      className="mb-2 last:mb-0"
    >
      <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border text-sm font-medium shadow-xl ${className}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={() => removeToast(toast.id)}
          className="ml-2 p-1 hover:bg-white/10 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col-reverse">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
} 