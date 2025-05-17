import express from "express";
import {
  createBookingHandler,
  getBookingHandler,
  getAllBookingsHandler,
  updateBookingHandler,
  deleteBookingHandler,
  getUserBookingsHandler,
} from "../controllers/bookingController";
import { validateRequest } from "../middlewares/validateRequest";
import { BookingSchema } from "../validators/bookingValidator";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { authenticateOptional } from "../middlewares/authenticateOptional";

const router = express.Router();

// Public routes
router.post(
  "/",
  authenticateOptional,
  validateRequest(BookingSchema),
  createBookingHandler
);
router.get("/user/:email", getUserBookingsHandler);
router.get("/:id", getBookingHandler);

// Protected routes (admin/manager)
router.use(authenticate, authorizeRoles("admin", "manager"));

router.get("/", getAllBookingsHandler);
router.patch(
  "/:id",
  validateRequest(BookingSchema.partial()),
  updateBookingHandler
);
router.delete("/:id", deleteBookingHandler);

export default router;
