import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { COOKIE_NAME, JwtPayload } from "../global/jwt/jwt.index";
import { AppError } from "../global/errors";
import { config } from "../config/env";

export const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("applying authentication middleware");

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // ["Bearer", "abced"]
  } else if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  if (!token) {
    throw AppError.unauthorized({
      message: `not authorized... no token provided`,
    });
  }

  try {
    // verifying token and extract user id
    const decoded = jwt.verify(token, config.jwtSecret, {
      issuer: config.jwtTokenIssuer,
      audience: config.jwtTokenAudience,
    }) as JwtPayload;

    const userId = decoded.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return next(
        AppError.unauthorized({ message: `invalid access token passed` })
      );
    }

    req.user = user;
    next();
  } catch (error: any) {
    // if error is already an AppError, pass it forward
    if (error instanceof AppError) {
      return next(error);
    }
    // handle jwt verification errors as unauthorized
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(
        AppError.unauthorized({ message: `invalid or expired token` })
      );
    }
    // wrap other errors as internal server error
    return next(AppError.internalServerError({ message: error.message }));
  }
};
