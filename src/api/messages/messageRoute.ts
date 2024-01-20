import express from "express";
import { createNewMessage, getAllMessageBetweenTwoUsers } from "./messageHandleres";

const router = express.Router();

/**
 * @swagger
 * /sendMessage:
 *   post:
 *     summary: Send a message
 *     description: Create and send a new message with the provided data.
 *     requestBody:
 *       description: Message data
 *       required: true
 *       content:
 *         application/json:
 *           example: { fromUser: 'JohnDoe', toUser: 'JaneDoe', messageContent: 'Hello, Jane!' }
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: { _id: 'messageId', fromUser: 'JohnDoe', toUser: 'JaneDoe', messageContent: 'Hello, Jane!' }
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - messages
 */
router.post('/sendMessage', createNewMessage);

/**
 * @swagger
 * /getChat:
 *   post:
 *     summary: Get chat messages between two users
 *     description: Retrieve chat messages between two specified users.
 *     requestBody:
 *       description: Users for which to fetch the chat
 *       required: true
 *       content:
 *         application/json:
 *           example: { firstUser: 'JohnDoe', secondUser: 'JaneDoe' }
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: [
 *               { _id: 'messageId1', fromUser: 'JohnDoe', toUser: 'JaneDoe', content: 'Hello, Jane!' },
 *               { _id: 'messageId2', fromUser: 'JaneDoe', toUser: 'JohnDoe', content: 'Hi, John!' }
 *             ]
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: Internal Server Error
 *     tags:
 *      - messages
 */
router.post('/getChat', getAllMessageBetweenTwoUsers);

export default router;