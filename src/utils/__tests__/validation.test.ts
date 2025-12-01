import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validatePassword,
  validatePasswordConfirmation,
} from '../validation';

describe('validateUsername', () => {
  it('should return null for valid username (8+ characters)', () => {
    expect(validateUsername('username1')).toBeNull();
    expect(validateUsername('verylongusername')).toBeNull();
  });

  it('should return error for short username', () => {
    expect(validateUsername('short')).toBe('Логин должен содержать минимум 8 символов');
    expect(validateUsername('')).toBe('Логин должен содержать минимум 8 символов');
  });
});

describe('validatePassword', () => {
  it('should return null for valid password', () => {
    expect(validatePassword('Password1')).toBeNull();
    expect(validatePassword('ValidPass123')).toBeNull();
  });

  it('should return error for short password', () => {
    expect(validatePassword('Pass1')).toBe('Пароль должен содержать минимум 8 символов');
  });

  it('should return error for password without uppercase', () => {
    expect(validatePassword('password1')).toBe('Пароль должен содержать минимум 1 заглавную букву');
  });

  it('should return error for password without number', () => {
    expect(validatePassword('Password')).toBe('Пароль должен содержать минимум 1 цифру');
  });
});

describe('validatePasswordConfirmation', () => {
  it('should return null when passwords match', () => {
    expect(validatePasswordConfirmation('Password1', 'Password1')).toBeNull();
  });

  it('should return error when passwords do not match', () => {
    expect(validatePasswordConfirmation('Password1', 'Password2')).toBe('Пароль не совпадает');
  });
});

