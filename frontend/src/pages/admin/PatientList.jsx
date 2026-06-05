import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Activity, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  X
} from 'lucide-react';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal detail states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const url = `/admin/patients` + (query ? `?query=${encodeURIComponent(query)}` : '');
      const res = await api.get(url);
      if (res.data && res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to retrieve patient index', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Debounced/instant query triggers
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(searchQuery);
    }, 400); // 400ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const viewPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
    setLoadingHistory(true);
    setAppointments([]);

    try {
      const res = await api.get(`/api/admin/patients/${patient.id}/appointments`);
      if (res.data && res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      showToast('Could not load appointment history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'APPROVED':
        return 'text-indigo-650 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400';
      case 'COMPLETED':
        return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-450';
      case 'CANCELLED':
        return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Roster</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor patient records, profiles, and historical clinical visits.</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, email, or phone..."
          className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
        />
      </div>

      {/* Patients Table / Grid */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
          <p className="text-slate-400 font-medium">No registered patients found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {pat.firstName} {pat.lastName}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{pat.email}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{pat.phone || 'N/A'}</td>
                    <td className="py-4 px-6">
                      {pat.bloodGroup ? (
                        <span className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-500 font-bold rounded-lg text-xs">
                          {pat.bloodGroup}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Unspecified</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => viewPatientDetails(pat)}
                        className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors border border-primary-500/10 bg-primary-500/5 hover:bg-primary-500/10 px-3.5 py-1.5 rounded-xl"
                      >
                        Inspect History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Detail & Appointment History Modal */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[85vh] shadow-2xl relative flex flex-col overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                <span className="text-xs text-slate-400">Clinical Profile</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-200 border border-slate-200 dark:border-slate-850 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Demographics Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/35 border border-slate-200/20 p-4 rounded-2xl text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase font-bold">Email Address</span>
                  <span className="font-semibold text-sm flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                    <Mail size={14} /> {selectedPatient.email}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase font-bold">Phone Number</span>
                  <span className="font-semibold text-sm flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                    <Phone size={14} /> {selectedPatient.phone || 'Not provided'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase font-bold">Birth Date / Gender</span>
                  <span className="font-semibold text-sm flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                    <Calendar size={14} /> 
                    {selectedPatient.dateOfBirth || 'N/A'} ({selectedPatient.gender || 'Unspecified'})
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase font-bold">Blood Group</span>
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-350">
                    {selectedPatient.bloodGroup ? (
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded font-bold">
                        {selectedPatient.bloodGroup}
                      </span>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-slate-400 block uppercase font-bold">Home Address</span>
                  <span className="font-semibold text-sm flex items-start gap-1.5 text-slate-700 dark:text-slate-350">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <span>{selectedPatient.address || 'Address detail not populated.'}</span>
                  </span>
                </div>
              </div>

              {/* Appointment History Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Appointment Logs</h3>

                {loadingHistory ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                  </div>
                ) : appointments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No medical appointment history on record for this patient.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((app) => (
                      <div 
                        key={app.id}
                        className="p-4 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs bg-white dark:bg-slate-900/50"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{app.doctorName}</span>
                            <span className="text-[10px] text-slate-400">({app.specialization})</span>
                          </div>
                          
                          <p className="text-slate-400">{app.hospitalName} ({app.hospitalCity})</p>

                          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-450">
                            <span className="flex items-center gap-1"><Calendar size={13} /> {app.appointmentDate}</span>
                            <span className="flex items-center gap-1"><Clock size={13} /> {app.startTime} - {app.endTime}</span>
                          </div>

                          {app.notes && (
                            <div className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-[11px] border border-slate-200/10">
                              <span className="font-bold text-slate-400">Notes:</span> {app.notes}
                            </div>
                          )}
                        </div>

                        <span className={`inline-block px-3 py-1 font-bold rounded-xl border text-[10px] shrink-0 text-center w-fit ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
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

export default PatientList;
