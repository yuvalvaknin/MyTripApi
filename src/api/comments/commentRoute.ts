import express from "express";
import { createComment, getCommentsByPost, getCommentsNumberPerPost } from "./commentHandlers";

const router = express.Router();

router.post('/postComment', createComment);
router.get('/commentsCounter/:postId', getCommentsNumberPerPost);
router.get('/getCommentsByPost/:postId', getCommentsByPost);

export default router;