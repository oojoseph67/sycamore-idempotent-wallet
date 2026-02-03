import { createRouter } from "../utils/router";
import { AuthController } from "../controllers/";
import { validateRequest, createRateLimiter } from "../middleware";
import { LoginDto, SignupDto } from "../dto";
import { BcryptProvider } from "../global/hashing";
import { authenticationMiddleware } from "../middleware/auth.middleware";
import { rateLimitConfigs } from "../middleware/rate-limiter/rate-limiter.config";

const router = createRouter();
const hashingProvider = new BcryptProvider();
const authController = new AuthController(hashingProvider);

// this applies the middleware to all the route here
// router.use(authenticationMiddleware)

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: create a new user account
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupDto'
 *     responses:
 *       200:
 *         description: user signup successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponse'
 *       400:
 *         description: validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/signup",
  createRateLimiter(rateLimitConfigs["/auth/signup"]),
  validateRequest(SignupDto, "body"),
  authController.signup.bind(authController)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: login user
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *         headers:
 *           Set-Cookie:
 *             description: http-only cookie containing the refresh token
 *             schema:
 *               type: string
 *       400:
 *         description: validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: incorrect email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: user does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  createRateLimiter(rateLimitConfigs["/auth/login"]),
  validateRequest(LoginDto, "body"),
  authController.login.bind(authController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: logout user
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: logged out successfully
 */
router.post("/logout", authController.logout.bind(authController));

/**
 * @swagger
 * /auth/whoami:
 *   get:
 *     summary: get current user information
 *     tags: [auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/whoami",
  authenticationMiddleware,
  authController.whoami.bind(authController)
);

/**
 * @swagger
 * /auth/{userId}:
 *   get:
 *     summary: get user by id
 *     tags: [auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: user id
 *     responses:
 *       200:
 *         description: user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId", authController.getUserById.bind(authController));

export default router;
