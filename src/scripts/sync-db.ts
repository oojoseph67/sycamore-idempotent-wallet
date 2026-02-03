// src/scripts/sync-db.ts
import dotenv from "dotenv";

// Load .env BEFORE importing anything else
dotenv.config();

import "../models/user/wallet.model";
import "../models/transaction/transaction.model";
import "../models/user/user.model";
import { sequelize } from "../config/db";

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
};

syncDatabase();
