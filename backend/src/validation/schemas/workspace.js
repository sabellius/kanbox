import { z } from "zod";
import { objectIdSchema, userObjectSchema } from "./common.js";

export const createWorkspaceSchema = z.strictObject({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
});

export const updateWorkspaceSchema = z.strictObject({
  title: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
});

export const addMemberSchema = userObjectSchema;
