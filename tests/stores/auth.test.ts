import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

describe('Auth Store', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with no token', () => {
    const store = useAuthStore();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('should set token and update authentication state', () => {
    const store = useAuthStore();
    const token = 'test-token-123';
    
    store.setToken(token);
    
    expect(store.token).toBe(token);
    expect(store.isAuthenticated).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe(token);
  });

  it('should clear token on logout', () => {
    const store = useAuthStore();
    store.setToken('test-token');
    
    store.logout();
    
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should load token from localStorage on initialization', () => {
    const token = 'saved-token';
    localStorage.setItem('auth_token', token);
    
    const store = useAuthStore();
    
    expect(store.token).toBe(token);
    expect(store.isAuthenticated).toBe(true);
  });
});

