import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  FileText,
  KeyRound,
  Save,
  Lock
} from 'lucide-react';

const Profile = () => {
  const { user, refreshUserData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // Profile fields (shared)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Patient fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');

  // Doctor fields
  const [specialization, setSpecialization] = useState('');
  const [biography, setBiography] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'DOCTOR' ? '/doctor/profile' : '/patient/profile';
      const res = await api.get(endpoint);
      if (res.data && res.data.success) {
        const data = res.data.data;
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setPhone(data.phone || '');

        if (user.role === 'PATIENT') {
          setDateOfBirth(data.dateOfBirth || '');
          setGender(data.gender || '');
          setBloodGroup(data.bloodGroup || '');
          setAddress(data.address || '');
        } else if (user.role === 'DOCTOR') {
          setSpecialization(data.specialization || '');
          setBiography(data.biography || '');
        }
      }
    } catch (err) {
      showToast('Failed to load profile settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      showToast('First name and last name are required', 'error');
      return;
    }

    setIsSavingProfile(true);
    const payload = {
      firstName,
      lastName,
      phone,
      dateOfBirth: user.role === 'PATIENT' ? dateOfBirth || null : null,
      gender: user.role === 'PATIENT' ? gender || null : null,
      bloodGroup: user.role === 'PATIENT' ? bloodGroup || null : null,
      address: user.role === 'PATIENT' ? address || null : null,
      specialization: user.role === 'DOCTOR' ? specialization || null : null,
      biography: user.role === 'DOCTOR' ? biography || null : null,
    };

    try {
      const endpoint = user.role === 'DOCTOR' ? '/doctor/profile' : '/patient/profile';
      const res = await api.put(endpoint, payload);
      if (res.data && res.data.success) {
        showToast('Profile updated successfully', 'success');
        // Update user first/last name globally in the navbar
        refreshUserData({ firstName, lastName });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile settings', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('All password fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const endpoint = user.role === 'DOCTOR' ? '/doctor/password' : '/patient/password';
      const res = await api.put(endpoint, { oldPassword, newPassword });
      if (res.data && res.data.success) {
        showToast('Password changed successfully', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Incorrect old password or security block', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profile Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Update personal contact info, clinical specialties, and manage security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <User className="text-primary-500" size={20} />
              General Details
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Email Address (Primary)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={user.email}
                      className="block w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-400 rounded-xl text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Conditional Patient Fields */}
                {user.role === 'PATIENT' && (
                  <>
                    {/* Birth Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Date of Birth</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Calendar size={16} />
                        </div>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Blood Group */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                      >
                        <option value="">Select Blood Group</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Address */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-400">Residential Address</label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 text-slate-400">
                          <MapPin size={16} />
                        </div>
                        <textarea
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Conditional Doctor Fields */}
                {user.role === 'DOCTOR' && (
                  <>
                    {/* Specialization */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-400">Medical Specialization</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Stethoscope size={16} />
                        </div>
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g. Cardiology"
                          className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Biography */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-400">Professional Biography</label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 text-slate-400">
                          <FileText size={16} />
                        </div>
                        <textarea
                          rows={3}
                          value={biography}
                          onChange={(e) => setBiography(e.target.value)}
                          placeholder="Summary of qualifications and clinics..."
                          className="block w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/85 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl shadow-md text-xs transition-all w-fit"
              >
                <Save size={14} />
                {isSavingProfile ? 'Saving...' : 'Save Settings'}
              </button>

            </form>
          </div>
        </div>

        {/* Change Password Form Side block */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="text-primary-500" size={20} />
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              
              {/* Old Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Old Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound size={14} />
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>

            </form>
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

export default Profile;
