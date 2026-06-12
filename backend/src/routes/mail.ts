import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/http.js";
import { sendContactEmail, sendCorrectionEmail, sendNewsletterEmail, sendWelcomeEmail } from "../services/mail.js";

const router = Router();

router.post(
  "/contact",
  asyncHandler(async (req, res) => {
    const body = z.object({
      email: z.string().email(),
      message: z.string().min(1),
    }).parse(req.body);

    const result = await sendContactEmail(body.email, body.message);
    res.json(result);
  }),
);

router.post(
  "/correction",
  asyncHandler(async (req, res) => {
    const body = z.object({
      language: z.string().min(1),
      chapter: z.string().min(1),
      verse: z.string().min(1),
      message: z.string().min(1),
      email: z.string().email().optional(),
    }).parse(req.body);

    const result = await sendCorrectionEmail(body);
    res.json(result);
  }),
);

router.post(
  "/newsletter",
  asyncHandler(async (req, res) => {
    const body = z.object({
      email: z.string().email(),
      frequency: z.enum(["daily", "weekly", "monthly"]),
    }).parse(req.body);

    const result = await sendNewsletterEmail(body.email, body.frequency);
    res.json(result);
  }),
);

router.post(
  "/welcome",
  asyncHandler(async (req, res) => {
    const body = z.object({
      email: z.string().email(),
      name: z.string().optional().default("Seeker"),
    }).parse(req.body);

    const result = await sendWelcomeEmail(body.email, body.name);
    res.json(result);
  }),
);

export { router as mailRouter };

