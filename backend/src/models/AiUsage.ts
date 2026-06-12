import { Schema, model } from "mongoose";

const aiUsageSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    day: { type: String, required: true, index: true },
    count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

aiUsageSchema.index({ userId: 1, day: 1 }, { unique: true });

export const AiUsageModel = model("AiUsage", aiUsageSchema);

