import { Router } from "express";
import authRoutes from "./auth.routes";
import homeRoutes from "./home.index";

const router = Router();

router.use("/", homeRoutes);
router.use("/auth", authRoutes);

export default router;
