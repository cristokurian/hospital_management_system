import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { 
  Stethoscope, 
  Building2, 
  MapPin, 
  Trash2, 
  Mail, 
  Phone,
  Search,
  Check
} from 'lucide-react';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch hospitals (for drop-down assignments and filters)
      const hospRes = await api.get('/admin/hospitals');
      if (hospRes.data && hospRes.data.success) {
        setHospitals(hospRes.data.data);
      }

      // 2. Fetch doctors. We can call our patient search doctors API which returns all doctors by query.
      // Wait, can we call a general search doctors API?
      // In PatientController, we have `/api/patient/doctors`. Can we reuse it? Yes, we can request it, or create a specific admin route. But since `/api/patient/doctors` is open to authenticated users and returns DoctorResponse list, it's perfect!
      const docRes = await api.get('/patient/doctors');
      if (docRes.data && docRes.data.success) {
        setDoctors(docRes.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch doctor roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignHospital = async (doctorId, hospitalId) => {
    try {
      const url = `/admin/doctors/${doctorId}/assign` + (hospitalId ? `?hospitalId=${hospitalId}` : '');
      const res = await api.put(url);
      if (res.data && res.data.success) {
        showToast('Hospital assignment updated successfully', 'success');
        
        // Update local state
        setDoctors(doctors.map(d => {
          if (d.id === doctorId) {
            const assignedHosp = hospitals.find(h => h.id === parseInt(hospitalId)) || null;
            return {
              ...d,
              hospitalId: assignedHosp ? assignedHosp.id : null,
              hospitalName: assignedHosp ? assignedHosp.name : 'Unassigned',
              hospitalCity: assignedHosp ? assignedHosp.city : ''
            };
          }
          return d;
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign doctor to hospital', 'error');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this doctor account? This action removes their access credentials, availability schedules, and unbooked slots.')) {
      return;
    }
    try {
      const res = await api.delete(`/admin/doctors/${id}`);
      if (res.data && res.data.success) {
        showToast('Doctor account deleted successfully', 'success');
        setDoctors(doctors.filter(d => d.id !== id));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove doctor account', 'error');
    }
  };

  // Extract unique specializations list for filter select box
  const specializations = [...new Set(doctors.map(d => d.specialization))].filter(Boolean);

  const filteredDoctors = doctors.filter(doc => {
    const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
    const matchesQuery = fullName.includes(searchQuery.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpec = specializationFilter === '' || doc.specialization === specializationFilter;
    
    const matchesHosp = hospitalFilter === '' || 
                          (hospitalFilter === 'unassigned' && !doc.hospitalId) || 
                          (doc.hospitalId?.toString() === hospitalFilter);

    return matchesQuery && matchesSpec && matchesHosp;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Doctor Roster</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Assign medical practitioners to hospital branches and manage profiles.</p>
      </div>

      {/* Filters Area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Text Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or specialization..."
            className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
        </div>

        {/* Specialization Filter */}
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="block w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
        >
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        {/* Hospital Assignment Filter */}
        <select
          value={hospitalFilter}
          onChange={(e) => setHospitalFilter(e.target.value)}
          className="block w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
        >
          <option value="">All Hospitals</option>
          <option value="unassigned">Unassigned Only</option>
          {hospitals.map((hosp) => (
            <option key={hosp.id} value={hosp.id}>{hosp.name}</option>
          ))}
        </select>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
          <p className="text-slate-400 font-medium">No doctors match your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div className="space-y-4">
                
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-500 dark:bg-indigo-950/20 rounded-2xl shrink-0">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Dr. {doc.firstName} {doc.lastName}</h3>
                      <span className="inline-block text-[11px] font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full mt-1.5">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDoctor(doc.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/15 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl transition-colors shrink-0"
                    title="Delete Account"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8">
                  {doc.biography || 'No professional biography added yet.'}
                </p>

                {/* Contact */}
                <div className="space-y-1 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail size={12} />
                    <span>{doc.email}</span>
                  </div>
                  {doc.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={12} />
                      <span>{doc.phone}</span>
                    </div>
                  )}
                </div>

                {/* Assignment Dropdown Selector */}
                <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/40 pt-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hospital Assignment</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={doc.hospitalId || ''}
                      onChange={(e) => handleAssignHospital(doc.id, e.target.value)}
                      className="block flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Unassigned (None)</option>
                      {hospitals.map((hosp) => (
                        <option key={hosp.id} value={hosp.id}>
                          {hosp.name} ({hosp.city})
                        </option>
                      ))}
                    </select>
                    {doc.hospitalId ? (
                      <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0" title="Assigned">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-2 rounded-xl shrink-0 font-bold">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

              </div>
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

export default DoctorManagement;
