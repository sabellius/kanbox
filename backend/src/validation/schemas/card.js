import { z } from "zod";
import { objectIdSchema, userObjectSchema, dateSchema } from "./common.js";

const coverSchema = z.strictObject({
  img: z.url().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  textOverlay: z.boolean().optional(),
});

const attachmentSchema = z.strictObject({
  url: z.url(),
  name: z.string().max(255).trim(),
  publicId: z.string().max(255).trim().optional(),
});

const commentSchema = z.strictObject({
  text: z.string().min(1).max(1000).trim(),
});

export const createCardSchema = z.strictObject({
  boardId: objectIdSchema,
  listId: objectIdSchema,
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  cover: coverSchema.optional(),
  labelIds: z.array(objectIdSchema).optional(),
  assignees: z.array(userObjectSchema).optional(),
  startDate: dateSchema,
  dueDate: dateSchema,
});

export const updateCardSchema = z.strictObject({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  cover: coverSchema.optional(),
  labelIds: z.array(objectIdSchema).optional(),
  assignees: z.array(userObjectSchema).optional(),
  startDate: dateSchema,
  dueDate: dateSchema,
  archivedAt: dateSchema,
});

export const moveCardSchema = z.strictObject({
  listId: objectIdSchema,
  boardId: objectIdSchema,
  targetIndex: z.number().int().min(0),
});

export const addCommentSchema = commentSchema;
export const addAttachmentSchema = attachmentSchema;
export const updateCoverSchema = coverSchema;
