import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { closeAuthModal, selectAuthModalMode, setAuthModalMode } from '../../../store/slices/uiSlice';
import { loginUser, registerUser } from '../../../store/slices/authSlice';
import { authAPI } from '../../../services/api/authAPI';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import Input from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';
import clsx from 'clsx';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and a number'),
});

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export default function AuthModal() {
  const dispatch = useDispatch();
  const mode = useSelector(selectAuthModalMode);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm({ resolver: zodResolver(registerSchema) });
  const forgotForm = useForm({ resolver: zodResolver(forgotSchema) });

  const handleLogin = async (data) => {
    setIsLoading(true);
    const result = await dispatch(loginUser(data));
    setIsLoading(false);
    if (!result.error) {
      dispatch(closeAuthModal());
    }
  };

  const handleRegister = async (data) => {
    setIsLoading(true);
    const result = await dispatch(registerUser(data));
    setIsLoading(false);
    if (!result.error) {
      dispatch(closeAuthModal());
    }
  };

  const handleForgotPassword = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      toast.success('Password reset link sent! Check your email.');
      dispatch(setAuthModalMode('login'));
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    }
    setIsLoading(false);
  };

  const modal = (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => dispatch(closeAuthModal())}
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-modal overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close button */}
        <button
          onClick={() => dispatch(closeAuthModal())}
          className="absolute top-4 right-4 p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-border">
          <div className="text-2xl font-display font-bold text-gradient-gold mb-1">NEXUS<span className="text-accent-cyan">.</span></div>
          <h2 id="auth-modal-title" className="text-xl font-display font-semibold text-text-primary">
            {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {mode === 'login' ? 'Sign in to your account' : mode === 'register' ? 'Join thousands of happy shoppers' : 'Enter your email to reset your password'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={16} />}
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Your password"
                  leftIcon={<Lock size={16} />}
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => dispatch(setAuthModalMode('forgot'))}
                    className="text-xs text-accent-cyan hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" fullWidth isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
                  Sign In
                </Button>

                {/* OAuth */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-surface px-3 text-text-muted">or continue with</span>
                  </div>
                </div>

                <a
                  href="/api/v1/auth/google"
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-full border border-border text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </a>

                <p className="text-center text-sm text-text-muted">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => dispatch(setAuthModalMode('register'))}
                    className="text-accent-cyan hover:text-cyan-300 font-medium transition-colors"
                  >
                    Sign up free
                  </button>
                </p>
              </motion.form>
            )}

            {mode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    placeholder="John"
                    leftIcon={<User size={16} />}
                    error={registerForm.formState.errors.firstName?.message}
                    {...registerForm.register('firstName')}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    error={registerForm.formState.errors.lastName?.message}
                    {...registerForm.register('lastName')}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={16} />}
                  error={registerForm.formState.errors.email?.message}
                  {...registerForm.register('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  leftIcon={<Lock size={16} />}
                  error={registerForm.formState.errors.password?.message}
                  hint="Min 8 chars, uppercase, lowercase, and number"
                  {...registerForm.register('password')}
                />

                <Button type="submit" fullWidth isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
                  Create Account
                </Button>

                <p className="text-center text-xs text-text-muted">
                  By creating an account, you agree to our{' '}
                  <a href="/terms" className="text-accent-cyan hover:underline">Terms</a> and{' '}
                  <a href="/privacy-policy" className="text-accent-cyan hover:underline">Privacy Policy</a>.
                </p>

                <p className="text-center text-sm text-text-muted">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => dispatch(setAuthModalMode('login'))}
                    className="text-accent-cyan hover:text-cyan-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}

            {mode === 'forgot' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={forgotForm.handleSubmit(handleForgotPassword)}
                className="space-y-4"
              >
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={16} />}
                  error={forgotForm.formState.errors.email?.message}
                  hint="We'll send a password reset link to this email."
                  {...forgotForm.register('email')}
                />

                <Button type="submit" fullWidth isLoading={isLoading}>
                  Send Reset Link
                </Button>

                <p className="text-center text-sm text-text-muted">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => dispatch(setAuthModalMode('login'))}
                    className="text-accent-cyan hover:text-cyan-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
}
