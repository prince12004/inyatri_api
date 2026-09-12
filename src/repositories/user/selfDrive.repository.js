import { Op, QueryTypes } from "sequelize";
import {
  Car,
  CarAdditionalImage,
  CarBrand,
  CarFeature,
  CarType,
  City,
  sequelize,
} from "../../models/index.js";
import { STATUS } from "../../utils/constants/car.enums.js";
import { buildPagination } from "../shared/query.util.js";

const pricedCarSqlCondition = `
  (
    (c.price_per_day IS NOT NULL AND c.price_per_day > 0)
    OR (c.price_per_hour IS NOT NULL AND c.price_per_hour > 0)
  )
`;

const listIncludes = [
  { model: CarBrand, as: "brand", attributes: ["id", "brand_name"] },
  { model: CarType, as: "carType", attributes: ["id", "type_name"] },
  { model: City, as: "city", attributes: ["id", "short_name", "name"] },
  {
    model: CarFeature,
    as: "features",
    attributes: ["id", "name"],
    through: { attributes: [] },
  },
];

const detailIncludes = [
  ...listIncludes,
  {
    model: CarAdditionalImage,
    as: "additionalImages",
    attributes: ["id", "image_url", "sort_order"],
  },
];

const buildCarWhere = ({ cityId, carTypeId, transmission, fuelType }) => {
  const where = {
    status: STATUS.ACTIVE,
    [Op.or]: [
      { price_per_day: { [Op.gt]: 0 } },
      { price_per_hour: { [Op.gt]: 0 } },
    ],
  };

  if (cityId) where.city_id = cityId;
  if (carTypeId) where.car_type_id = carTypeId;
  if (transmission) where.transmission = transmission;
  if (fuelType) where.fuel_type = fuelType;

  return where;
};

const cityFilterSql = (cityId) =>
  cityId ? "AND c.city_id = :cityId" : "";

export const findCategoriesWithStartingPrice = async (cityId = null) => {
  const rows = await sequelize.query(
    `
    SELECT
      ct.id AS car_type_id,
      ct.type_name AS name,
      MIN(
        COALESCE(
          NULLIF(c.price_per_day, 0),
          NULLIF(c.price_per_hour, 0) * 24
        )
      ) AS starting_price_per_day,
      COUNT(c.id) AS available_cars_count
    FROM car_types ct
    INNER JOIN cars c
      ON c.car_type_id = ct.id
      AND c.status = :activeStatus
      ${cityFilterSql(cityId)}
    WHERE ct.status = :activeStatus
      AND ${pricedCarSqlCondition}
    GROUP BY ct.id, ct.type_name
    HAVING available_cars_count > 0
    ORDER BY ct.type_name ASC
    `,
    {
      replacements: { cityId, activeStatus: STATUS.ACTIVE },
      type: QueryTypes.SELECT,
    }
  );

  if (!rows.length) return [];

  const typeIds = rows.map((row) => row.car_type_id);

  const cheapestCars = await sequelize.query(
    `
    SELECT car_type_id, car_name, city_id, city_name, effective_price
    FROM (
      SELECT
        c.car_type_id,
        c.car_name,
        c.city_id,
        ci.name AS city_name,
        COALESCE(NULLIF(c.price_per_day, 0), c.price_per_hour * 24) AS effective_price,
        ROW_NUMBER() OVER (
          PARTITION BY c.car_type_id
          ORDER BY COALESCE(NULLIF(c.price_per_day, 0), c.price_per_hour * 24) ASC, c.id ASC
        ) AS row_num
      FROM cars c
      INNER JOIN city ci ON ci.city_id = c.city_id
      WHERE c.status = :activeStatus
        AND c.car_type_id IN (:typeIds)
        ${cityFilterSql(cityId)}
        AND ${pricedCarSqlCondition}
    ) ranked
    WHERE row_num = 1
    `,
    {
      replacements: { cityId, activeStatus: STATUS.ACTIVE, typeIds },
      type: QueryTypes.SELECT,
    }
  );

  const cheapestByType = cheapestCars.reduce((acc, row) => {
    acc[row.car_type_id] = {
      cheapest_car_name: row.car_name,
      cheapest_car_city: row.city_name,
      cheapest_car_city_id: row.city_id,
    };
    return acc;
  }, {});

  const examples = await sequelize.query(
    `
    SELECT car_type_id, model
    FROM (
      SELECT
        car_type_id,
        model,
        ROW_NUMBER() OVER (
          PARTITION BY car_type_id
          ORDER BY COALESCE(NULLIF(price_per_day, 0), price_per_hour * 24) ASC, id ASC
        ) AS row_num
      FROM cars
      WHERE status = :activeStatus
        AND car_type_id IN (:typeIds)
        ${cityId ? "AND city_id = :cityId" : ""}
        AND model IS NOT NULL
        AND TRIM(model) <> ''
    ) ranked
    WHERE row_num <= 3
    ORDER BY car_type_id ASC, row_num ASC
    `,
    {
      replacements: { cityId, activeStatus: STATUS.ACTIVE, typeIds },
      type: QueryTypes.SELECT,
    }
  );

  const examplesByType = examples.reduce((acc, row) => {
    if (!acc[row.car_type_id]) acc[row.car_type_id] = [];
    if (!acc[row.car_type_id].includes(row.model)) {
      acc[row.car_type_id].push(row.model);
    }
    return acc;
  }, {});

  return rows.map((row) => {
    const cheapest = cheapestByType[row.car_type_id] ?? {};
    const startingPrice = Number(row.starting_price_per_day);

    return {
      car_type_id: row.car_type_id,
      name: row.name,
      starting_price_per_day: startingPrice,
      rental_total_for_default_day: startingPrice,
      cheapest_car_name: cheapest.cheapest_car_name ?? null,
      cheapest_car_city: cheapest.cheapest_car_city ?? null,
      cheapest_car_city_id: cheapest.cheapest_car_city_id ?? null,
      available_cars_count: Number(row.available_cars_count),
      example_models: examplesByType[row.car_type_id] ?? [],
    };
  });
};

export const findAvailableCars = async ({
  cityId = null,
  carTypeId,
  transmission,
  fuelType,
  page,
  limit,
}) => {
  const pagination = buildPagination(page, limit);
  const where = buildCarWhere({ cityId, carTypeId, transmission, fuelType });

  const { rows, count } = await Car.findAndCountAll({
    where,
    include: listIncludes,
    order: [
      ["show_on_top", "DESC"],
      ["created_at", "DESC"],
    ],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true,
  });

  return { rows, count, pagination };
};

export const findAvailableCarById = async (id, cityId = null) => {
  const where = {
    id,
    status: STATUS.ACTIVE,
    [Op.or]: [
      { price_per_day: { [Op.gt]: 0 } },
      { price_per_hour: { [Op.gt]: 0 } },
    ],
  };

  if (cityId) {
    where.city_id = cityId;
  }

  return Car.findOne({
    where,
    include: detailIncludes,
  });
};

export const countPricedCars = async (cityId = null) => {
  const where = {
    status: STATUS.ACTIVE,
    [Op.or]: [
      { price_per_day: { [Op.gt]: 0 } },
      { price_per_hour: { [Op.gt]: 0 } },
    ],
  };

  if (cityId) {
    where.city_id = cityId;
  }

  return Car.count({ where });
};

export const categoryHasCars = async (carTypeId, cityId = null) => {
  const where = buildCarWhere({ cityId, carTypeId });
  return Car.count({ where });
};
