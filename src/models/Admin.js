import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pass_view: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    login_type: {
      type: DataTypes.ENUM("superadmin", "admin"),
      allowNull: false,
      defaultValue: "admin",
    },
    location: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    fcm_token: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admin",
    freezeTableName: true,
    underscored: false,
    timestamps: true,
    createdAt: false,
    updatedAt: "timestamp",
  }
);

Admin.LOGIN_TYPES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
};

export default Admin;
