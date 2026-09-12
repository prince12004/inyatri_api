import { Op } from "sequelize";

export const buildPagination = (page = 1, limit = 20) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (parsedPage - 1) * parsedLimit;

  return { page: parsedPage, limit: parsedLimit, offset };
};

export const buildSearchFilter = (fields, search) => {
  if (!search || !String(search).trim()) {
    return {};
  }

  const term = `%${String(search).trim()}%`;
  return {
    [Op.or]: fields.map((field) => ({
      [field]: { [Op.like]: term },
    })),
  };
};

export const buildStatusFilter = (status) => {
  if (status === undefined || status === null || status === "") {
    return {};
  }

  return { status: parseInt(status, 10) };
};
