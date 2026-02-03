import jwt from "jsonwebtoken";
import { Response } from "express";
import { config } from "../../config/env";

export const COOKIE_NAME = "accessToken";

export type JwtPayload = {
  id: string;
};

export const generateToken = ({
  userId,
  res,
}: {
  userId: string;
  res: Response;
}): {
  accessToken: string;
  refreshToken: string;
} => {
  const payload = { id: userId } as JwtPayload;
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtATTTL,
    issuer: config.jwtTokenIssuer,
    audience: config.jwtTokenAudience,
  });

  const refreshToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtRTTTL,
    issuer: config.jwtTokenIssuer,
    audience: config.jwtTokenAudience,
  });

  // res.cookie(COOKIE_NAME, accessToken, {
  //   httpOnly: true,
  //   secure: config.nodeEnv === "production",
  //   sameSite: "strict",
  //   // maxAge: config.jwtATTTL,
  //   maxAge: 1000 * 60 * 60 * 24 * 7,
  // });

  return {
    accessToken,
    refreshToken,
  };
};
