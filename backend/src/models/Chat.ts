import { Schema, model, type InferSchemaType } from "mongoose";
import type { ChatMessage } from "../types.js";

const chatMessageSchema = new Schema<ChatMessage>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "model"], required: true },
    text: { type: String, required: true },
    ts: { type: Number, required: true },
  },
  { _id: false },
);

const chatSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    language: { type: String, required: true, default: "en" },
    messages: { type: [chatMessageSchema], required: true, default: [] },
    updatedAt: { type: String, required: true },
  },
  { timestamps: true },
);

export type ChatDocument = InferSchemaType<typeof chatSchema> & {
  _id: unknown;
};

export const ChatModel = model("Chat", chatSchema);

