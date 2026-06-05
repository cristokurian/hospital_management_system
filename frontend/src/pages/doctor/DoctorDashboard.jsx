import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Check, 
  X, 
  CheckCircle,
  Clock3,
  CalendarDays,
  FileText
} from 'lucide-react';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState({ today: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/doctor/dashboard');
      if (res.data && res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to retrieve dashboard records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
     const res = await api.put(`/api/doctor/appointments/${appointmentId}/status?status=${status}`);
      if (res.data && res.data.success) {
        showToast(`Appointment status updated to ${status.toLowerCase()}`, 'success');
        
        // Re-fetch dashboard data to sync state cleanly
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update appointment status', 'error');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'APPROVED':
        return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'COMPLETED':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'CANCELLED':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const tabItems = [
    { id: 'today', label: "Today's Queue", count: appointments.today.length, icon: Clock3 },
    { id: 'upcoming', label: 'Upcoming Visits', count: appointments.upcoming.length, icon: CalendarDays },
    { id: 'completed', label: 'Completed History', count: appointments.completed.length, icon: CheckCircle },
  ];

  const activeAppointmentsList = appointments[activeTab] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Medical Practice Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Review scheduled visits, verify patient records, and update appointment states.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 shrink-0">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 text-sm font-bold transition-all relative ${
                isActive 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Roster list */}
      {activeAppointmentsList.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl">
          <p className="text-slate-400 font-medium">No appointments found in this segment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeAppointmentsList.map((app) => (
            <div 
              key={app.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="space-y-3 flex-1">
                {/* Patient Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{app.patientName}</h3>
                    <div className="flex gap-4 text-xs text-slate-400 mt-0.5">
                      <span>{app.patientEmail}</span>
                      <span>•</span>
                      <span>{app.patientPhone || 'No Phone'}</span>
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-450 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {app.appointmentDate}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {app.startTime} - {app.endTime}</span>
                  <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                {/* Patient Notes */}
                {app.notes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-2xl text-xs border border-slate-100 dark:border-slate-800 flex items-start gap-2 text-slate-500 dark:text-slate-400">
                    <FileText size={14} className="shrink-0 mt-0.5 text-slate-400" />
                    <p><span className="font-bold text-slate-400">Complaint / Notes:</span> {app.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Operations for Doctor */}
              {app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                <div className="flex items-center gap-2.5 md:self-center shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs transition-all"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {app.status === 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs transition-all"
                    >
                      <CheckCircle size={14} /> Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs transition-colors"
                  >
                    <X size={14} /> Cancel Visit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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

export default DoctorDashboard;
