import { CarType } from "../../models/index.js";
import {
  buildPagination,
  buildSearchFilter,
  buildStatusFilter,
} from "../shared/query.util.js";

export const findAll = async ({ status, search, page, limit }) => {
  const pagination = buildPagination(page, limit);
  const where = {
    ...buildStatusFilter(status),
    ...buildSearchFilter(["type_name"], search),
  };

  const { rows, count } = await CarType.findAndCountAll({
    where,
    order: [["type_name", "ASC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

export const findById = async (id) => CarType.findByPk(id);

export const create = async (data) => CarType.create(data);

export const update = async (id, data) => {
  const row = await findById(id);
  if (!row) return null;
  await row.update(data);
  return row;
};

export const softDelete = async (id) =>
  update(id, { status: 2 });

export const findActiveById = async (id) =>
  CarType.findOne({
    where: { id, status: 1 },
  });
