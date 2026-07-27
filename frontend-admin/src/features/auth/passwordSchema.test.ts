import { describe, expect, it } from 'vitest';
import { passwordChangeSchema } from './passwordSchema';

const validPasswordChange = {
  currentPassword: 'current-password',
  newPassword: 'new-secure-password-123',
  confirmPassword: 'new-secure-password-123',
};

describe('passwordChangeSchema', () => {
  it('accepts matching passwords that satisfy the policy', () => {
    expect(passwordChangeSchema.safeParse(validPasswordChange).success).toBe(true);
  });

  it('rejects a confirmation that does not match', () => {
    const result = passwordChangeSchema.safeParse({
      ...validPasswordChange,
      confirmPassword: 'different-password-123',
    });

    expect(result.success).toBe(false);
  });

  it('requires at least one letter and one number', () => {
    expect(
      passwordChangeSchema.safeParse({
        ...validPasswordChange,
        newPassword: '123456789012',
        confirmPassword: '123456789012',
      }).success,
    ).toBe(false);
  });
});
