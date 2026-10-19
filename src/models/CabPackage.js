import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const CabPackage = sequelize.define(
  "CabPackage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "City this package is available in",
    },
    duration_hours: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "Duration of the package in hours e.g. 1, 2, 4, 8",
    },
    included_km: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "KM included in the package e.g. 10, 20, 40, 80",
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Display label e.g. 1 Hour · 10 km",
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1=active, 2=inactive",
    },
  },
  {
    tableName: "cab_packages",
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default CabPackage;
