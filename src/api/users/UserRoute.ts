import express from "express";
const router = express.Router();
import userController from "./UserController";
import { authenticate } from "../../middlewares";

router.post("/update", authenticate, userController.updateUser);
router.get("/", authenticate , userController.getUser);
router.get("/basic", authenticate , userController.getUser);

export default router; 
