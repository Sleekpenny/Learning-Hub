import bcrypt from 'bcryptjs';

/**
 * bcrypt hashes are salted automatically and deliberately slow, which makes
 * brute-forcing a leaked database impractical. `rounds` is the cost factor (12 is a good default).
 */
export function hashPassword(plain: string, rounds: number): Promise<string> {
  return bcrypt.hash(plain, rounds);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
