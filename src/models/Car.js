import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
} from "../utils/constants/car.enums.js";

const Car = sequelize.define(
  "Car",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    car_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    vehicle_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    fuel_type: {
      type: DataTypes.ENUM(...FUEL_TYPES),
      allowNull: false,
    },
    car_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transmission: {
      type: DataTypes.ENUM(...TRANSMISSION_TYPES),
      allowNull: false,
    },
    seats: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    made_year: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    mileage: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    horsepower: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    car_condition: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    travelled_km: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    travelling_allowed_per_day: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Max km allowed per rental day",
    },
    extra_charge_per_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Charge per km when daily limit exceeded",
    },
    price_per_hour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    price_per_day: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Self-drive daily rate; falls back to price_per_hour * 24",
    },
    weekend_price_per_hour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    main_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    enable_monthly_subscription: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    discount_15_days: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount_1_month: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount_3_months: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount_6_months: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    sold_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sold_to: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sold_remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refundable_deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 5000,
    },
    home_delivery_charge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 2000,
    },
    show_on_top: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    home_delivery_available: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1=active 2=inactive",
    },
  },
  {
    tableName: "cars",
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Car;
