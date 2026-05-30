import { z } from "zod";

const allocationItemSchema = z.object({
  name: z.string().min(1).max(100),
  percentage: z.number().min(0).max(100),
  targetAmount: z.number().min(0),
  assets: z.string().max(500).optional(),
  role: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createGoalSchema = z.object({
  goalName: z.string().min(1).max(255),
  targetAmount: z.number().positive(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  initialPrincipal: z.number().min(0).optional(),
  allocations: z.array(allocationItemSchema).optional(),
});

export const updateGoalSchema = z.object({
  goalName: z.string().min(1).max(255).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  initialPrincipal: z.number().min(0).optional(),
  allocations: z.array(allocationItemSchema).optional(),
});

export type AllocationInput = z.infer<typeof allocationItemSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
