import { Request, Response } from "express";
import { AppError } from "../../global/errors";
import { User, Wallet, TransactionLog } from "../../models";
import { TransferDto } from "../../dto";
import { sequelize } from "../../config/db";

export class TransferController {
  constructor() {}

  async transfer(req: Request, res: Response) {
    let txLog: TransactionLog | null = null;

    try {
      const user = req.user;
      const transferData = req.body as TransferDto;
      const { amount, idempotencyKey, toUserId } = transferData;

      if (!user) {
        throw AppError.unauthorized({
          message: `user not found`,
        });
      }

      // checking for existing idempotency key
      const exitingTxLog = await TransactionLog.findOne({
        where: {
          idempotencyKey,
        },
      });

      if (exitingTxLog) {
        if (exitingTxLog.status === "COMPLETED") {
          return {
            message: "Transaction already processed",
            transaction: exitingTxLog,
          };
        }
        if (exitingTxLog.status === "PENDING") {
          return {
            message: "Transaction in progress",
          };
        }
      }

      const userWallet = await Wallet.findOne({
        where: {
          userId: user.id,
        },
      });
      if (!userWallet) {
        throw AppError.badRequest({
          message: `user wallet not found`,
        });
      }

      const receiverWallet = await Wallet.findOne({
        where: {
          userId: toUserId,
        },
      });
      if (!receiverWallet) {
        throw AppError.badRequest({
          message: `receiver wallet not found`,
        });
      }

      // creating pending state
      txLog = await TransactionLog.create({
        idempotencyKey,
        fromWalletId: userWallet.id,
        toWalletId: receiverWallet.id,
        amount: Number(amount),
        status: "PENDING",
      });

      // execute transfer in transaction
      await sequelize.transaction(async (tx) => {
        const userWallet = await Wallet.findOne({
          where: {
            userId: user.id,
          },
          lock: tx.LOCK.UPDATE,
          transaction: tx,
        });

        const receiverWallet = await Wallet.findOne({
          where: {
            userId: toUserId,
          },
          lock: tx.LOCK.UPDATE,
          transaction: tx,
        });

        if (!userWallet || !receiverWallet) {
          throw AppError.badRequest({
            message: `wallets not found`,
          });
        }

        const userBalance = userWallet.balance;
        const amountNum = Number(amount);

        if (userBalance < amountNum) {
          throw AppError.badRequest({
            message: `insufficient balance`,
          });
        }

        // updating balances
        await userWallet.decrement("balance", {
          by: amountNum,
          transaction: tx,
        });
        await receiverWallet.increment("balance", {
          by: amountNum,
          transaction: tx,
        });

        // mark as completed
        if (txLog) {
          await txLog.update(
            {
              status: "COMPLETED",
            },
            {
              transaction: tx,
            }
          );
        }
      });

      return {
        message: "transfer successful",
        transaction: txLog,
      };
    } catch (error: unknown) {
      if (txLog) {
        await txLog.update({
          status: "FAILED",
        });
      }

      const message = error instanceof Error ? error.message : String(error);
      throw AppError.internalServerError({ message });
    }
  }
}
