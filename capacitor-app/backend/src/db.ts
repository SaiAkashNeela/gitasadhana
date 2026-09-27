import mongoose from "mongoose";
import { config } from "./config.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectDb() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.mongoUri);
  }
  return connectionPromise;
}

