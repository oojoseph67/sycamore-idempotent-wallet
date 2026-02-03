import { createRouter } from "../utils/router";
import { TransferController } from "../controllers";
import { validateRequest } from "../middleware";
import { TransferDto } from "../dto";
import { authenticationMiddleware } from "../middleware/auth.middleware";

const router = createRouter();
const transferController = new TransferController();

/**
 * @swagger
 * /transfer:
 *   post:
 *     summary: transfer funds to another user
 *     tags: [transfer]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransferDto'
 *     responses:
 *       200:
 *         description: transfer successful or idempotent response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferResponse'
 *       400:
 *         description: validation error, insufficient balance, or wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/",
  authenticationMiddleware,
  validateRequest(TransferDto, "body"),
  transferController.transfer.bind(transferController)
);

export default router;
