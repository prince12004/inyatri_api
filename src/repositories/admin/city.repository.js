import { City } from "../../models/index.js";
import {
  buildPagination,
  buildSearchFilter,
  buildStatusFilter,
} from "../shared/query.util.js";

export const findAll = async ({ status, search, page, limit }) => {
  const pagination = buildPagination(page, limit);
  const where = {
    ...buildStatusFilter(status),
    ...buildSearchFilter(["name", "short_name"], search),
  };

  const { rows, count } = await City.findAndCountAll({
    where,
    order: [["name", "ASC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

export const findById = async (id) => City.findByPk(id);

export const create = async (data) => City.create(data);

export const update = async (id, data) => {
  const row = await findById(id);
  if (!row) return null;
  await row.update(data);
  return row;
};

export const softDelete = async (id) => update(id, { status: 2 });

export const findActiveById = async (id) =>
  City.findOne({
    where: { id, status: 1 },
  });
