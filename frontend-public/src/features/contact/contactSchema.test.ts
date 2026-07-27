import { describe, expect, it } from 'vitest';
import { contactSchema } from './contactSchema';

const validContactMessage = {
  senderName: 'Visitor',
  senderEmail: 'visitor@example.com',
  message: 'I would like to discuss a project.',
  website: '',
};

describe('contactSchema', () => {
  it('accepts a valid contact message', () => {
    expect(contactSchema.safeParse(validContactMessage).success).toBe(true);
  });

  it('rejects invalid email addresses and oversized honeypot values', () => {
    const result = contactSchema.safeParse({
      ...validContactMessage,
      senderEmail: 'not-an-email',
      website: 'x'.repeat(201),
    });

    expect(result.success).toBe(false);
  });
});
