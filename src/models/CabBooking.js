import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from "../utils/constants/booking.enums.js";
import { CAB_TRIP_TYPES } from "../utils/constants/cab.enums.js";

const CabBooking = sequelize.define(
  "CabBooking",
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
      comment: "Human-readable ref e.g. IYC-00001",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    car_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK to cars — individual car selected by user",
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Required for local/airport; pickup city for one_way/round_trip",
    },
    coupon_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "FK to cab_packages; only for trip_type=local",
    },
    trip_type: {
      type: DataTypes.ENUM(...Object.values(CAB_TRIP_TYPES)),
      allowNull: false,
    },
    pickup_location: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    drop_location: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: "Null for local/rental (city-scoped)",
    },
    stops: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of intermediate stop address strings",
    },
    departure_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    return_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Only for round_trip",
    },
    distance_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Client-provided distance for one_way/round_trip fare calc",
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    base_fare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    driver_allowance: {
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
    tableName: "cab_bookings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default CabBooking;
