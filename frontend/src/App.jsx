import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalManagement from './pages/admin/HospitalManagement';
import DoctorManagement from './pages/admin/DoctorManagement';
import PatientList from './pages/admin/PatientList';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ScheduleManagement from './pages/doctor/ScheduleManagement';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorSearch from './pages/patient/DoctorSearch';

// Shared pages
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            
            {/* Admin Routes */}
            <Route element={<RoleRoute allowedRoles="ADMIN" />}>
              <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
              <Route path="/admin/hospitals" element={<Layout><HospitalManagement /></Layout>} />
              <Route path="/admin/doctors" element={<Layout><DoctorManagement /></Layout>} />
              <Route path="/admin/patients" element={<Layout><PatientList /></Layout>} />
            </Route>

            {/* Doctor Routes */}
            <Route element={<RoleRoute allowedRoles="DOCTOR" />}>
              <Route path="/doctor" element={<Layout><DoctorDashboard /></Layout>} />
              <Route path="/doctor/schedules" element={<Layout><ScheduleManagement /></Layout>} />
              <Route path="/doctor/profile" element={<Layout><Profile /></Layout>} />
            </Route>

            {/* Patient Routes */}
            <Route element={<RoleRoute allowedRoles="PATIENT" />}>
              <Route path="/patient" element={<Layout><PatientDashboard /></Layout>} />
              <Route path="/patient/search" element={<Layout><DoctorSearch /></Layout>} />
              <Route path="/patient/profile" element={<Layout><Profile /></Layout>} />
            </Route>

          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
