import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

export default function App() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-text-primary">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
