import { z } from "zod";

export const interactionSchema = z.object({
  projectId: z.string().min(1, "projectIdは必須です"),
  engineerId: z.string().min(1, "engineerIdは必須です"),
  message: z.string().min(1, "messageは必須です"),
  progress: z.string().optional(),
  isRead: z.boolean().optional(),
  readAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
}); 