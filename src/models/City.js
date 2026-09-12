import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const City = sequelize.define(
  "City",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "city_id",
    },
    short_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1=active 2=inactive",
    },
  },
  {
    tableName: "city",
    freezeTableName: true,
    timestamps: false,
  }
);

export default City;
