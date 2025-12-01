import { z } from 'zod';

export const countries = ['Austria', 'Germany', 'Switzerland'] as const;

export const countryCityMap: Record<string, string[]> = {
  Austria: ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz'],
  Germany: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'],
  Switzerland: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
};

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  age: z.string()
    .min(1, 'Age is required')
    .refine((val) => !isNaN(Number(val)), 'Age must be a number')
    .refine((val) => Number(val) >= 18 && Number(val) <= 120, 'Age must be between 18 and 120'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number is too long')
    .regex(/^[+]?[\d\s()-]+$/, 'Invalid phone number format'),
  street: z.string().min(2, 'Street is required').max(100, 'Street name is too long'),
  house_number: z.string().min(1, 'House number is required').max(10, 'House number is too long'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password1: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  new_password2: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password1 === data.new_password2, {
  message: "Passwords don't match",
  path: ['new_password2'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const resetPasswordConfirmSchema = z.object({
  new_password1: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  new_password2: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password1 === data.new_password2, {
  message: "Passwords don't match",
  path: ['new_password2'],
});

export type ResetPasswordConfirmFormData = z.infer<typeof resetPasswordConfirmSchema>;


