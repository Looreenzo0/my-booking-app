import express from "express";
import {
  createRoomHandler,
  getRoomHandler,
  getAllRoomsHandler,
  updateRoomHandler,
  deleteRoomHandler,
  checkAvailabilityHandler,
} from "../controllers/roomController";
import { validateRequest } from "../middlewares/validateRequest";
import { RoomSchema } from "../validators/roomValidator";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = express.Router();

// Public routes
router.get("/", getAllRoomsHandler);
router.get("/:id", getRoomHandler);
router.get("/:id/availability", checkAvailabilityHandler);

// Protected routes for admin and manager
router.use(authenticate, authorizeRoles("admin", "manager"));

router.post("/", validateRequest(RoomSchema), createRoomHandler);
router.patch("/:id", validateRequest(RoomSchema.partial()), updateRoomHandler);
router.delete("/:id", deleteRoomHandler);

export default router;
