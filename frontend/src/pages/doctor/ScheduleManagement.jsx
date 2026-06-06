import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { 
  CalendarRange, 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  Lock, 
  Unlock,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  
  // Date selector for slots blocking
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form states
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState('30');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const res = await api.get('/api/doctor/schedules');
      if (res.data && res.data.success) {
        setSchedules(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch schedules', 'error');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const res = await api.get(`/api/doctor/slots/date?date=${date}`);
      if (res.data && res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      showToast('Could not load slots for selected date', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      showToast('Please specify start and end times', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      dayOfWeek,
      startTime: startTime + ':00', // Append seconds to match LocalTime format
      endTime: endTime + ':00',
      slotDuration: parseInt(slotDuration),
      isActive
    };

    try {
      const res = await api.post('/api/doctor/schedules', payload);
      if (res.data && res.data.success) {
        showToast('Schedule saved and slots generated successfully', 'success');
        fetchSchedules();
        fetchSlots(selectedDate); // Refresh slots grid
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save schedule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Deleting this schedule will also wipe out all generated unbooked slots for this day. Proceed?')) {
      return;
    }
    try {
     const res = await api.delete(`/api/doctor/schedules/${id}`);
      if (res.data && res.data.success) {
        showToast('Schedule and slots deleted successfully', 'success');
        setSchedules(schedules.filter(s => s.id !== id));
        fetchSlots(selectedDate); // Refresh slots grid
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete schedule', 'error');
    }
  };

  const handleToggleBlockSlot = async (slotId, currentBlocked) => {
    const newBlocked = !currentBlocked;
    try {
     const res = await api.put(`/api/doctor/slots/${slotId}/block?blocked=${newBlocked}`);
      if (res.data && res.data.success) {
        showToast(newBlocked ? 'Slot blocked' : 'Slot unblocked', 'success');
        setSlots(slots.map(s => s.id === slotId ? { ...s, isBlocked: newBlocked } : s));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to block/unblock slot', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Schedule Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Define recurring availability and block/unblock single calendar times.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Schedule Builder Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CalendarRange className="text-primary-500" size={20} />
              Availability Config
            </h2>
            
            <form onSubmit={handleSubmitSchedule} className="space-y-4">
              {/* Day of Week */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                >
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Start/End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Slot Duration */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Slot Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                </select>
              </div>

              {/* Active Toggler */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-slate-650 dark:text-slate-350">Active Schedule</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className="text-primary-500 hover:opacity-85 transition-opacity"
                >
                  {isActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-slate-400" />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 text-sm transition-all"
              >
                {isSubmitting ? 'Saving...' : 'Save & Generate Slots'}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Schedules & Slots Calendar */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* List of Weekly Schedules */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Weekly Schedule Summary</h2>
            {loadingSchedules ? (
              <div className="flex py-6 justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : schedules.length === 0 ? (
              <p className="text-sm text-slate-450 italic">No recurring weekly schedules saved yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schedules.map((sch) => (
                  <div 
                    key={sch.id}
                    className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-between gap-4 bg-slate-50/40 dark:bg-slate-900/40"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">{sch.dayOfWeek}</span>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {sch.startTime.substring(0,5)} - {sch.endTime.substring(0,5)}
                      </p>
                      <span className="text-[10px] bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md font-bold">
                        {sch.slotDuration}m increments
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(sch.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-600 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Slots Block Grid */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm space-y-6">
            
            {/* Calendar Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Single Slots Availability</h2>
              <div className="flex items-center gap-2.5">
                <Calendar size={16} className="text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                 className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-sky-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Grid */}
            {loadingSlots ? (
              <div className="flex py-10 justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-center py-10 text-sm text-slate-400 italic">No slots generated for this date. Make sure you have an active schedule on this day of the week.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">Click a slot below to toggle its status between Blocked (red) and Available (green). Booked slots (grey) cannot be modified.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={slot.isBooked}
                      onClick={() => handleToggleBlockSlot(slot.id, slot.isBlocked)}
                      className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold flex flex-col items-center justify-center gap-1.5 ${
                        slot.isBooked
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-400 cursor-not-allowed'
                          : slot.isBlocked
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      <span>{slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}</span>
                      <span className="text-[9px] uppercase font-semibold">
                        {slot.isBooked ? 'Booked' : slot.isBlocked ? 'Blocked' : 'Available'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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

export default ScheduleManagement;
