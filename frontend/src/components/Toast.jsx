import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl border border-white/10 animate-bounce-short transition-all duration-300 ${
      type === 'success' 
        ? 'bg-slate-900/90 text-emerald-400 glass border-emerald-500/20' 
        : 'bg-slate-900/90 text-rose-400 glass border-rose-500/20'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
      )}
      <span className="text-sm font-semibold text-slate-100">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors ml-4">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
