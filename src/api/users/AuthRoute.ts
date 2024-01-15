import express from "express";
const router = express.Router();
import authController from "./AuthController";
import { authenticate } from "../../middlewares";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authenticate ,authController.logout);
router.post("/refreshToken", authController.refreshToken);
router.get("/user", authenticate ,authController.getUser);
router.post('/google', authController.googleLogin) 

export default router; 
