import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Clock, 
  HeartHandshake, 
  ShieldCheck, 
  Award,
  ArrowRight,
  ChevronRight,
  MapPin,
  PhoneCall
} from 'lucide-react';

const LandingPage = () => {
  const specialties = [
    { name: 'Cardiology', desc: 'Expert care for your heart and cardiovascular health.', icon: Activity, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { name: 'Neurology', desc: 'Specialized diagnosis and treatment of brain and nervous system disorders.', icon: Award, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { name: 'Pediatrics', desc: 'Comprehensive medical care tailored for infants, children, and adolescents.', icon: HeartHandshake, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { name: 'Orthopedics', desc: 'Treatment for bone, joint, ligament, tendon, and muscle issues.', icon: ShieldCheck, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-500 rounded-xl text-white shadow-md shadow-primary-500/20">
              <Activity size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">CareFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-semibold hover:text-primary-500 dark:hover:text-primary-400 transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-600/25 px-5 py-2.5 rounded-xl transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400">
            🏥 Modern Healthcare Platform
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
            Your Health, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">Scheduled Smarter</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
            CareFlow connects you with elite doctors, handles instant slot generation, eliminates double booking, and streamlines medical scheduling in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transition-all group"
            >
              Book an Appointment
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl transition-colors"
            >
              Doctor Portal
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800/80">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-500">99.9%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Booking Accuracy</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-500">100+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Elite Doctors</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500">15m</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Average Wait Time</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Visual Grid */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-xl space-y-4">
            <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl w-fit">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-lg">Automatic Slot Engine</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Doctors set working blocks, and slots of 15/30 minutes generate automatically. Booked slots vanish instantly.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-xl space-y-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl w-fit">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-lg">No Overlaps</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Guaranteed scheduling integrity with transaction optimistic locking and unique database constraints.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-xl space-y-4 sm:col-span-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Real-time Availability Status
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Patients search by name, specialization, or hospital branch. Instantly access available times and book with one click.
            </p>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/40 border-y border-slate-200/40 dark:border-slate-800/60 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Comprehensive Medical Specializations</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Our roster includes verified specialists across diverse departments ready to serve you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <div 
                  key={spec.name} 
                  className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl hover:shadow-lg transition-shadow duration-300 space-y-4"
                >
                  <div className={`p-3.5 rounded-2xl w-fit ${spec.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-lg">{spec.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{spec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-500 rounded-lg text-white">
              <Activity size={16} />
            </div>
            <span className="font-bold text-lg">CareFlow</span>
          </div>
          <p className="text-sm text-slate-400">&copy; 2026 CareFlow Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><MapPin size={14} /> Global OS</span>
            <span className="flex items-center gap-1"><PhoneCall size={14} /> Support Center</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
