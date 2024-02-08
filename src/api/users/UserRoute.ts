import express from "express";
const router = express.Router();
import userController from "./UserController";
import { authenticate } from "../../middlewares";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Operations related to user management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponseDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *         image:
 *           type: string
 *           description: URL to the user's profile image
 *         userName:
 *           type: string
 *           description: User's username
 *         isGoogleLogin:
 *           type: boolean
 *           description: Indicates whether the user logged in with Google
 *     ChangeUserNameDto:
 *       type: object
 *       properties:
 *         userName:
 *           type: string
 *           description: New username
 *     ChangePasswordDto:
 *       type: object
 *       properties:
 *         oldPassword:
 *           type: string
 *           description: Old password
 *         newPassword:
 *           type: string
 *           description: New password
 *     ChangeProfileImageDto:
 *       type: object
 *       properties:
 *         image:
 *           type: string
 *           description: Base64-encoded image data
 *     UserIdDto:
 *       type: object
 *       properties:
 *         _userId:
 *           type: string
 *           description: User ID
 */

/**
 * @swagger
 * /user/:
 *   get:
 *     summary: Get user details
 *     tags: [User]
 *     security:
 *       - cookieAccessToken: []
 *     responses:
 *       '200':
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 *       '500':
 *         description: Error fetching user details
 */
router.get("/", authenticate , userController.getUser);

 /**
  * @swagger
 * /user/userName/:
 *   post:
 *     summary: Update user's username
 *     tags: [User]
 *     security:
 *       - cookieAccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeUserNameDto'
 *     responses:
 *       '200':
 *         description: Username updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 *       '400':
 *         description: Username already exists
 *       '500':
 *         description: Error updating username
 * */
router.post("/userName", authenticate, userController.updateUserName);

 /**
 * @swagger
 * /user/password:
 *   post:
 *     summary: Update user's password
 *     tags: [User]
 *     security:
 *       - cookieAccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordDto'
 *     responses:
 *       '200':
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 *       '401':
 *         description: Incorrect password
 *       '500':
 *         description: Error updating password
 */
router.post("/password", authenticate , userController.updatePassword);

 /**
  * @swagger
  * /user/profileImage:
 *   post:
 *     summary: Update user's profile image
 *     tags: [User]
 *     security:
 *       - cookieAccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeProfileImageDto'
 *     responses:
 *       '200':
 *         description: Profile image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 *       '500':
 *         description: Error updating profile image
 */
router.post("/profileImage", authenticate, userController.updateProflieImage);

 /**
 * @swagger
 *  /user/profileImage/{userName}:
 *   get:
 *     summary: Get user's profile image by username
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the user
 *     responses:
 *       '200':
 *         description: Profile image retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       '500':
 *         description: Error retrieving profile image
 */
router.get("/profileImage/:userName", userController.getProflieImage);
export default router; 
