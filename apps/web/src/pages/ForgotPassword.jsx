import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import Input from '../components/ui/Input/Input';
import Button from '../components/ui/Button/Button';
import { authAPI } from '../services/api/authAPI';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <SEOHead title="Forgot Password" noIndex />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block text-3xl font-display font-bold text-gradient-gold mb-6">
              NEXUS<span className="text-accent-cyan">.</span>
            </Link>
            <h1 className="text-2xl font-display font-semibold text-text-primary">
              {sent ? 'Check your email' : 'Forgot your password?'}
            </h1>
            <p className="text-text-muted mt-2">
              {sent
                ? `We sent a reset link to ${getValues('email')}`
                : "No worries, we'll send you reset instructions."}
            </p>
          </div>

          <div className="card p-8">
            {sent ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-success" />
                </div>
                <p className="text-text-secondary text-sm">
                  If an account exists with that email, you'll receive a password reset link within a few minutes.
                  Check your spam folder if you don't see it.
                </p>
                <Button
                  onClick={() => setSent(false)}
                  variant="outline"
                  fullWidth
                >
                  Try a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={16} />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" fullWidth isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>
            )}
          </div>

          <p className="text-center mt-6 text-sm text-text-muted">
            <Link to="/login" className="flex items-center justify-center gap-1 text-accent-cyan hover:text-cyan-300 transition-colors">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
