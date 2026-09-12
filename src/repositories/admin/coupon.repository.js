import { Op } from "sequelize";
import { Coupon } from "../../models/index.js";
import { STATUS } from "../../utils/constants/car.enums.js";
import {
  buildPagination,
  buildSearchFilter,
  buildStatusFilter,
} from "../shared/query.util.js";

export const findAll = async ({ status, search, page, limit }) => {
  const pagination = buildPagination(page, limit);
  const where = {
    ...buildStatusFilter(status),
    ...buildSearchFilter(["code", "title", "description"], search),
  };

  const { rows, count } = await Coupon.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

export const findById = async (id) => Coupon.findByPk(id);

export const findByCode = async (code) =>
  Coupon.findOne({
    where: {
      code: code.trim().toUpperCase(),
    },
  });

export const create = async (data) => Coupon.create(data);

export const update = async (id, data) => {
  const row = await findById(id);
  if (!row) return null;
  await row.update(data);
  return row;
};

export const softDelete = async (id) => update(id, { status: STATUS.INACTIVE });

export const findActiveByCode = async (code) =>
  Coupon.findOne({
    where: {
      code: code.trim().toUpperCase(),
      status: STATUS.ACTIVE,
    },
  });

export const findAvailableForUser = async ({
  userId,
  baseRentalAmount,
  now = new Date(),
}) => {
  const coupons = await Coupon.findAll({
    where: {
      status: STATUS.ACTIVE,
      valid_from: { [Op.lte]: now },
      valid_to: { [Op.gte]: now },
      ...(baseRentalAmount
        ? {
            [Op.or]: [
              { min_base_rental_amount: null },
              { min_base_rental_amount: { [Op.lte]: baseRentalAmount } },
            ],
          }
        : {}),
    },
    order: [["discount_percent", "DESC"]],
  });

  return coupons;
};

export const incrementUsedCount = async (couponId, transaction) => {
  const coupon = await Coupon.findByPk(couponId, { transaction, lock: true });
  if (!coupon) return null;
  await coupon.increment("used_count", { transaction });
  return coupon;
};
