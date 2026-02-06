import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const createListSchema = z.strictObject({
  boardId: objectIdSchema,
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
});

export const updateListSchema = z.strictObject({
  title: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
});

export const moveListSchema = z.strictObject({
  boardId: objectIdSchema,
  targetIndex: z.number().int().min(0),
});

export const copyListSchema = z.strictObject({
  targetBoardId: objectIdSchema,
  title: z.string().min(1).max(100).trim().optional(),
});
