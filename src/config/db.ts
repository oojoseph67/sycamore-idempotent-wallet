import { Sequelize } from "sequelize-typescript";
import { config } from "./env";
import { User } from "../models/user/user.model";
import { Wallet } from "../models/user/wallet.model";
import { TransactionLog } from "../models/transaction/transaction.model";

const sequelize = new Sequelize(config.databaseUrl, {
  logging: console.log,
  models: [User, Wallet, TransactionLog],
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
    console.error(`error disconnecting db: ${error.message}`);
  }
};

export { sequelize, connectDB, disconnectDB };
