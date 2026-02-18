import { Router } from "express";
import {
  createUserHandler,
  deleteUserHandler,
} from "./controller/user.controller";
import {
  createSessionHandler,
  deleteSessionHandler,
  getSessionsHandler,
  refreshAccessTokenHandler,
} from "./controller/session.controller";
import { requireUser } from "./middleware/requireUser";
import { loginLimiter } from "./middleware/rateLimit";

const router = Router();

/**
 * =========================
 * User Routes
 * =========================
 */
router.post("/users", createUserHandler);
router.delete("/users", requireUser, deleteUserHandler);

/**
 * =========================
 * Session Routes
 * =========================
 */

// 🚨 Rate limit login attempts
router.post("/sessions", loginLimiter, createSessionHandler);

router.get("/sessions", requireUser, getSessionsHandler);
router.delete("/sessions", requireUser, deleteSessionHandler);

// Optional: also rate-limit refresh
router.post("/sessions/refresh", loginLimiter, refreshAccessTokenHandler);

export default router;
