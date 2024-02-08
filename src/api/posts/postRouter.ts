import express from 'express';
import { createPost, updatePost, deletePost, findAll, getPostsByCountry, getPostsByUserName  } from './postHandlers';

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve all posts from the database.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: [{ postId: 1, description: 'Post 1', country: 'Israel', photo: 'base64-encoded-image', userName: 'OmriAacchbar' }, { postId: 2, description: 'Post 2', country: 'Spain', photo: 'base64-encoded-image', userName: 'OmriAacchbar' }]
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - posts
 */
router.get('/', findAll);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post with the provided data.
 *     requestBody:
 *       description: Post data
 *       required: true
 *       content:
 *         application/json:
 *           example: { userName: 'OmriAacchbar', country: 'Israel', description: 'This is a new post', photo: 'base64-encoded-image' }
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: { _id: 'postId', userName: 'OmriAacchbar', country: 'Israel', description: 'This is a new post', photo: 'base64-encoded-image' }
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - posts
 */
router.post('/', createPost);

/**
 * @swagger
 * /:
 *   put:
 *     summary: Update a post
 *     description: Update an existing post with the provided data.
 *     requestBody:
 *       description: Updated post data
 *       required: true
 *       content:
 *         application/json:
 *           example: { postId: 'postId', description: 'Updated Post', photo: 'base64-encoded-image' }
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: { _id: 'postId', userName: 'OmriAacchbar', country: 'Israel', description: 'Updated Post', photo: 'base64-encoded-image' }
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - posts
 */
router.put('/', updatePost);

/**
 * @swagger
 * /{postId}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete an existing post by ID.
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: ID of the post to delete
 *         required: true
 *         schema:
 *           type: string
 *           example: postId
 *     responses:
 *       204:
 *         description: No Content
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - posts
 */
router.delete('/:postId', deletePost);

/**
 * @swagger
 * /byUserName/{userName}:
 *   get:
 *     summary: Get posts by user name
 *     description: Retrieve posts associated with a specific user by user name.
 *     parameters:
 *       - in: path
 *         name: userName
 *         description: User name to filter posts
 *         required: true
 *         schema:
 *           type: string
 *           example: OmriAacchbar
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: [{ postId: 1, userName: 'OmriAacchbar', country: 'Israel', description: 'This is a new post', photo: 'base64-encoded-image' }, { postId: 2, userName: 'OmriAacchbar', country: 'Israel', description: 'This is a new post', photo: 'base64-encoded-image' }]
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - posts
 */
router.get('/byUserName/:userName', getPostsByUserName);

/**
 * @swagger
 * /byCountry/{country}:
 *   get:
 *     summary: Get posts by country
 *     description: Retrieve posts associated with a specific country by country name.
 *     parameters:
 *       - in: path
 *         name: country
 *         description: Country name to filter posts
 *         required: true
 *         schema:
 *           type: string
 *           example: United States
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: [{ postId: 1, userName: 'OmriAacchbar', country: 'United States', description: 'This is a new post', photo: 'base64-encoded-image' }, { postId: 2, userName: 'OmriAacchbar', country: 'United States', description: 'This is a new post', photo: 'base64-encoded-image' }]
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - posts
 */
router.get('/byCountry/:country', getPostsByCountry);

export default router;