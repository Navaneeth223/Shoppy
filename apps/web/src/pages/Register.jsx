import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function Register() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/profile" replace />;

  return (
    <>
      <SEOHead title="Create Account" noIndex />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-display font-bold text-gradient-gold">NEXUS<span className="text-accent-cyan">.</span></div>
          <p className="text-text-muted mt-2">Create your account to get started</p>
        </div>
      </div>
    </>
  );
}
