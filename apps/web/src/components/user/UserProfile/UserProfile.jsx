import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save } from 'lucide-react';
import { selectCurrentUser, updateUser } from '../../../store/slices/authSlice';
import Input from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';
import Avatar from '../../ui/Avatar/Avatar';
import { userAPI } from '../../../services/api/userAPI';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
});

/**
 * User profile edit form.
 */
export default function UserProfile() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await userAPI.updateMe(data);
      dispatch(updateUser(res.data.data));
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
    setIsLoading(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const res = await userAPI.uploadAvatar(formData);
      dispatch(updateUser({ avatar: res.data.data.avatar }));
      toast.success('Avatar updated.');
    } catch {
      toast.error('Failed to upload avatar.');
    }
    setIsUploadingAvatar(false);
  };

  return (
    <div className="space-y-8">
      {/* Avatar section */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar
            src={user?.avatar?.url}
            name={user?.firstName}
            size="2xl"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent-gold text-bg flex items-center justify-center shadow-gold-glow hover:bg-yellow-400 transition-colors"
            aria-label="Change avatar"
          >
            {isUploadingAvatar ? (
              <div className="w-3 h-3 border-2 border-bg border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={14} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="sr-only"
            aria-label="Upload avatar"
          />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-text-muted text-sm">{user?.email}</p>
          <span className="badge-gold text-xs mt-1 inline-block capitalize">
            {user?.membershipTier} Member
          </span>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            error={errors.firstName?.message}
            required
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            error={errors.lastName?.message}
            required
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={user?.email || ''}
          disabled
          hint="Email cannot be changed. Contact support if needed."
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!isDirty}
          leftIcon={<Save size={16} />}
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
}
