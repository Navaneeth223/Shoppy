import { z } from 'zod';

// ─── Reusable Zod schemas ─────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/\d/, 'Must contain at least one number');

export const phoneSchema = z
  .string()
  .min(7, 'Please enter a valid phone number')
  .regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number format');

export const nameSchema = z
  .string()
  .min(1, 'This field is required')
  .max(50, 'Cannot exceed 50 characters')
  .trim();

// ─── Form schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const addressSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  addressLine1: z.string().min(1, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  label: z.enum(['home', 'work', 'other']).optional(),
  isDefault: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating is required').max(5),
  title: z.string().max(200).optional(),
  body: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(5000, 'Review cannot exceed 5000 characters'),
  orderId: z.string().min(1, 'Order ID is required'),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export const sellerApplicationSchema = z.object({
  storeName: z
    .string()
    .min(3, 'Store name must be at least 3 characters')
    .max(100, 'Store name cannot exceed 100 characters'),
  description: z
    .string()
    .min(20, 'Please provide a description (min 20 characters)')
    .max(500),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
});
