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

  it('authenticates RJ broadcaster using official RJ ID (e.g. RJ-RONIT, RJ-DIVA)', async () => {
    // Exact RJ ID
    const resRonit = await authService.login({
      email: 'RJ-RONIT',
      password: 'rj123',
    });
    expect(resRonit.user).toBeDefined();
    expect(resRonit.user.role).toBe('rj');
    expect(resRonit.user.rjId).toBe('RJ-RONIT');

    // Case-insensitive & without hyphens
    const resDiva = await authService.login({
      email: 'rjdiva',
      password: 'rj123',
    });
    expect(resDiva.user).toBeDefined();
    expect(resDiva.user.role).toBe('rj');
    expect(resDiva.user.rjId).toBe('RJ-DIVA');
  });

  it('allows station director to provision new RJ with designated RJ ID and authenticate', async () => {
    const createdRJ = authService.createRJUser({
      name: 'Arjun Kapoor',
      email: 'rj.arjun@smcf.edu.in',
      rjId: 'RJ-ARJUN',
      password: 'custom_rj_pass',
      department: 'Radio & Sound Engineering',
    });

    expect(createdRJ.rjId).toBe('RJ-ARJUN');
    expect(createdRJ.role).toBe('rj');

    // Authenticate using the newly provisioned RJ ID
    const loginRes = await authService.login({
      email: 'RJ-ARJUN',
      password: 'custom_rj_pass',
    });

    expect(loginRes.user).toBeDefined();
    expect(loginRes.user.name).toBe('Arjun Kapoor');
    expect(loginRes.user.rjId).toBe('RJ-ARJUN');
    expect(loginRes.user.role).toBe('rj');
  });

  it('allows open public listener signup with personal email (e.g. gmail.com) and no student ID', async () => {
    const res = await authService.signup({
      name: 'Maya Lin',
      email: 'mayalin.radiofan@gmail.com',
      password: 'mypassword123',
      department: 'General Listener / Public',
      role: 'student',
      activateSubscription: true,
    });

    expect(res.user).toBeDefined();
    expect(res.user.email).toBe('mayalin.radiofan@gmail.com');
    expect(res.user.studentId).toMatch(/^LSTN-/);
    expect(res.user.department).toBe('General Listener / Public');
    expect(res.user.subscriptionStatus).toBe('active');
  });
});

