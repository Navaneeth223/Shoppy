import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Smartphone, Key, AlertTriangle } from 'lucide-react';
import Input from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';
import { changePasswordSchema } from '../../../utils/validators';
import { userAPI } from '../../../services/api/userAPI';
import { authAPI } from '../../../services/api/authAPI';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/**
 * Security settings — password change and 2FA management.
 */
export default function SecuritySettings() {
  const user = useSelector(selectCurrentUser);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const handleChangePassword = async (data) => {
    setIsChangingPassword(true);
    try {
      await userAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully.');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    }
    setIsChangingPassword(false);
  };

  const handleSetup2FA = async () => {
    setIs2FALoading(true);
    try {
      const res = await authAPI.setup2FA();
      setQrCode(res.data.data.qrCode);
    } catch {
      toast.error('Failed to setup 2FA.');
    }
    setIs2FALoading(false);
  };

  const handleVerify2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) {
      toast.error('Please enter a 6-digit code.');
      return;
    }
    setIs2FALoading(true);
    try {
      await authAPI.verify2FA(twoFACode);
      toast.success('Two-factor authentication enabled!');
      setQrCode(null);
      setTwoFACode('');
    } catch {
      toast.error('Invalid code. Please try again.');
    }
    setIs2FALoading(false);
  };

  const handleDisable2FA = async () => {
    const password = window.prompt('Enter your password to disable 2FA:');
    if (!password) return;

    setIs2FALoading(true);
    try {
      await authAPI.disable2FA(password);
      toast.success('Two-factor authentication disabled.');
    } catch {
      toast.error('Failed to disable 2FA. Check your password.');
    }
    setIs2FALoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
            <Key size={18} className="text-accent-gold" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-text-primary">Change Password</h2>
            <p className="text-xs text-text-muted">Use a strong, unique password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Your current password"
            error={errors.currentPassword?.message}
            required
            {...register('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Create a strong password"
            error={errors.newPassword?.message}
            hint="Min 8 chars, uppercase, lowercase, and number"
            required
            {...register('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={isChangingPassword} leftIcon={<Key size={16} />}>
            Update Password
          </Button>
        </form>
      </section>

      {/* Two-Factor Authentication */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
              <Smartphone size={18} className="text-accent-cyan" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-text-primary">Two-Factor Authentication</h2>
              <p className="text-xs text-text-muted">Add an extra layer of security</p>
            </div>
          </div>
          <span className={clsx(
            'badge text-xs',
            user?.twoFactorEnabled ? 'badge-success' : 'badge-warning'
          )}>
            {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {!user?.twoFactorEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Two-factor authentication adds an extra layer of security. You'll need your authenticator app each time you log in.
            </p>

            {!qrCode ? (
              <Button
                onClick={handleSetup2FA}
                isLoading={is2FALoading}
                variant="secondary"
                leftIcon={<Shield size={16} />}
              >
                Enable 2FA
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-2 border border-border text-center">
                  <p className="text-sm text-text-secondary mb-3">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48 rounded-lg" />
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter 6-digit code"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button onClick={handleVerify2FA} isLoading={is2FALoading}>
                    Verify
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
              <Shield size={16} className="text-success" />
              <p className="text-sm text-success">Your account is protected with 2FA.</p>
            </div>
            <button
              onClick={handleDisable2FA}
              disabled={is2FALoading}
              className="text-sm text-error hover:underline disabled:opacity-50"
            >
              Disable two-factor authentication
            </button>
          </div>
        )}
      </section>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
        <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-warning leading-relaxed">
          Never share your password or 2FA codes with anyone. Nexus Commerce will never ask for your password via email or phone.
        </p>
      </div>
    </div>
  );
}
