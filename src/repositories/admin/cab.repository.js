import { QueryTypes, Op } from "sequelize";
import {
  Car,
  CabFareSlab,
  CabPackage,
  CarBrand,
  CarType,
  City,
  sequelize,
} from "../../models/index.js";
import {
  buildPagination,
  buildSearchFilter,
} from "../shared/query.util.js";

// ─── Dashboard Stats ───────────────────────────────────────────────────────

/**
 * Aggregated stats for the Cab Management dashboard.
 * Returns total_cars, total_cabs (configured cars), and per-trip-type counts.
 */
export const getCabDashboardStats = async () => {
  const [stats] = await sequelize.query(
    `
    SELECT
      (SELECT COUNT(*) FROM cars WHERE status = 1) AS total_cars,
      (SELECT COUNT(DISTINCT car_id) FROM cab_fare_slabs WHERE status = 1) AS total_cabs,
      (SELECT COUNT(DISTINCT car_id) FROM cab_fare_slabs WHERE trip_type = 'one_way'   AND status = 1) AS one_way,
      (SELECT COUNT(DISTINCT car_id) FROM cab_fare_slabs WHERE trip_type = 'round_trip' AND status = 1) AS round_trip,
      (SELECT COUNT(DISTINCT car_id) FROM cab_fare_slabs WHERE trip_type = 'local'      AND status = 1) AS local_trip,
      (SELECT COUNT(DISTINCT car_id) FROM cab_fare_slabs WHERE trip_type = 'airport'   AND status = 1) AS airport
    `,
    { type: QueryTypes.SELECT }
  );

  return {
    total_cars: Number(stats.total_cars),
    total_cabs: Number(stats.total_cabs),
    one_way: Number(stats.one_way),
    round_trip: Number(stats.round_trip),
    local: Number(stats.local_trip),
    airport: Number(stats.airport),
  };
};

/**
 * "Cab Availability (Car Wise)" table.
 * Each car shows: car_name, seats, city, cab_configured (bool), pricing_count.
 */
export const findCarsWithCabStatus = async ({ page, limit, search, cityId }) => {
  const pagination = buildPagination(page, limit);

  const whereClauses = ["c.status = 1"];
  const replacements = {};

  if (cityId) {
    whereClauses.push("c.city_id = :cityId");
    replacements.cityId = cityId;
  }
  if (search) {
    whereClauses.push("c.car_name LIKE :search");
    replacements.search = `%${search}%`;
  }

  const whereStr = whereClauses.join(" AND ");

  const rows = await sequelize.query(
    `
    SELECT
      c.id,
      c.car_name,
      c.seats,
      c.city_id,
      ci.name AS city_name,
      ci.short_name AS city_short_name,
      COUNT(cfs.id) AS pricing_count,
      (COUNT(cfs.id) > 0) AS cab_configured
    FROM cars c
    LEFT JOIN city ci ON ci.city_id = c.city_id
    LEFT JOIN cab_fare_slabs cfs ON cfs.car_id = c.id AND cfs.status = 1
    WHERE ${whereStr}
    GROUP BY c.id, c.car_name, c.seats, c.city_id, ci.name, ci.short_name
    ORDER BY c.created_at DESC
    LIMIT :limit OFFSET :offset
    `,
    {
      replacements: { ...replacements, limit: pagination.limit, offset: pagination.offset },
      type: QueryTypes.SELECT,
    }
  );

  const [countRow] = await sequelize.query(
    `SELECT COUNT(DISTINCT c.id) AS total FROM cars c WHERE ${whereStr}`,
    { replacements, type: QueryTypes.SELECT }
  );

  return {
    rows: rows.map((row) => ({
      id: row.id,
      car_name: row.car_name,
      seats: row.seats,
      city: { id: row.city_id, name: row.city_name, short_name: row.city_short_name },
      cab_configured: Boolean(Number(row.cab_configured)),
      pricing_count: Number(row.pricing_count),
    })),
    count: Number(countRow.total),
    pagination,
  };
};

