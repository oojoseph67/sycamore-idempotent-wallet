import { Router, RequestHandler } from "express";
import { asyncHandler } from "../middleware";

export const createRouter = () => {
  const router = Router();

  // wrap all HTTP methods
  const methods = ["get", "post", "put", "delete", "patch", "all"] as const;

  methods.forEach((method) => {
    const originalMethod = router[method].bind(router);
    (router as any)[method] = function (
      path: string,
      ...handlers: RequestHandler[]
    ) {
      const wrappedHandlers = handlers.map((handler) => {
        if (typeof handler === "function") {
          return asyncHandler(handler);
        }
        return handler;
      });
      return originalMethod(path, ...wrappedHandlers);
    };
  });

  return router;
};
