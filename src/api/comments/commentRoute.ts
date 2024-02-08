import express from "express";
import { createComment, getCommentsByPost, getCommentsNumberPerPost } from "./commentHandlers";
import { authenticate } from "../../middlewares";

const router = express.Router();

/**
 * @swagger
 * /comments/postComment:
 *   post:
 *     summary: Post a comment
 *     description: Create and post a new comment with the provided data.
 *     requestBody:
 *       description: Comment data
 *       required: true
 *       content:
 *         application/json:
 *           example: { postId: 'postId', content: 'This is a great post!' }
 *     security:
 *       - cookieAccessToken: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: { _id: 'commentId', postId: 'postId', userName: 'JohnDoe', content: 'This is a great post!' }
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - comments
 */
router.post('/postComment', authenticate, createComment);

/**
 * @swagger
 * /comments/commentsCounter/{postId}:
 *   get:
 *     summary: Get comments count for a post
 *     description: Retrieve the number of comments for a specific post.
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: ID of the post to get comments count
 *         required: true
 *         schema:
 *           type: string
 *           example: postId
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: 5
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - comments
 */
router.get('/commentsCounter/:postId', getCommentsNumberPerPost);

/**
 * @swagger
 * /comments/getCommentsByPost/{postId}:
 *   get:
 *     summary: Get comments by post ID
 *     description: Retrieve comments associated with a specific post by post ID.
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: ID of the post to get comments for
 *         required: true
 *         schema:
 *           type: string
 *           example: postId
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: [{ _id: 'commentId1', postId: 'postId', userName: 'JohnDoe', content: 'Great post!' }, { _id: 'commentId2', postId: 'postId', userName: 'JaneDoe', content: 'Nice post!' }]
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - comments
 */
router.get('/getCommentsByPost/:postId', getCommentsByPost);

export default router;