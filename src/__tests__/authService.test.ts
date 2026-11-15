import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/authService';

describe('Authentication Service (RBAC & Local Repository)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('authenticates valid seed student account', async () => {
    const res = await authService.login({
      email: 'student@smcf.edu.in',
      password: 'student123',
      role: 'student',
    });

    expect(res.user).toBeDefined();
    expect(res.user.email).toBe('student@smcf.edu.in');
    expect(res.user.role).toBe('student');
    expect(authService.getCurrentUser()?.email).toBe('student@smcf.edu.in');
  });

  it('authenticates valid seed admin account', async () => {
    const res = await authService.login({
      email: 'admin@smcf.edu.in',
      password: 'admin123',
      role: 'admin',
    });

    expect(res.user).toBeDefined();
    expect(res.user.role).toBe('admin');
  });

  it('rejects incorrect password with an informative error', async () => {
    await expect(
      authService.login({
        email: 'student@smcf.edu.in',
        password: 'wrong_password_999',
      })
    ).rejects.toThrow('Incorrect password');
  });

  it('allows registering a new student account', async () => {
    const res = await authService.signup({
      name: 'Simranjeet Singh',
      email: 'simranjeet@smcf.edu.in',
      password: 'mypassword123',
      department: 'Film Studies',
      studentId: '2024-FLM-099',
      role: 'student',
    });

    expect(res.user).toBeDefined();
    expect(res.user.name).toBe('Simranjeet Singh');
    expect(res.user.department).toBe('Film Studies');
    expect(authService.getCurrentUser()?.id).toBe(res.user.id);
  }, 15000);

  it('allows admin to switch user role dynamically', () => {
    const users = authService.getAllUsers();
    expect(users.length).toBeGreaterThan(0);

    const targetUser = users[0];
    const originalRole = targetUser.role;
    const newRole = originalRole === 'student' ? 'rj' : 'student';

    const updated = authService.updateUserRole(targetUser.id, newRole);
    expect(updated).toBe(true);

    const reloaded = authService.getAllUsers().find((u) => u.id === targetUser.id);
    expect(reloaded?.role).toBe(newRole);
  });
});

