import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useResume } from '../context/ResumeContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useResume();
  const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
  const colors = {
    success: 'border-green-200 text-green-700',
    error: 'border-red-200 text-red-700',
    warning: 'border-amber-200 text-amber-700',
    info: 'border-blue-200 text-blue-700',
  };
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-white border text-sm font-medium ${colors[t.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-gray-800">{t.message}</span>
              <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600 ml-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
