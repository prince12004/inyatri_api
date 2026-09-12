import * as carRepository from "../../repositories/admin/car.repository.js";
import * as carBrandRepository from "../../repositories/admin/carBrand.repository.js";
import * as carFeatureRepository from "../../repositories/admin/carFeature.repository.js";
import * as cityRepository from "../../repositories/admin/city.repository.js";
import * as carTypeRepository from "../../repositories/admin/carType.repository.js";
import ApiError from "../../utils/ApiError.js";
import { STATUS } from "../../utils/constants/car.enums.js";

const mapCarPayload = (payload) => ({
  car_name: payload.car_name.trim(),
  vehicle_number: payload.vehicle_number.trim().toUpperCase(),
  brand_id: payload.brand_id,
  city_id: payload.city_id,
  location: payload.location.trim(),
  latitude: payload.latitude ?? null,
  longitude: payload.longitude ?? null,
  fuel_type: payload.fuel_type,
  car_type_id: payload.car_type_id,
  transmission: payload.transmission,
  seats: payload.seats,
  made_year: payload.made_year,
  model: payload.model?.trim() || null,
  mileage: payload.mileage?.trim() || null,
  horsepower: payload.horsepower?.trim() || null,
  car_condition: payload.car_condition?.trim() || null,
  version: payload.version?.trim() || null,
  travelled_km: payload.travelled_km,
  travelling_allowed_per_day: payload.travelling_allowed_per_day,
  extra_charge_per_km: payload.extra_charge_per_km ?? 0,
  price_per_hour: payload.price_per_hour ?? null,
  price_per_day: payload.price_per_day ?? null,
  weekend_price_per_hour: payload.weekend_price_per_hour ?? null,
  short_description: payload.short_description?.trim() || null,
  main_image: payload.main_image,
  enable_monthly_subscription: payload.enable_monthly_subscription ? 1 : 0,
  discount_15_days: payload.discount_15_days ?? 0,
  discount_1_month: payload.discount_1_month ?? 0,
  discount_3_months: payload.discount_3_months ?? 0,
  discount_6_months: payload.discount_6_months ?? 0,
  sold_from: payload.sold_from || null,
  sold_to: payload.sold_to || null,
  sold_remark: payload.sold_remark?.trim() || null,
  refundable_deposit: payload.refundable_deposit ?? 5000,
  home_delivery_charge: payload.home_delivery_charge ?? 2000,
  show_on_top: payload.show_on_top ? 1 : 0,
  home_delivery_available: payload.home_delivery_available ? 1 : 0,
  status: payload.status ?? STATUS.ACTIVE,
});

const validateReferences = async (payload) => {
  const [brand, city, carType, features] = await Promise.all([
    carBrandRepository.findById(payload.brand_id),
    cityRepository.findActiveById(payload.city_id),
    carTypeRepository.findActiveById(payload.car_type_id),
    carFeatureRepository.findActiveByIds(payload.feature_ids),
  ]);

  if (!brand || brand.status !== STATUS.ACTIVE) {
    throw new ApiError(400, "Invalid or inactive car brand");
  }

  if (!city) {
    throw new ApiError(400, "Invalid or inactive city");
  }

  if (!carType) {
    throw new ApiError(400, "Invalid or inactive car type");
  }

  if (features.length !== payload.feature_ids.length) {
    throw new ApiError(400, "One or more car features are invalid or inactive");
  }
};

