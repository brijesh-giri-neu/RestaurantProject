import {
  loginSchema,
  signupSchema,
} from '../../src/features/auth/validation/authSchema';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123',
    });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  it('accepts matching passwords with a valid email', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('fails when confirmPassword does not match password', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes('confirmPassword'),
      );
      expect(issue?.message).toBe('Passwords do not match');
    }
  });

  it('rejects an invalid email even when passwords match', () => {
    const result = signupSchema.safeParse({
      email: 'bad',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a short password', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: '123',
      confirmPassword: '123',
    });
    expect(result.success).toBe(false);
  });
});
