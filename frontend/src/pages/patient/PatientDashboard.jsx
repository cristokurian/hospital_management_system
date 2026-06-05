import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  Building2, 
  X, 
  CalendarDays,
  FileText,
  Clock3,
  CalendarCheck,
  AlertTriangle
} from 'lucide-react';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState({ upcoming: [], previous: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Reschedule modal states
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/patient/dashboard');
      if (res.data && res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to retrieve dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Fetch slots for reschedule when date or app changes
  useEffect(() => {
    if (isRescheduleOpen && selectedApp && rescheduleDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await api.get(`/patient/doctors/${selectedApp.doctorId}/slots?date=${rescheduleDate}`);
          if (res.data && res.data.success) {
            setAvailableSlots(res.data.data);
          }
        } catch (err) {
          showToast('Failed to retrieve slot availability', 'error');
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [isRescheduleOpen, selectedApp, rescheduleDate]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The slot will be released back to the doctor.')) {
      return;
    }
    try {
      const res = await api.put(`/patient/appointments/${id}/cancel`);
      if (res.data && res.data.success) {
        showToast('Appointment cancelled successfully', 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel appointment', 'error');
    }
  };

  const openReschedule = (app) => {
    setSelectedApp(app);
    setIsRescheduleOpen(true);
    // Set date to today or tomorrow
    const today = new Date();
    setRescheduleDate(today.toISOString().split('T')[0]);
    setAvailableSlots([]);
  };

  const handleRescheduleSubmit = async (newSlotId) => {
    if (!selectedApp) return;

    try {
      const res = await api.put(`/patient/appointments/${selectedApp.id}/reschedule?newSlotId=${newSlotId}`);
      if (res.data && res.data.success) {
        showToast('Rescheduled successfully. Awaiting doctor re-approval.', 'success');
        setIsRescheduleOpen(false);
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reschedule booking', 'error');
    }
  };

  const getStatusBadge = (status) => {
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
    { id: 'upcoming', label: 'Upcoming Visits', count: appointments.upcoming.length, icon: CalendarDays },
    { id: 'previous', label: 'Previous History', count: appointments.previous.length, icon: Clock3 },
  ];

  const activeList = appointments[activeTab] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Health Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor upcoming appointments, access past visits, and manage schedules.</p>
      </div>

      {/* Tabs */}
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
                  : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-350'
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
      {activeList.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl">
          <p className="text-slate-400 font-medium">No bookings found in this section.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((app) => (
            <div 
              key={app.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="space-y-3 flex-1">
                
                {/* Doctor profile details */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 text-primary-500 dark:bg-primary-950/20 rounded-xl">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{app.doctorName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-semibold text-primary-500">{app.specialization}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Building2 size={12} /> {app.hospitalName} ({app.hospitalCity})</span>
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-450 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {app.appointmentDate}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {app.startTime.substring(0,5)} - {app.endTime.substring(0,5)}</span>
                  <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                {/* Notes */}
                {app.notes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-2xl text-xs border border-slate-100 dark:border-slate-800/40 flex items-start gap-2 text-slate-500 dark:text-slate-400">
                    <FileText size={14} className="shrink-0 mt-0.5 text-slate-400" />
                    <p><span className="font-bold text-slate-400">My Complaint / Symptoms:</span> {app.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Patient */}
              {activeTab === 'upcoming' && app.status !== 'CANCELLED' && (
                <div className="flex items-center gap-2.5 md:self-center shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                  <button
                    onClick={() => openReschedule(app)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
                  >
                    <CalendarCheck size={14} /> Reschedule
                  </button>
                  <button
                    onClick={() => handleCancel(app.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-colors"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal Overlay */}
      {isRescheduleOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsRescheduleOpen(false)} />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold">Reschedule Appointment</h2>
                <p className="text-xs text-slate-400">Selecting new slot with {selectedApp.doctorName}</p>
              </div>
              <button 
                onClick={() => setIsRescheduleOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-200 border border-slate-200 dark:border-slate-850 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              
              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none"
                />
              </div>

              {/* Time Slots Selector */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Available Times</span>
                
                {loadingSlots ? (
                  <div className="flex py-6 justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-start gap-2.5 text-xs">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>No available slots found for this date. Please choose a different date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleRescheduleSubmit(slot.id)}
                        className="py-2.5 px-2 bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white rounded-xl text-xs font-bold border border-primary-500/10 hover:border-transparent transition-all"
                      >
                        {slot.startTime.substring(0,5)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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

export default PatientDashboard;
