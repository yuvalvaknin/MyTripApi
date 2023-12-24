import express from "express";
import { createNewMessage, getAllMessageBetweenTwoUsers } from "./messageHandleres";

const router = express.Router();

router.post('/', createNewMessage);
router.get('/getChat', getAllMessageBetweenTwoUsers);

export default router;