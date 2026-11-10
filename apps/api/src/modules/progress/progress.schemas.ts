import { z } from 'zod';

export const progressSchema = z.object({
  // Where the video is right now, in whole seconds
  positionSeconds: z.number().int().min(0).max(36000),
  // Send true when the video has ended
  completed: z.boolean().optional(),
});