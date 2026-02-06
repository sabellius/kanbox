/**
 * Central configuration export
 */

import dotenv from "dotenv";
import authConfig from "./auth.js";
import dbConfig from "./db.js";
import serverConfig from "./server.js";
import cloudinaryConfig from "./cloudinary.js";

dotenv.config();

const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

export function validateEnv() {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env file."
    );
  }

  if (serverConfig.env === "production" && process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }
}

export const config = {
  ...serverConfig,
  auth: authConfig,
  db: dbConfig,
  cloudinary: cloudinaryConfig,
};
