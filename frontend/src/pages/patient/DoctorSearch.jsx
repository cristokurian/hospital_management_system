import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { 
  Search, 
  Stethoscope, 
  Building2, 
  Calendar, 
  Clock, 
  FileText,
  BookmarkPlus,
  X,
  AlertTriangle
} from 'lucide-react';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospitalId, setHospitalId] = useState('');

  // Booking states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Modal booking states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/api/patient/hospitals');
      if (res.data && res.data.success) {
        setHospitals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load hospitals', err);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.query = query;
      if (specialization) params.specialization = specialization;
      if (hospitalId) params.hospitalId = hospitalId;

      const res = await api.get('/api/patient/doctors', { params });
      if (res.data && res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      showToast('Failed to retrieve doctors directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Fetch doctors dynamically when filters update
  useEffect(() => {
    fetchDoctors();
  }, [query, specialization, hospitalId]);

  // Fetch slots for selected doctor on date change
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
         const res = await api.get(`/api/patient/doctors/${selectedDoctor.id}/slots?date=${selectedDate}`);
          if (res.data && res.data.success) {
            setSlots(res.data.data);
          }
        } catch (err) {
          showToast('Failed to load available slots', 'error');
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const selectDoctorForBooking = (doc) => {
    setSelectedDoctor(doc);
    // Reset date to today
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
    setSlots([]);
  };

  const openBookingForm = (slot) => {
    setSelectedSlot(slot);
    setBookingNotes('');
    setIsBookingOpen(true);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsSubmitting(true);
    const payload = {
      slotId: selectedSlot.id,
      notes: bookingNotes
    };

    try {
;      const res = await api.post('/api/patient/appointments', payload);
      if (res.data && res.data.success) {
        showToast('Appointment booked successfully! Awaiting approval.', 'success');
        setIsBookingOpen(false);
        // Refresh slots list to remove the booked slot
        setSlots(slots.filter(s => s.id !== selectedSlot.id));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to book slot', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const specializations = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Practitioner',
    'Dermatology',
    'Oncology'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Find a Medical Specialist</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Filter practitioners by specialty or branch, review profiles, and schedule visits.</p>
      </div>

      {/* Grid: Search left, Slots picker right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Search Panel & Doctors List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-3xl shadow-sm">
            {/* Text Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name..."
                className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Specialty */}
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            {/* Hospital */}
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none"
            >
              <option value="">All Hospitals</option>
              {hospitals.map(hosp => (
                <option key={hosp.id} value={hosp.id}>{hosp.name}</option>
              ))}
            </select>
          </div>

          {/* Roster Cards */}
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl">
              <p className="text-slate-400 font-medium">No doctors found matching filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <div 
                    key={doc.id}
                    onClick={() => selectDoctorForBooking(doc)}
                    className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected 
                        ? 'border-primary-500 ring-2 ring-primary-500/25' 
                        : 'border-slate-200/60 dark:border-slate-800/85'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-50 text-primary-500 dark:bg-primary-950/20 rounded-2xl shrink-0">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-sm">Dr. {doc.firstName} {doc.lastName}</h3>
                          <span className="text-[10px] font-bold text-primary-500 bg-primary-500/10 px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
                            {doc.specialization}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8">
                        {doc.biography || 'Verified medical practitioner.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-4 shrink-0">
                      <Building2 size={12} />
                      <span className="truncate">{doc.hospitalName} ({doc.hospitalCity || 'N/A'})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time Slots Picker Side panel */}
        <div className="lg:col-span-1">
          {selectedDoctor ? (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm space-y-6 animate-slide-in">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduling Booking for</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h2>
                <span className="text-xs text-primary-500 font-semibold">{selectedDoctor.specialization}</span>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={14} />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Slots Roster */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Slots</span>
                
                {loadingSlots ? (
                  <div className="flex py-8 justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-start gap-2 text-xs">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <p>No available booking slots on this date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => openBookingForm(slot)}
                        className="py-2.5 px-3 bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white rounded-xl text-xs font-bold border border-primary-500/10 hover:border-transparent transition-all flex items-center justify-center gap-1"
                      >
                        <Clock size={12} />
                        {slot.startTime.substring(0,5)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl h-64 flex flex-col items-center justify-center gap-3">
              <Stethoscope size={36} className="text-slate-400 animate-pulse" />
              <p className="text-xs text-slate-400 max-w-xs font-medium">Select a doctor from the roster to view their real-time slot calendar and schedule a visit.</p>
            </div>
          )}
        </div>

      </div>

      {/* Booking Form Modal Overlay */}
      {isBookingOpen && selectedSlot && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsBookingOpen(false)} />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold">Book Appointment</h2>
              <button 
                onClick={() => setIsBookingOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-250 border border-slate-200 dark:border-slate-850 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              
              {/* Doctor Details Summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                  <span>DOCTOR</span>
                  <span className="text-primary-500">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>FACILITY</span>
                  <span>{selectedDoctor.hospitalName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>DATE</span>
                  <span>{selectedSlot.date}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>TIME BLOCK</span>
                  <span>{selectedSlot.startTime.substring(0,5)} - {selectedSlot.endTime.substring(0,5)}</span>
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Describe Symptoms / Complaint</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-slate-400">
                    <FileText size={16} />
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Provide details about symptoms, duration, or any other medical requests..."
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-primary-600/10 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Booking...' : (
                    <>
                      <BookmarkPlus size={16} />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>

            </form>
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

export default DoctorSearch;
