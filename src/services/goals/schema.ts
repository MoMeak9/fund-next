import { z } from "zod";

export const createGoalSchema = z.object({
  goalName: z.string().min(1).max(255),
  targetAmount: z.number().positive(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  initialPrincipal: z.number().min(0).optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
