import { City } from "../../models/index.js";
import { STATUS } from "../../utils/constants/car.enums.js";
import { buildPagination } from "../shared/query.util.js";

export const findActiveCities = async ({ page, limit } = {}) => {
  const pagination = buildPagination(page, limit);

  const { rows, count } = await City.findAndCountAll({
    where: { status: STATUS.ACTIVE },
    attributes: ["id", "short_name", "name", "address", "image"],
    order: [["name", "ASC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

export const findActiveCityById = async (id) =>
  City.findOne({
    where: { id, status: STATUS.ACTIVE },
    attributes: ["id", "short_name", "name", "address", "image"],
  });
