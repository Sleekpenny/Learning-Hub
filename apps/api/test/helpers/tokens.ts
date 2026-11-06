import { signAccessToken } from '../../src/lib/tokens';
import { testEnv } from './test-app';

// "Authorization: Bearer ..." header for a fake logged in user
export function loginAs(role: 'LEARNER' | 'ADMIN') {
  const token = signAccessToken({ sub: 'user-1', role }, testEnv.JWT_ACCESS_SECRET, 600);
  return { Authorization: `Bearer ${token}` };
}