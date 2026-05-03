import React, { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRoutes';
import { useDispatch } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import { loadGuestCart } from './store/slices/cartSlice';
import Spinner from './components/ui/Spinner/Spinner';

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="text-3xl font-display font-bold text-gradient-gold">NEXUS</div>
        <Spinner size="md" />
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());
    // Load guest cart if not authenticated
    dispatch(loadGuestCart());
  }, [dispatch]);

  return (
    <Suspense fallback={<AppLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
