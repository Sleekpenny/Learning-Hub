import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.string().trim().min(2, 'Category is required').max(50),
  thumbnailUrl: z.url('Thumbnail must be a valid URL').nullish(),
  published: z.boolean().optional(),
});

// Every field is optional when editing
export const updateCourseSchema = courseSchema.partial();

export const listQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListQuery = z.infer<typeof listQuerySchema>;