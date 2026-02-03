import { createRouter } from "../utils/router";
import { getHome, getHealth } from "../controllers";
import { Router } from "express";

// const router = Router()
const router = createRouter();

/**
 * @swagger
 * /:
 *   get:
 *     summary: home endpoint
 *     tags: [home]
 *     responses:
 *       200:
 *         description: welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello, World!
 */
router.get("/", getHome);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: health check endpoint
 *     tags: [home]
 *     responses:
 *       200:
 *         description: service is healthy and database is connected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 *       503:
 *         description: service unavailable - database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 database:
 *                   type: string
 *                   example: disconnected
 *                 message:
 *                   type: string
 *                   example: database connection error
 */
router.get("/health", getHealth);

export default router;
