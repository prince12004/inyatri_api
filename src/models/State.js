import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const State = sequelize.define(
  "State",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    state_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country_code: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      defaultValue: "IN",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1=active 2=inactive",
    },
  },
  {
    tableName: "states",
    freezeTableName: true,
    timestamps: false,
  }
);

export default State;
