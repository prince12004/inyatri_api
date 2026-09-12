import * as cityRepository from "../../repositories/user/city.repository.js";
import * as selfDriveRepository from "../../repositories/user/selfDrive.repository.js";
import ApiError from "../../utils/ApiError.js";
import { buildFarePreview } from "../../utils/selfDrive/fare.util.js";
import {
  getEffectivePricePerDay,
  resolveBrowseMode,
  resolveRentalMode,
} from "../../utils/selfDrive/rental.util.js";

const formatCity = (city) => ({
  id: city.id,
  short_name: city.short_name,
  name: city.name,
  address: city.address,
  image: city.image,
});

const formatCarListItem = (car, rentalDays, isEstimated) => {
  const pricePerDay = getEffectivePricePerDay(car);

  return {
    id: car.id,
    car_name: car.car_name,
    model: car.model,
    made_year: car.made_year,
    vehicle_number: car.vehicle_number,
    transmission: car.transmission,
    seats: car.seats,
    fuel_type: car.fuel_type,
    mileage: car.mileage,
    main_image: car.main_image,
    location: car.location,
    price_per_day: pricePerDay,
    rental_days: rentalDays,
    rental_total: pricePerDay
      ? Math.round(rentalDays * pricePerDay * 100) / 100
      : null,
    is_estimated: isEstimated,
    brand: car.brand
      ? { id: car.brand.id, brand_name: car.brand.brand_name }
      : null,
    city: car.city
      ? { id: car.city.id, short_name: car.city.short_name, name: car.city.name }
      : null,
    car_type: car.carType
      ? { id: car.carType.id, type_name: car.carType.type_name }
      : null,
    features: (car.features ?? []).map((feature) => ({
      id: feature.id,
      name: feature.name,
    })),
    show_on_top: Boolean(car.show_on_top),
  };
};

const formatCarDetail = (car, rentalDays, isEstimated) => ({
  id: car.id,
  car_name: car.car_name,
  model: car.model,
  made_year: car.made_year,
  version: car.version,
  vehicle_number: car.vehicle_number,
  transmission: car.transmission,
  seats: car.seats,
  fuel_type: car.fuel_type,
  mileage: car.mileage,
  horsepower: car.horsepower,
  car_condition: car.car_condition,
  travelled_km: car.travelled_km,
  short_description: car.short_description,
  main_image: car.main_image,
  location: car.location,
  latitude: car.latitude,
  longitude: car.longitude,
  home_delivery_available: Boolean(car.home_delivery_available),
  home_delivery_charge: Number(car.home_delivery_charge ?? 0),
  brand: car.brand
    ? { id: car.brand.id, brand_name: car.brand.brand_name }
    : null,
  city: car.city ? formatCity(car.city) : null,
  car_type: car.carType
    ? { id: car.carType.id, type_name: car.carType.type_name }
    : null,
  features: (car.features ?? []).map((feature) => ({
    id: feature.id,
    name: feature.name,
  })),
  additional_images: (car.additionalImages ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      image_url: image.image_url,
      sort_order: image.sort_order,
    })),
  specifications: {
    seats: car.seats,
    transmission: car.transmission,
    fuel_type: car.fuel_type,
    mileage: car.mileage,
    travelling_allowed_per_day: car.travelling_allowed_per_day,
    extra_charge_per_km: Number(car.extra_charge_per_km ?? 0),
  },
  fare_preview: buildFarePreview(car, rentalDays, { isEstimated }),
});

const resolveCityScope = async (cityId) => {
  if (!cityId) {
    return null;
  }

  const city = await cityRepository.findActiveCityById(cityId);
  if (!city) {
    throw new ApiError(404, "City not found or inactive");
  }

  return formatCity(city);
};

const buildFindCarsContext = async ({ city_id, pickup_at, drop_at }) => {
  const rental = resolveRentalMode({ city_id, pickup_at, drop_at });
  const city = await resolveCityScope(rental.city_id);
  const categories = await selfDriveRepository.findCategoriesWithStartingPrice(
    rental.city_id
  );
  const totalCars = await selfDriveRepository.countPricedCars(rental.city_id);

  return {
    mode: rental.mode,
    city,
    pickup_at: rental.pickup_at,
    drop_at: rental.drop_at,
    rental_days: rental.rental_days,
    is_estimated: rental.is_estimated,
    total_available_cars: totalCars,
    categories,
  };
};

const assertCategoryAvailable = async (carTypeId, cityId = null) => {
  const count = await selfDriveRepository.categoryHasCars(carTypeId, cityId);
  if (!count) {
    throw new ApiError(404, "Category not available");
  }
};

export const listCities = async (query) =>
  cityRepository.findActiveCities({
    page: query.page,
    limit: query.limit,
  });

/** Mode B — Find cars button */
export const searchSelfDrive = async (payload) => buildFindCarsContext(payload);

/** Mode A — Browse by category (city optional) */
export const listCategories = async (query) => {
  const browse = resolveBrowseMode(query);
  const city = await resolveCityScope(browse.city_id);
  const categories = await selfDriveRepository.findCategoriesWithStartingPrice(
    browse.city_id
  );
  const totalCars = await selfDriveRepository.countPricedCars(browse.city_id);

  return {
    mode: browse.mode,
    city,
    rental_days: browse.rental_days,
    is_estimated: browse.is_estimated,
    total_available_cars: totalCars,
    categories,
  };
};

/** Mode A or B depending on query params */
export const listCars = async (query) => {
  const rental = resolveRentalMode(query);
  const city = rental.city_id ? await resolveCityScope(rental.city_id) : null;

  if (query.car_type_id) {
    await assertCategoryAvailable(query.car_type_id, rental.city_id);
  }

  const result = await selfDriveRepository.findAvailableCars({
    cityId: rental.city_id,
    carTypeId: query.car_type_id,
    transmission: query.transmission,
    fuelType: query.fuel_type,
    page: query.page,
    limit: query.limit,
  });

  return {
    mode: rental.mode,
    city,
    pickup_at: rental.pickup_at,
    drop_at: rental.drop_at,
    rental_days: rental.rental_days,
    is_estimated: rental.is_estimated,
    rows: result.rows.map((car) =>
      formatCarListItem(car, rental.rental_days, rental.is_estimated)
    ),
    count: result.count,
    pagination: result.pagination,
  };
};

export const getCarById = async (carId, query) => {
  const rental = resolveRentalMode(query);

  if (rental.city_id) {
    await resolveCityScope(rental.city_id);
  }

  const car = await selfDriveRepository.findAvailableCarById(
    carId,
    rental.mode === "find" ? rental.city_id : null
  );

  if (!car) {
    throw new ApiError(404, "Car not found or unavailable");
  }

  return formatCarDetail(car, rental.rental_days, rental.is_estimated);
};