// ─── Cab Pricing CRUD ──────────────────────────────────────────────────────

/**
 * Paginated list of all cab_fare_slabs (Cab Pricing table in admin).
 */
export const findAllCabPricings = async ({ page, limit, carId, tripType, status }) => {
  const pagination = buildPagination(page, limit);
  const where = {};

  if (carId) where.car_id = carId;
  if (tripType) where.trip_type = tripType;
  if (status !== undefined && status !== null) where.status = status;

  const { rows, count } = await CabFareSlab.findAndCountAll({
    where,
    include: [
      {
        model: Car,
        as: "car",
        attributes: ["id", "car_name", "seats", "city_id"],
        include: [{ model: City, as: "city", attributes: ["id", "name", "short_name"] }],
      },
      {
        model: CabPackage,
        as: "package",
        attributes: ["id", "label", "duration_hours", "included_km"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true,
  });

  return { rows, count, pagination };
};

export const findCabPricingById = async (id) =>
  CabFareSlab.findByPk(id, {
    include: [
      {
        model: Car,
        as: "car",
        attributes: ["id", "car_name", "seats"],
        include: [{ model: City, as: "city", attributes: ["id", "name"] }],
      },
      { model: CabPackage, as: "package", required: false },
    ],
  });

export const findCabPricingByCarAndTripType = async (
  carId,
  tripType,
  packageId = null,
  excludeId = null
) => {
  const where = { car_id: carId, trip_type: tripType, status: 1 };
  if (packageId) where.package_id = packageId;
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return CabFareSlab.findOne({ where });
};

export const createCabPricing = async (data) => CabFareSlab.create(data);

export const updateCabPricing = async (id, data) => {
  const slab = await CabFareSlab.findByPk(id);
  if (!slab) return null;
  await slab.update(data);
  return slab;
};

export const updateCabPricingStatus = async (id, status) => {
  const slab = await CabFareSlab.findByPk(id);
  if (!slab) return null;
  await slab.update({ status });
  return slab;
};

export const deleteCabPricing = async (id) => {
  const slab = await CabFareSlab.findByPk(id);
  if (!slab) return null;
  await slab.destroy();
  return true;
};

// ─── Dropdown Helpers ──────────────────────────────────────────────────────

/**
 * "Select Car" dropdown — all active cars with basic details.
 */
export const findActiveCarsForDropdown = async () =>
  Car.findAll({
    where: { status: 1 },
    attributes: ["id", "car_name", "seats", "city_id"],
    include: [{ model: City, as: "city", attributes: ["id", "name", "short_name"] }],
    order: [["car_name", "ASC"]],
  });

// ─── Cab Packages CRUD ─────────────────────────────────────────────────────

export const findAllCabPackages = async ({ page, limit, cityId, status }) => {
  const pagination = buildPagination(page, limit);
  const where = {};
  if (cityId) where.city_id = cityId;
  if (status !== undefined && status !== null) where.status = status;

  const { rows, count } = await CabPackage.findAndCountAll({
    where,
    include: [{ model: City, as: "city", attributes: ["id", "name", "short_name"] }],
    order: [
      ["city_id", "ASC"],
      ["sort_order", "ASC"],
      ["duration_hours", "ASC"],
    ],
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return { rows, count, pagination };
};

export const findCabPackageById = async (id) =>
  CabPackage.findByPk(id, {
    include: [{ model: City, as: "city", attributes: ["id", "name"] }],
  });

export const createCabPackage = async (data) => CabPackage.create(data);

export const updateCabPackage = async (id, data) => {
  const pkg = await CabPackage.findByPk(id);
  if (!pkg) return null;
  await pkg.update(data);
  return pkg;
};

export const updateCabPackageStatus = async (id, status) => {
  const pkg = await CabPackage.findByPk(id);
  if (!pkg) return null;
  await pkg.update({ status });
  return pkg;
};
