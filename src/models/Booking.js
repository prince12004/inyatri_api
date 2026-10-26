import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from "../utils/constants/booking.enums.js";

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_ref: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    car_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coupon_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pickup_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    drop_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    rental_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pickup_location: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    drop_location: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    insurance_selected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    home_delivery_selected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    base_rental_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    insurance_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    delivery_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    gst_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    payable_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    security_deposit_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    rental_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "rental",
    },
    subscription_plan: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    plan_discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    plan_discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    payment_option: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "full",
    },
    part_payment_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_booking_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    remaining_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    booking_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: BOOKING_STATUS.PENDING_PAYMENT,
    },
    payment_status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: PAYMENT_STATUS.NOT_INITIATED,
    },
    payu_txn_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    payu_mihpayid: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    payu_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cancellation_reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "bookings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Booking;
