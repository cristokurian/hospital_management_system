import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Mail, Lock, Activity, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast notifications state
  const [toast, setToast] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin', { replace: true });
        break;
      case 'DOCTOR':
        navigate('/doctor', { replace: true });
        break;
      case 'PATIENT':
        navigate('/patient', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Login triggers context update which auto-redirects via useEffect, but let's also show success
      showToast('Welcome back! Logging in...', 'success');
    } else {
      showToast(result.error || 'Login failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary-500 rounded-2xl text-white shadow-lg shadow-primary-500/25">
            <Activity size={28} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Access CareFlow</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enter your medical credentials to sign in</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@careflow.com or patient@mail.com"
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all text-sm group"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Sign In
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Extra Navigation links */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <p className="text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary-500 hover:underline">
              Create one now
            </Link>
          </p>
          <div className="mt-4 p-2 bg-slate-50 dark:bg-slate-800/20 rounded-lg text-slate-400 text-[10px]">
            Demo: admin@careflow.com / admin123
          </div>
        </div>
      </div>

      {/* Render Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;
