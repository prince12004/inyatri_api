import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstname: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: "",
    },
    lastname: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: "",
    },
    mobile: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
      defaultValue: "+91",
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: "",
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    referral_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: "",
    },
    address: {
      type: DataTypes.STRING(300),
      allowNull: true,
      defaultValue: "",
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: "",
    },
    picture: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: "",
    },
    google_id: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: "",
    },
    is_google_user: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 2,
      comment: "1=google user, 2=normal, 3=facebook",
    },
    token: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    driving_license_front: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    driving_license_back: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    government_id: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    marketing_opt_in: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    agreed_to_terms: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1=active, 2=inactive, 0=deleted",
    },
  },
  {
    tableName: "users",
    freezeTableName: true,
    underscored: false,
    timestamps: true,
    createdAt: "created",
    updatedAt: false,
  }
);

User.USER_TYPES = {
  GOOGLE: 1,
  NORMAL: 2,
  FACEBOOK: 3,
};

User.STATUS = {
  DELETED: 0,
  ACTIVE: 1,
  INACTIVE: 2,
};

export default User;
