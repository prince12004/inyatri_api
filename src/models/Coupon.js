import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import { STATUS } from "../utils/constants/car.enums.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    max_discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    min_base_rental_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valid_to: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0 = unlimited",
    },
    used_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: STATUS.ACTIVE,
    },
  },
  {
    tableName: "coupons",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Coupon;
