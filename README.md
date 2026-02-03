# Idempotent Wallet

Express API for transferring funds between user wallets with idempotency. Each new account gets **10,000 NAIRA** automatically.

## Quick start

**Prerequisites:** Node.js 18+, pnpm, PostgreSQL.

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd idempotent-wallet
   pnpm install
   ```

2. **Database**

   Create a PostgreSQL database, then set `DATABASE_URL` in `.env` (see below). Run migrations:

   ```bash
   npx sequelize-cli db:migrate
   ```

3. **Environment**

   Copy `.env.example` to `.env` and fill in:

   - `DATABASE_URL` – e.g. `postgresql://postgres:password@localhost:5432/idempotent_wallet`
   - `JWT_SECRET`, `JWT_TOKEN_AUDIENCE`, `JWT_TOKEN_ISSUER` (and optional `PORT`, token TTLs)

4. **Run**

   ```bash
   pnpm dev
   ```

   API base: `http://localhost:4567/api/v1` (or your `PORT`). Swagger: `http://localhost:4567/api/docs`.

## Using the API

1. **Create two accounts**  
   `POST /api/v1/auth/signup` with `email`, `password`, `firstName`, `lastName`.  
   Each new user gets a wallet with **10,000 NAIRA** automatically.

2. **Login**  
   `POST /api/v1/auth/login` with `email`, `password`. Use the returned token (or cookie) for protected routes.

3. **Transfer between accounts**  
   `POST /api/v1/transfer` with:

   - **Authorization:** Bearer token (or cookie) of the sender.
   - **Body:** `amount` (string number), `toUserId` (receiver’s user UUID), `idempotencyKey` (a UUID you generate).

   Use a **new UUID for each transfer attempt** (e.g. from [uuidgenerator.net](https://www.uuidgenerator.net/) or `uuid` in code). Reusing the same `idempotencyKey` is safe: the API will return the existing result instead of double-spending.

**Example transfer body:**

```json
{
  "amount": "500",
  "toUserId": "<receiver-user-uuid>",
  "idempotencyKey": "<new-uuid-for-this-attempt>"
}
```

## Scripts

- `pnpm dev` – run with hot reload  
- `pnpm build` / `pnpm start` – production  
- `npx sequelize-cli db:migrate` – run migrations  
- `npx sequelize-cli db:migrate:undo` – undo last migration  

## License

ISC
