import express from 'express';
const router = express.Router();
import authController from './AuthController';
import { authenticate } from '../../middlewares';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     'cookieAcessToken':         # arbitrary name for the security scheme; will be used in the "security" key later
 *       type: apiKey
 *       in: cookie
 *       name: access_token 
 *     'cookieRefreshToken':         # arbitrary name for the security scheme; will be used in the "security" key later
 *       type: apiKey
 *       in: cookie
 *       name: refresh_token 
 *   schemas:
 *     RegisterDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     LoginDto:
 *       type: object
 *       properties:
 *         userName:
 *           type: string
 *         password:
 *           type: string
 *     UserIdDto:
 *       type: object
 *       properties:
 *         _userId:
 *           type: string
 *     GoogleLoginDto:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Google authentication token
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
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDto'
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Error registering user
 *       '406':
 *         description: Email or username already exists
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 *       '400':
 *         description: Missing username or password
 *       '401':
 *         description: User not found or incorrect password
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from the system
 *     tags: [Authentication]
 *     security:
 *       - cookieAccessToken: []
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *       '403':
 *         description: User not found or token expired
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/refreshToken:
 *   get:
 *     summary: Refresh the access token
 *     tags: [Authentication]
 *     security:
 *       - cookieAccessToken: []
 *       - cookieRefreshToken: []
 *     responses:
 *       '200':
 *         description: Access token refreshed successfully
 *       '400':
 *         description: Problem in token refreshing
 *       '403':
 *         description: Token doesn't exist or user not found
 */
router.get('/refreshToken', authController.refreshToken);

/**
 * @swagger
 * /auth/googleLogin:
 *   post:
 *     summary: Login with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginDto'
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 *       '400':
 *         description: Error in Google login
 */
router.post('/google', authController.googleLogin);

export default router;
