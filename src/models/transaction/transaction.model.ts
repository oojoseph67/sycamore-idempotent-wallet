import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "transaction_logs" })
export class TransactionLog extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  idempotencyKey!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  fromWalletId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  toWalletId!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.ENUM("PENDING", "COMPLETED", "FAILED"),
    defaultValue: "PENDING",
  })
  status!: string;
}
