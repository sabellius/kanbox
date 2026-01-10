import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    owner: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      fullname: {
        type: String,
        required: true,
      },
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        fullname: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);
