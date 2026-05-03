import React, { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import AuthModal from '../components/auth/AuthModal/AuthModal';

export default function Login() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';

  if (isAuthenticated) return <Navigate to={redirect} replace />;

  return (
    <>
      <SEOHead title="Sign In" noIndex />
      <div className="min-h-screen flex items-center justify-center">
        {/* AuthModal handles the form — render it inline for the dedicated page */}
        <div className="w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <div className="text-3xl font-display font-bold text-gradient-gold mb-2">NEXUS<span className="text-accent-cyan">.</span></div>
            <h1 className="text-2xl font-display font-semibold text-text-primary">Welcome back</h1>
            <p className="text-text-muted mt-1">Sign in to your account</p>
          </div>
          {/* The auth modal is rendered globally — redirect handled by store */}
        </div>
      </div>
    </>
  );
}
