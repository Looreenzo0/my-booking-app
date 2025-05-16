import express from "express";
import { register, login, getAllUsers } from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema, loginSchema } from "../validators/authValidator";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/users", authenticate, authorizeRoles("admin"), getAllUsers); // 🔒 Admin only

export default router;
