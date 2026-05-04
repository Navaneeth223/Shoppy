import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));

export default function App() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-white">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
