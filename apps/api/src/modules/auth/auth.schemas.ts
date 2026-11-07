import { z } from 'zod';

/** Emails are normalised so "Ada@Mail.com " and "ada@mail.com" are the same account. */
const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'));

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters') // bcrypt ignores everything after 72 bytes
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password,
  country: z.string().trim().min(2, 'Country is required').max(60),
  areaOfInterest: z.string().trim().min(2, 'Pick an area of interest').max(60),
});

export const loginSchema = z.object({
  email,
  // Do not apply strength rules on login: only check that something was sent.
  password: z.string().min(1, 'Password is required').max(72),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Which login form the user used. The web app sends this in the `X-Login-Portal` header.
 * No header means the learner form, so old clients and curl keep working for learners.
 */
export const loginPortalSchema = z.enum(['learner', 'admin']);
export type LoginPortal = z.infer<typeof loginPortalSchema>;