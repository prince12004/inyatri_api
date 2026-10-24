import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    recipient_role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "general",
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notifications",
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Notification;
