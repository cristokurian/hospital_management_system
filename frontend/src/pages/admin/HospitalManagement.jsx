import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Plus, 
  Pencil, 
  Trash2, 
  X,
  FileText,
  Search
} from 'lucide-react';

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null); // null means Add Mode
  
  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/hospitals');
      if (res.data && res.data.success) {
        setHospitals(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to retrieve hospitals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const openAddModal = () => {
    setSelectedHospital(null);
    setName('');
    setAddress('');
    setPhone('');
    setCity('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (hosp) => {
    setSelectedHospital(hosp);
    setName(hosp.name);
    setAddress(hosp.address);
    setPhone(hosp.phone);
    setCity(hosp.city);
    setDescription(hosp.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hospital? All doctors assigned here will lose their hospital reference.')) {
      return;
    }
    try {
      const res = await api.delete(`/admin/hospitals/${id}`);
      if (res.data && res.data.success) {
        showToast('Hospital deleted successfully', 'success');
        setHospitals(hospitals.filter(h => h.id !== id));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete hospital', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address || !phone || !city) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const payload = { name, address, phone, city, description };

    try {
      if (selectedHospital) {
        // Edit Mode
        const res = await api.put(`/admin/hospitals/${selectedHospital.id}`, payload);
        if (res.data && res.data.success) {
          showToast('Hospital updated successfully', 'success');
          setHospitals(hospitals.map(h => h.id === selectedHospital.id ? res.data.data : h));
          setIsModalOpen(false);
        }
      } else {
        // Add Mode
        const res = await api.post('/admin/hospitals', payload);
        if (res.data && res.data.success) {
          showToast('Hospital added successfully', 'success');
          setHospitals([...hospitals, res.data.data]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save hospital details', 'error');
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hospital Branches</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create and modify physical medical facilities in the system.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-600/20 hover:shadow-primary-600/35 transition-all text-sm shrink-0"
        >
          <Plus size={16} /> Add Hospital
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name or city..."
          className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
        />
      </div>

      {/* Hospital list grid */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
          <p className="text-slate-400 font-medium">No hospitals registered yet matching search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hosp) => (
            <div 
              key={hosp.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-50 text-primary-500 dark:bg-primary-950/20 rounded-2xl">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{hosp.name}</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{hosp.city}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8">
                  {hosp.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-450 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{hosp.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{hosp.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  onClick={() => openEditModal(hosp)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(hosp.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold">{selectedHospital ? 'Modify Hospital Branch' : 'Add Hospital Branch'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-200 border border-slate-200 dark:border-slate-850 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Hospital Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. City General Hospital"
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New York"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. (555) 123-4567"
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Full Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Health Ave, Suite 400"
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide department detail, specialties, or notes..."
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-primary-600/10"
                >
                  {selectedHospital ? 'Save Changes' : 'Create Branch'}
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

export default HospitalManagement;
