# Express Backend

A robust Express.js backend API built with TypeScript, featuring authentication, database management with Prisma, and comprehensive API documentation.

## Features

- **Express.js** with TypeScript for type-safe development
- **Prisma ORM** with PostgreSQL database
- **JWT Authentication** with access and refresh tokens
- **Swagger API Documentation** at `/api/docs`
- **Input Validation** using class-validator and Joi
- **Error Handling** with centralized error management
- **Cookie-based** authentication support

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8.15.0 or higher)
- PostgreSQL database

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd express-backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up Prisma:

```bash
npx prisma init
```

4. Install Prisma dependencies (if not already installed):

```bash
pnpm add -D prisma@^6.0.0
pnpm add "@prisma/client@^6.0.0"
```

5. Configure your database connection in `.env` (see Environment Variables below)

6. Run database migrations:

```bash
npx prisma migrate dev --name init
```

7. Generate Prisma Client:

```bash
npx prisma generate
```

8. (Optional) Seed the database:

```bash
pnpm run seed
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/express?schema=public"

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_TOKEN_AUDIENCE=your-audience
JWT_TOKEN_ISSUER=your-issuer
JWT_ACCESS_TOKEN_TIME_TO_LIVE=15m
JWT_REFRESH_TOKEN_TIME_TO_LIVE=7d
```

## Running the Project

### Development Mode

```bash
pnpm run dev
```

The server will start on the port specified in your `.env` file (default: 3000).

### Production Build

```bash
pnpm run build
pnpm start
```

## API Documentation

Once the server is running, access the Swagger API documentation at:

```text
http://localhost:3000/api/docs
```

## Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build the project for production
- `pnpm start` - Start the production server
- `pnpm run seed` - Seed the database with initial data
- `pnpm run watch` - Watch for TypeScript changes and recompile

## Project Structure

```text
express-backend/
├── src/
│   ├── config/          # Configuration files (database, env, swagger)
│   ├── controllers/     # Route controllers
│   ├── dto/             # Data transfer objects for validation
│   ├── global/          # Global utilities (errors, hashing, jwt)
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route definitions
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   ├── migrations/      # Database migrations
│   ├── seed/            # Database seed files
│   └── schema.prisma    # Prisma schema definition
└── package.json
```

## Database Management

### Create a new migration

```bash
npx prisma migrate dev --name migration-name
```

### Reset the database

```bash
npx prisma migrate reset
```

### View database in Prisma Studio

```bash
npx prisma studio
```

## License

ISC

<!--
run: npx prisma init
pnpm add -D prisma@^6.0.0
pnpm add "@prisma/client@^6.0.0"
npx prisma migrate dev --name ``
npx prisma generate
-->

<!-- /**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: create a new user account
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: user signup successful
 *         ...
 */ -->
