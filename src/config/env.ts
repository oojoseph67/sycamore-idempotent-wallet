import Joi from "joi";

const envSchema = Joi.object({
  PORT: Joi.number().integer().positive().required(),
  NODE_ENV: Joi.string().default("development"),
  DATABASE_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  JWT_ACCESS_TOKEN_TIME_TO_LIVE: Joi.string().required(),
  JWT_REFRESH_TOKEN_TIME_TO_LIVE: Joi.string().required(),
}).unknown();

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`config validation error: ${error.message}`);
}

export const config = {
  port: value.PORT,
  nodeEnv: value.NODE_ENV,
  databaseUrl: value.DATABASE_URL,
  jwtSecret: value.JWT_SECRET,
  jwtTokenAudience: value.JWT_TOKEN_AUDIENCE,
  jwtTokenIssuer: value.JWT_TOKEN_ISSUER,
  jwtATTTL: value.JWT_ACCESS_TOKEN_TIME_TO_LIVE,
  jwtRTTTL: value.JWT_REFRESH_TOKEN_TIME_TO_LIVE,
};
