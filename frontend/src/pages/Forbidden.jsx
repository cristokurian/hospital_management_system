import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-rose-500/10 text-rose-500 rounded-3xl mb-6 animate-bounce">
        <ShieldAlert size={64} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        You do not have the necessary permissions or role clearance to access this department or resource.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-600/25 transition-all"
      >
        <ArrowLeft size={16} />
        Back to Safety
      </Link>
    </div>
  );
};

export default Forbidden;
