import { createRouter } from "../utils/router";
import { TransferController } from "../controllers";
import { validateRequest } from "../middleware";
import { TransferDto } from "../dto";
import { authenticationMiddleware } from "../middleware/auth.middleware";

const router = createRouter();
const transferController = new TransferController();

router.post(
  "/",
  authenticationMiddleware,
  validateRequest(TransferDto, "body"),
  transferController.transfer.bind(transferController)
);

export default router;
