import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import { PAYMENT_ATTEMPT_STATUS } from "../utils/constants/booking.enums.js";

const BookingPayment = sequelize.define(
  "BookingPayment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attempt_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payu_txn_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: PAYMENT_ATTEMPT_STATUS.INITIATED,
    },
    gateway_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "booking_payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default BookingPayment;
