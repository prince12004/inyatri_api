import { State } from "../../models/index.js";
import {
  buildPagination,
  buildSearchFilter,
  buildStatusFilter,
} from "../shared/query.util.js";

export const findAll = async ({ status, search, page, limit }) => {
  const pagination = buildPagination(page, limit);
  const where = {
    ...buildStatusFilter(status),
    ...buildSearchFilter(["state_name"], search),
  };

  const { rows, count } = await State.findAndCountAll({
    where,
    order: [["state_name", "ASC"]],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

export const findById = async (id) => State.findByPk(id);

export const create = async (data) => State.create(data);

export const update = async (id, data) => {
  const row = await findById(id);
  if (!row) return null;
  await row.update(data);
  return row;
};

export const softDelete = async (id) =>
  update(id, { status: 2 });

export const findByIds = async (ids) =>
  State.findAll({
    where: { id: ids },
  });

export const findActiveById = async (id) =>
  State.findOne({
    where: { id, status: 1 },
  });
