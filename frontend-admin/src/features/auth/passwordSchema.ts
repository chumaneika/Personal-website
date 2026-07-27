import { z } from 'zod';

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Enter the current password.')
      .max(128, 'Password is too long.'),
    newPassword: z
      .string()
      .min(12, 'Use at least 12 characters.')
      .max(128, 'Password is too long.')
      .regex(/[A-Za-z]/, 'Include at least one letter.')
      .regex(/\d/, 'Include at least one number.'),
    confirmPassword: z.string().min(1, 'Confirm the new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
