import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobListings from './pages/JobListings';
import JobApplications from './pages/JobApplications';
import SavedApplications from './pages/SavedApplications';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<JobListings />} />
          <Route path="jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="saved-applications" element={<SavedApplications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;