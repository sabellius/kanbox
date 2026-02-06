import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
  .string()
  .refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

export const userObjectSchema = z.strictObject({
  userId: objectIdSchema,
  username: z.string().min(3).max(30),
  fullname: z.string().min(1).max(100),
});

export const appearanceSchema = z.strictObject({
  background: z.string().nullable().optional(),
});

export const dateSchema = z.iso.datetime().optional();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});
