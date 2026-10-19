import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import { CAB_TRIP_TYPES } from "../utils/constants/cab.enums.js";

const CabFareSlab = sequelize.define(
  "CabFareSlab",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    car_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK to cars — pricing is per individual car",
    },
    trip_type: {
      type: DataTypes.ENUM(...Object.values(CAB_TRIP_TYPES)),
      allowNull: false,
      comment: "one_way | round_trip | local | airport",
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "FK to cab_packages — only for trip_type=local",
    },
    base_km: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "KM included in the base fare (e.g. 150 km)",
    },
    base_fare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Fixed base price covering base_km (e.g. ₹3200)",
    },
    per_km_charge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Price per km beyond base_km (e.g. ₹12/km)",
    },
    driver_allowance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Fixed driver allowance added on top of fare",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1=active, 2=inactive",
    },
  },
  {
    tableName: "cab_fare_slabs",
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default CabFareSlab;
