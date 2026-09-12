import * as couponRepository from "../../repositories/admin/coupon.repository.js";
import ApiError from "../../utils/ApiError.js";
import { STATUS } from "../../utils/constants/car.enums.js";

const normalizeCoupon = (coupon) => ({
  id: coupon.id,
  code: coupon.code,
  title: coupon.title,
  description: coupon.description,
  discount_percent: Number(coupon.discount_percent),
  max_discount_amount:
    coupon.max_discount_amount !== null
      ? Number(coupon.max_discount_amount)
      : null,
  min_base_rental_amount:
    coupon.min_base_rental_amount !== null
      ? Number(coupon.min_base_rental_amount)
      : null,
  valid_from: coupon.valid_from,
  valid_to: coupon.valid_to,
  usage_limit: coupon.usage_limit,
  used_count: coupon.used_count,
  remaining_uses:
    coupon.usage_limit > 0
      ? Math.max(coupon.usage_limit - coupon.used_count, 0)
      : null,
  status: coupon.status,
  created_at: coupon.created_at,
  updated_at: coupon.updated_at,
});

export const listCoupons = async (query) => {
  const result = await couponRepository.findAll({
    status: query.status,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

  return {
    rows: result.rows.map(normalizeCoupon),
    count: result.count,
    pagination: result.pagination,
  };
};

export const getCouponById = async (id) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }
  return normalizeCoupon(coupon);
};

export const createCoupon = async (payload) => {
  const code = payload.code.trim().toUpperCase();
  const existing = await couponRepository.findByCode(code);
  if (existing) {
    throw new ApiError(409, "Coupon code already exists");
  }

  const coupon = await couponRepository.create({
    code,
    title: payload.title.trim(),
    description: payload.description?.trim() || null,
    discount_percent: payload.discount_percent,
    max_discount_amount: payload.max_discount_amount ?? null,
    min_base_rental_amount: payload.min_base_rental_amount ?? null,
    valid_from: payload.valid_from,
    valid_to: payload.valid_to,
    usage_limit: payload.usage_limit ?? 0,
    status: payload.status ?? STATUS.ACTIVE,
  });

  return normalizeCoupon(coupon);
};

export const updateCoupon = async (id, payload) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (payload.code) {
    const duplicate = await couponRepository.findByCode(payload.code);
    if (duplicate && duplicate.id !== id) {
      throw new ApiError(409, "Coupon code already exists");
    }
  }

  const updates = {};
  if (payload.code !== undefined) updates.code = payload.code.trim().toUpperCase();
  if (payload.title !== undefined) updates.title = payload.title.trim();
  if (payload.description !== undefined) {
    updates.description = payload.description?.trim() || null;
  }
  if (payload.discount_percent !== undefined) {
    updates.discount_percent = payload.discount_percent;
  }
  if (payload.max_discount_amount !== undefined) {
    updates.max_discount_amount = payload.max_discount_amount;
  }
  if (payload.min_base_rental_amount !== undefined) {
    updates.min_base_rental_amount = payload.min_base_rental_amount;
  }
  if (payload.valid_from !== undefined) updates.valid_from = payload.valid_from;
  if (payload.valid_to !== undefined) updates.valid_to = payload.valid_to;
  if (payload.usage_limit !== undefined) updates.usage_limit = payload.usage_limit;
  if (payload.status !== undefined) updates.status = payload.status;

  const updated = await couponRepository.update(id, updates);
  return normalizeCoupon(updated);
};

export const updateCouponStatus = async (id, status) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const updated = await couponRepository.update(id, { status });
  return normalizeCoupon(updated);
};

export const deleteCoupon = async (id) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (coupon.status === STATUS.INACTIVE) {
    throw new ApiError(400, "Coupon is already inactive");
  }

  const updated = await couponRepository.softDelete(id);
  return normalizeCoupon(updated);
};
