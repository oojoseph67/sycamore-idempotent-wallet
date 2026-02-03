import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import {
  logger,
  responseInterceptor,
  errorHandler,
  rateLimiter,
} from "./middleware";
import { config } from "./config/env";
import { connectDB, disconnectDB, sequelize } from "./config/db";
import "./models"; // register sequelize models before connectDB
import routes from "./routes";
import { swaggerSpec } from "./config/swagger";

const app = express();

connectDB();

// trust proxy for accurate ip detection (important for rate limiting)
app.set("trust proxy", true);

// middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);
app.use(responseInterceptor);

// global rate limiter (early enforcement with default limits)
// specific routes can override with stricter limits
app.use("/api/v1", rateLimiter);

// swagger documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use("/api/v1", routes);

// error handler middleware (must be after all routes)
app.use(errorHandler);

// start server
const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

process.on(`unhandledRejection`, (err) => {
  console.error(`unhandled rejection`, err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("uncaughtException", async (err) => {
  console.error(`uncaught exception`, err);
  await disconnectDB();
  process.exit(1);
});

process.on("SIGTERM", async (err) => {
  console.error(`sigterm received, shutting down gracefully`, err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});
