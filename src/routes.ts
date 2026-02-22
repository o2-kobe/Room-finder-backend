import { Request, Response, Router } from "express";
import {
  createUserHandler,
  deleteUserHandler,
  getUserHandler,
} from "./controller/user.controller";
import {
  createSessionHandler,
  deleteSessionHandler,
  getSessionsHandler,
  refreshAccessTokenHandler,
} from "./controller/session.controller";
import { requireUser } from "./middleware/requireUser";
import { loginLimiter } from "./middleware/rateLimit";
import validateResource from "./middleware/validateResource";
import { createUserSchema } from "./schema/user.schema";
import { createSessionSchema } from "./schema/session.schema";
import {
  createListingHandler,
  deleteListingHandler,
  findOneListingHandler,
  getListingsHandler,
  getMapsListingsHandler,
  markListingAsAvailableHandler,
  markListingAsInactiveHandler,
  updateListingHandler,
} from "./controller/listing.controller";
import {
  createListingSchema,
  listingParamsSchema,
  updateListingSchema,
} from "./schema/listing.schema";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  res.send("HEy");
});

// User Routes
router.post("/users", validateResource(createUserSchema), createUserHandler);
router.get("/users", requireUser, getUserHandler);
router.delete("/users", requireUser, deleteUserHandler);

// Session Routes
router.post(
  "/sessions",
  loginLimiter,
  validateResource(createSessionSchema),
  createSessionHandler,
);

router.get("/sessions", requireUser, getSessionsHandler);
router.delete("/sessions", requireUser, deleteSessionHandler);

router.post("/sessions/refresh", loginLimiter, refreshAccessTokenHandler);

// Listing Routes
// ---------------------------
// Get paginated listings
router.get("/listings", getListingsHandler);

// Get Map listings
router.get("/listings/map", getMapsListingsHandler);

router.use(requireUser);

// Create a listing
router.post(
  "/listings",
  validateResource(createListingSchema),
  createListingHandler,
);

// Find one listing
router.get(
  "/listings/:id",
  validateResource(listingParamsSchema),
  findOneListingHandler,
);

// Delete listing
router.delete(
  "/listings/:id",
  validateResource(listingParamsSchema),
  deleteListingHandler,
);

// Update listing body
router.patch(
  "/listings/:id",
  validateResource(updateListingSchema),
  updateListingHandler,
);

// Mark Listing as available
router.patch(
  "/listings/markAvailable/:id",
  validateResource(listingParamsSchema),
  markListingAsAvailableHandler,
);

// Mark listing as inactive
router.patch(
  "/listings/markInactive/:id",
  validateResource(listingParamsSchema),
  markListingAsInactiveHandler,
);

export default router;
