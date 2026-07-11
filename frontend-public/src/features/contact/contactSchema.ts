import { z } from 'zod';

export const contactSchema = z.object({
  senderName: z.string().trim().min(1, 'Name is required.').max(120, 'Use 120 characters or fewer.'),
  senderEmail: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.').max(254, 'Use 254 characters or fewer.'),
  message: z.string().trim().min(1, 'Message is required.').max(5000, 'Use 5000 characters or fewer.'),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
