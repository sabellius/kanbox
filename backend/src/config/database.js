import mongoose from "mongoose";
import { config } from ".";

export async function connectDatabase() {
  try {
    await mongoose.connect(config.db.uri);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
