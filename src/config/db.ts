import { Sequelize } from "sequelize";
import { config } from "./env";

const sequelize = new Sequelize(config.databaseUrl, {
  logging: console.log,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`db connected via sequelize`);
  } catch (error: any) {
    console.error(`error connecting to db: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await sequelize.close();
    console.log(`db disconnected via sequelize`);
  } catch (error: any) {
    console.error(`error connecting to db: ${error.message}`);
  }
};

export { sequelize, connectDB, disconnectDB };
