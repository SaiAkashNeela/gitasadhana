import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { chatRouter } from "./routes/chat.js";
import { mailRouter } from "./routes/mail.js";
import { usersRouter } from "./routes/users.js";
import { asyncHandler } from "./lib/http.js";
import { handleGitaChat } from "./services/gitaChat.js";
import { parseBearerToken } from "./lib/http.js";
import { verifyAppToken } from "./services/jwt.js";
import { UserModel } from "./models/User.js";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use(cors());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/chat", chatRouter);
  app.use("/mail", mailRouter);

  app.post(
    "/ai/chat",
    asyncHandler(async (req, res) => {
      const token = parseBearerToken(req.headers.authorization);
      if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const verified = await verifyAppToken(token);
      if (!verified.userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await UserModel.findById(verified.userId).exec();
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const profile = user.profile as any;

      const body = req.body as {
        message?: string;
        history?: { role: "user" | "model"; text: string }[];
        language?: string;
      };

      const result = await handleGitaChat({
        userId: verified.userId,
        message: body.message ?? "",
        history: body.history ?? [],
        language: body.language ?? profile.language ?? "en",
      });

      res.json(result);
    }),
  );

  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error?.message || "Internal server error";
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 400;
    res.status(status).json({ message });
  });

  return app;
}
