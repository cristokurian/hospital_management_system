import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-primary-500/10 text-primary-500 rounded-3xl mb-6">
        <HelpCircle size={64} className="animate-spin-slow" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        We couldn't locate the clinical file or dashboard view you requested. It may have been moved or archived.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-600/25 transition-all"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
