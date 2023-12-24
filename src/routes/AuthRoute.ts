import express from "express";
const router = express.Router();
import authController from "../controllers/AuthController";
import { authenticate } from "../middlewares";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authenticate ,authController.logout);

export default router;
