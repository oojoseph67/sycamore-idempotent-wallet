import { Router } from "express";
import authRoutes from "./auth.routes";
import homeRoutes from "./home.index";
import transferRoutes from "./transfer.routes";

const router = Router();

router.use("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/transfer", transferRoutes);

export default router;
