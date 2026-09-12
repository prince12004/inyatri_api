import { Admin, sequelize } from "../../models/index.js";

export const findAdminByEmail = async (email) =>
  Admin.findOne({
    where: sequelize.where(
      sequelize.fn("LOWER", sequelize.col("email")),
      email
    ),
  });

export const findAdminById = async (id) => Admin.findByPk(id);
