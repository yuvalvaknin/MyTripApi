import express from "express";
const router = express.Router();
import userController from "./UserController";
import { authenticate } from "../../middlewares";

router.get("/", authenticate , userController.getUser);
router.post("/userName", authenticate, userController.updateUserName);
router.post("/password", authenticate , userController.updatePassword);

export default router; 
