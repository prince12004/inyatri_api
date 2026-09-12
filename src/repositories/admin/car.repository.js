import {
  Car,
  CarAdditionalImage,
  CarBrand,
  CarFeature,
  City,
  CarType,
  sequelize,
} from "../../models/index.js";
import { Op } from "sequelize";
import {
  buildPagination,
  buildSearchFilter,
  buildStatusFilter,
} from "../shared/query.util.js";

const carInclude = [
  { model: CarBrand, as: "brand", attributes: ["id", "brand_name"] },
  { model: City, as: "city", attributes: ["id", "short_name", "name"] },
  { model: CarType, as: "carType", attributes: ["id", "type_name"] },
  {
    model: CarFeature,
    as: "features",
    attributes: ["id", "name"],
    through: { attributes: [] },
  },
  { model: CarAdditionalImage, as: "additionalImages" },
];

export const findAll = async ({ status, search, page, limit }) => {
  const pagination = buildPagination(page, limit);
  const where = {
    ...buildStatusFilter(status),
    ...buildSearchFilter(["car_name", "vehicle_number", "location"], search),
  };

  const { rows, count } = await Car.findAndCountAll({
    where,
    include: [
      { model: CarBrand, as: "brand", attributes: ["id", "brand_name"] },
      { model: City, as: "city", attributes: ["id", "short_name", "name"] },
      { model: CarType, as: "carType", attributes: ["id", "type_name"] },
      {
        model: CarFeature,
        as: "features",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
    order: [["created_at", "DESC"]],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true,
  });

  return { rows, count, pagination };
};

export const findById = async (id) =>
  Car.findByPk(id, { include: carInclude });

export const findByVehicleNumber = async (vehicleNumber, excludeId = null) => {
  const where = { vehicle_number: vehicleNumber };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  return Car.findOne({ where });
};

export const createWithRelations = async (carData, relations, transaction) => {
  const { featureIds = [], additionalImages = [] } = relations;

  const car = await Car.create(carData, { transaction });

  if (featureIds.length) {
    await car.setFeatures(featureIds, { transaction });
  }

  if (additionalImages.length) {
    await CarAdditionalImage.bulkCreate(
      additionalImages.map((image, index) => ({
        car_id: car.id,
        image_url: image,
        sort_order: index + 1,
      })),
      { transaction }
    );
  }

  return car;
};

export const updateWithRelations = async (
  car,
  carData,
  relations,
  transaction
) => {
  const { featureIds, additionalImages } = relations;

  await car.update(carData, { transaction });

  if (featureIds !== undefined) {
    await car.setFeatures(featureIds, { transaction });
  }

  if (additionalImages !== undefined) {
    await CarAdditionalImage.destroy({
      where: { car_id: car.id },
      transaction,
    });

    if (additionalImages.length) {
      await CarAdditionalImage.bulkCreate(
        additionalImages.map((image, index) => ({
          car_id: car.id,
          image_url: image,
          sort_order: index + 1,
        })),
        { transaction }
      );
    }
  }

  return car;
};

export const updateStatus = async (id, status) => {
  const car = await Car.findByPk(id);
  if (!car) return null;
  await car.update({ status });
  return car;
};

export const countActiveCarsByBrandId = async (brandId) =>
  Car.count({ where: { brand_id: brandId, status: 1 } });

export const countActiveCarsByCityId = async (cityId) =>
  Car.count({ where: { city_id: cityId, status: 1 } });

export const countActiveCarsByCarTypeId = async (carTypeId) =>
  Car.count({ where: { car_type_id: carTypeId, status: 1 } });

export const countActiveCarsByFeatureId = async (featureId) =>
  Car.count({
    where: { status: 1 },
    include: [
      {
        model: CarFeature,
        as: "features",
        where: { id: featureId },
        required: true,
        through: { attributes: [] },
      },
    ],
    distinct: true,
  });

export { sequelize };
