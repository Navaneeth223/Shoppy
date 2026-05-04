import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../../ui/Input/Input';
import Select from '../../ui/Select/Select';
import Button from '../../ui/Button/Button';
import { addressSchema } from '../../../utils/validators';

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'IN', label: 'India' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
];

const ADDRESS_LABELS = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
];

/**
 * Reusable address form component.
 */
export default function AddressForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Address',
  showLabel = true,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'US',
      label: 'home',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {showLabel && (
        <Select
          label="Address Label"
          options={ADDRESS_LABELS}
          error={errors.label?.message}
          {...register('label')}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          required
          {...register('firstName')}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          required
          {...register('lastName')}
        />
      </div>

      <Input
        label="Company (optional)"
        placeholder="Acme Inc."
        error={errors.company?.message}
        {...register('company')}
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 000-0000"
        error={errors.phone?.message}
        required
        {...register('phone')}
      />

      <Input
        label="Address Line 1"
        placeholder="123 Main Street"
        error={errors.addressLine1?.message}
        required
        {...register('addressLine1')}
      />

      <Input
        label="Address Line 2 (optional)"
        placeholder="Apt, Suite, Unit, etc."
        error={errors.addressLine2?.message}
        {...register('addressLine2')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="San Francisco"
          error={errors.city?.message}
          required
          {...register('city')}
        />
        <Input
          label="State / Province"
          placeholder="CA"
          error={errors.state?.message}
          required
          {...register('state')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Postal Code"
          placeholder="94105"
          error={errors.postalCode?.message}
          required
          {...register('postalCode')}
        />
        <Select
          label="Country"
          options={COUNTRIES}
          error={errors.country?.message}
          required
          {...register('country')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
