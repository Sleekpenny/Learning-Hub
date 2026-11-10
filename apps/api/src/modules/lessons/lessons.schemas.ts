import { z } from 'zod';

export const lessonSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  videoUrl: z.url('Video must be a valid URL'),
  durationSeconds: z.number().int().min(1, 'Duration must be at least 1 second').max(36000),
});

export const updateLessonSchema = lessonSchema.partial();

export const reorderSchema = z.object({
  lessonIds: z.array(z.string()).min(1, 'Send the lesson ids in the new order'),
});