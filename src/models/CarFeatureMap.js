import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const CarFeatureMap = sequelize.define(
  "CarFeatureMap",
  {
    car_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    feature_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "car_feature_map",
    freezeTableName: true,
    timestamps: false,
  }
);

export default CarFeatureMap;
