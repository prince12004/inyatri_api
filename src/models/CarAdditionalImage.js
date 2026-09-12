import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const CarAdditionalImage = sequelize.define(
  "CarAdditionalImage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    car_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "car_additional_images",
    freezeTableName: true,
    timestamps: false,
  }
);

export default CarAdditionalImage;
