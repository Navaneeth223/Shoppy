import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import Input from '../components/ui/Input/Input';
import Button from '../components/ui/Button/Button';
import { authAPI } from '../services/api/authAPI';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, data.password);
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <SEOHead title="Reset Password" noIndex />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block text-3xl font-display font-bold text-gradient-gold mb-6">
              NEXUS<span className="text-accent-cyan">.</span>
            </Link>
            <h1 className="text-2xl font-display font-semibold text-text-primary">Set new password</h1>
            <p className="text-text-muted mt-2">Must be at least 8 characters</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Create a strong password"
                leftIcon={<Lock size={16} />}
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your new password"
                leftIcon={<Lock size={16} />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button type="submit" fullWidth isLoading={isLoading}>
                Reset Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
