import { Table, Column, Model, DataType } from "sequelize-typescript";

export interface WalletCreationAttributes {
  userId: string;
  balance?: number;
}

@Table({ tableName: "wallets" })
export class Wallet extends Model<Wallet, WalletCreationAttributes> {
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
  userId!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  balance!: number;
}
