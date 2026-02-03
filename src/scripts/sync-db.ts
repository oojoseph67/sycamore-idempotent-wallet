import { sequelize } from "../config/db";
import "../models"; // Import all models

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Auto-updates schema
    console.log("✅ Database synced");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
};

syncDatabase();
