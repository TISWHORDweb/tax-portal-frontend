import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Components
import Login from './components/auth/Login';
import Enroll from './components/auth/Enroll';

// User Components
import UserDashboard from './components/user/UserDashboard';
import DownloadTemplates from './components/user/DownloadTemplates';
import SubmitReturns from './components/user/SubmitReturns';
import UserProfile from './components/user/UserProfile';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ManageUsers from './components/admin/ManageUsers';
import ManageTemplates from './components/admin/ManageTemplates';
import ReviewSubmissions from './components/admin/ReviewSubmissions';

// Shared Components
import ProtectedRoute from './components/shared/ProtectedRoute';
import NotFound from './components/shared/NotFound';
import Layout from './components/shared/Layout';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/enroll" element={<Enroll />} />

        {/* User Routes */}
        {/* <Route element={<ProtectedRoute allowedRoles={['user']} />}> */}
          <Route element={<Layout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/templates" element={<DownloadTemplates />} />
            <Route path="/user/submit" element={<SubmitReturns />} />
            <Route path="/user/profile" element={<UserProfile />} />
          </Route>
        {/* </Route> */}

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<Layout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/templates" element={<ManageTemplates />} />
            <Route path="/admin/submissions" element={<ReviewSubmissions />} />
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;