export const listCars = async (query) =>
  carRepository.findAll({
    status: query.status,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

export const getCarById = async (id) => {
  const car = await carRepository.findById(id);
  if (!car) {
    throw new ApiError(404, "Car not found");
  }
  return car;
};

export const createCar = async (payload) => {
  await validateReferences(payload);

  const existingVehicle = await carRepository.findByVehicleNumber(
    payload.vehicle_number.trim().toUpperCase()
  );

  if (existingVehicle) {
    throw new ApiError(409, "Vehicle number already exists");
  }

  const transaction = await carRepository.sequelize.transaction();

  try {
    const car = await carRepository.createWithRelations(
      mapCarPayload(payload),
      {
        featureIds: payload.feature_ids,
        additionalImages: payload.additional_images,
      },
      transaction
    );

    await transaction.commit();
    return carRepository.findById(car.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateCar = async (id, payload) => {
  const car = await carRepository.findById(id);
  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  const mergedPayload = {
    car_name: car.car_name,
    vehicle_number: car.vehicle_number,
    brand_id: car.brand_id,
    city_id: car.city_id,
    location: car.location,
    latitude: car.latitude,
    longitude: car.longitude,
    fuel_type: car.fuel_type,
    car_type_id: car.car_type_id,
    transmission: car.transmission,
    seats: car.seats,
    made_year: car.made_year,
    model: car.model,
    mileage: car.mileage,
    horsepower: car.horsepower,
    car_condition: car.car_condition,
    version: car.version,
    travelled_km: car.travelled_km,
    travelling_allowed_per_day: car.travelling_allowed_per_day,
    extra_charge_per_km: car.extra_charge_per_km,
    price_per_hour: car.price_per_hour,
    price_per_day: car.price_per_day,
    weekend_price_per_hour: car.weekend_price_per_hour,
    short_description: car.short_description,
    main_image: car.main_image,
    enable_monthly_subscription: car.enable_monthly_subscription,
    discount_15_days: car.discount_15_days,
    discount_1_month: car.discount_1_month,
    discount_3_months: car.discount_3_months,
    discount_6_months: car.discount_6_months,
    sold_from: car.sold_from,
    sold_to: car.sold_to,
    sold_remark: car.sold_remark,
    refundable_deposit: car.refundable_deposit,
    home_delivery_charge: car.home_delivery_charge,
    show_on_top: car.show_on_top,
    home_delivery_available: car.home_delivery_available,
    status: car.status,
    feature_ids: car.features?.map((feature) => feature.id) ?? [],
    additional_images:
      car.additionalImages?.map((image) => image.image_url) ?? [],
    ...payload,
  };

  if (
    mergedPayload.brand_id ||
    mergedPayload.city_id ||
    mergedPayload.car_type_id ||
    mergedPayload.feature_ids
  ) {
    await validateReferences({
      brand_id: mergedPayload.brand_id,
      city_id: mergedPayload.city_id,
      car_type_id: mergedPayload.car_type_id,
      feature_ids: mergedPayload.feature_ids,
    });
  }

  if (payload.vehicle_number) {
    const duplicate = await carRepository.findByVehicleNumber(
      payload.vehicle_number.trim().toUpperCase(),
      id
    );
    if (duplicate) {
      throw new ApiError(409, "Vehicle number already exists");
    }
  }

  const transaction = await carRepository.sequelize.transaction();

  try {
    await carRepository.updateWithRelations(
      car,
      mapCarPayload(mergedPayload),
      {
        featureIds: mergedPayload.feature_ids,
        additionalImages: payload.additional_images,
      },
      transaction
    );

    await transaction.commit();
    return carRepository.findById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateCarStatus = async (id, status) => {
  if (![STATUS.ACTIVE, STATUS.INACTIVE].includes(status)) {
    throw new ApiError(400, "Invalid status. Use 1 for active or 2 for inactive");
  }

  const car = await carRepository.findById(id);
  if (!car) {
    throw new ApiError(404, "Car not found");
  }

  if (car.status === status) {
    throw new ApiError(
      400,
      status === STATUS.INACTIVE
        ? "Car is already inactive"
        : "Car is already active"
    );
  }

  const updatedCar = await carRepository.updateStatus(id, status);
  return {
    car: updatedCar,
    message:
      status === STATUS.INACTIVE
        ? "Car deactivated successfully"
        : "Car activated successfully",
  };
};

export const getCarMeta = () => ({
  fuelTypes: ["petrol", "diesel", "cng"],
  transmissions: ["manual", "automatic"],
  seats: [5, 6, 7],
});
