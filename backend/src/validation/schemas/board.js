import { z } from "zod";
import { objectIdSchema, appearanceSchema } from "./common.js";

const labelSchema = z.strictObject({
  title: z.string().min(1).max(50).trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color hex format"),
});

export const createBoardSchema = z.strictObject({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  appearance: appearanceSchema.optional(),
  workspaceId: objectIdSchema,
});

export const updateBoardSchema = z.strictObject({
  title: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  appearance: appearanceSchema.optional(),
});

export const createLabelSchema = labelSchema;
export const updateLabelSchema = labelSchema.partial();

export const boardFilterQuerySchema = z.object({
  title: z.string().optional(),
  labels: z.string().optional(),
  members: z.string().optional(),
  noMembers: z.enum(["true", "false", "1", "0"]).optional(),
  includeNoLabels: z.enum(["true", "false", "1", "0"]).optional(),
});
