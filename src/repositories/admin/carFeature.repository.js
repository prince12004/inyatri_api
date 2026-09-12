import { CarFeature } from "../../models/index.js";
import {
  buildPagination,
  buildSearchFilter,
  buildStatusFilter,
} from "../shared/query.util.js";

export const findAll = async ({ status, search, page, limit }) => {
  const pagination = buildPagination(page, limit);
  const where = {
    ...buildStatusFilter(status),
    ...buildSearchFilter(["name"], search),
  };

  const { rows, count } = await CarFeature.findAndCountAll({
    where,
    order: [["name", "ASC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

export const findById = async (id) => CarFeature.findByPk(id);

export const create = async (data) => CarFeature.create(data);

export const update = async (id, data) => {
  const row = await findById(id);
  if (!row) return null;
  await row.update(data);
  return row;
};

export const softDelete = async (id) =>
  update(id, { status: 2 });

export const findActiveByIds = async (ids) =>
  CarFeature.findAll({
    where: { id: ids, status: 1 },
  });
