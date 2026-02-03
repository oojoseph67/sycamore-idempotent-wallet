import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express",
      version: "1.0.0",
      description: "API documentation for an Express application",
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: "development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        SignupDto: {
          type: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 8,
              maxLength: 100,
              example: "SecurePass123!",
            },
            firstName: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              example: "John",
            },
            lastName: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              example: "Doe",
            },
          },
        },
        LoginDto: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              example: "SecurePass123!",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            firstName: {
              type: "string",
              example: "John",
            },
            lastName: {
              type: "string",
              example: "Doe",
            },
          },
        },
        SignupResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "user signup successful",
            },
            user: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                email: {
                  type: "string",
                  example: "user@example.com",
                },
              },
            },
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "login successful",
            },
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        TransferDto: {
          type: "object",
          required: ["amount", "toUserId", "idempotencyKey"],
          properties: {
            amount: {
              type: "string",
              description: "non-negative number as string",
              example: "500",
            },
            toUserId: {
              type: "string",
              format: "uuid",
              description: "receiver user id",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            idempotencyKey: {
              type: "string",
              format: "uuid",
              description: "unique key per transfer attempt to prevent double-spend",
              example: "123e4567-e89b-12d3-a456-426614174001",
            },
          },
        },
        TransferResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "transfer successful",
            },
            transaction: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                idempotencyKey: { type: "string" },
                fromWalletId: { type: "string", format: "uuid" },
                toWalletId: { type: "string", format: "uuid" },
                amount: { type: "number" },
                status: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED"] },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "error message",
            },
            statusCode: {
              type: "number",
              example: 400,
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
