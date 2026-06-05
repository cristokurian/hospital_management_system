import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { 
  Building2, 
  Stethoscope, 
  Users, 
  CalendarRange, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CalendarCheck,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      } else {
        showToast(res.data.message || 'Failed to load stats', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error communicating with database server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const kpis = [
    { name: 'Total Hospitals', value: stats?.totalHospitals || 0, icon: Building2, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Active Doctors', value: stats?.totalDoctors || 0, icon: Stethoscope, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'Registered Patients', value: stats?.totalPatients || 0, icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Total Bookings', value: stats?.totalAppointments || 0, icon: CalendarRange, color: 'text-amber-500 bg-amber-500/10' },
  ];

  const statusMap = [
    { label: 'Pending Approvals', key: 'PENDING', icon: Clock, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400 bg-amber-500/15' },
    { label: 'Approved Sessions', key: 'APPROVED', icon: CalendarCheck, color: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/15' },
    { label: 'Completed Visits', key: 'COMPLETED', icon: CheckCircle2, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15' },
    { label: 'Cancelled Appointments', key: 'CANCELLED', icon: XCircle, color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400 bg-rose-500/15' },
  ];

  const getPercentage = (value) => {
    if (!stats?.totalAppointments) return 0;
    return Math.round((value / stats.totalAppointments) * 100);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Clinical Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time statistics across hospitals, practitioners, and bookings.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{kpi.name}</span>
                <p className="text-3xl font-extrabold text-slate-950 dark:text-white leading-none">{kpi.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${kpi.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Bar Distribution */}
        <div className="p-6 lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Booking Status Breakdown</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-primary-500 font-semibold bg-primary-500/10 px-2.5 py-1 rounded-full">
              <TrendingUp size={12} /> Distribution
            </span>
          </div>

          <div className="space-y-5">
            {statusMap.map((status, idx) => {
              const count = stats?.statusStats?.[status.key] || 0;
              const percent = getPercentage(count);
              const Icon = status.icon;

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                      <Icon size={16} className={status.color.replace('bg-', 'text-')} />
                      {status.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {count} ({percent}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`${status.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Card for Summary */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Quick Insights</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The dashboard updates dynamically as bookings are processed. Doctors schedules manage slot allocations automatically.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/20 dark:border-slate-700/20 rounded-2xl space-y-3">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>ACTIVE APPOINTMENTS</span>
              <span className="text-indigo-500">
                {((stats?.statusStats?.['PENDING'] || 0) + (stats?.statusStats?.['APPROVED'] || 0))}
              </span>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <p className="text-[11px] text-slate-400">
              Active sessions include both pending requests and approved scheduled time slots awaiting physician visits.
            </p>
          </div>
        </div>

      </div>

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

export default AdminDashboard;
