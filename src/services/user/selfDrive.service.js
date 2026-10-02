import * as cityRepository from "../../repositories/user/city.repository.js";
import * as selfDriveRepository from "../../repositories/user/selfDrive.repository.js";
import ApiError from "../../utils/ApiError.js";
import {
  buildFarePreview,
  buildMonthlyPlansPreview,
  resolveMonthlyDiscountPercent,
} from "../../utils/selfDrive/fare.util.js";
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

const formatCarListItem = (
  car,
  rentalDays,
  isEstimated,
  rentalType = "rental"
) => {
  const pricePerDay = getEffectivePricePerDay(car);
  const isMonthly = rentalType === "monthly";
  const discountPercent = isMonthly
    ? resolveMonthlyDiscountPercent(car, rentalDays)
    : 0;

  const baseRentalTotal = pricePerDay
    ? Math.round(rentalDays * pricePerDay * 100) / 100
    : null;
  const discountAmount =
    isMonthly && baseRentalTotal
      ? Math.round(((baseRentalTotal * discountPercent) / 100) * 100) / 100
      : 0;
  const effectiveRentalTotal =
    baseRentalTotal !== null
      ? Math.round((baseRentalTotal - discountAmount) * 100) / 100
      : null;

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
    rental_type: rentalType,
    price_per_day: pricePerDay,
    rental_days: rentalDays,
    rental_total: effectiveRentalTotal,
    base_rental_total: baseRentalTotal,
    discount_amount: discountAmount,
    discount_percent: discountPercent,
    discount_badge: isMonthly && discountPercent > 0 ? `${discountPercent}% off` : null,
    enable_monthly_subscription: Boolean(car.enable_monthly_subscription),
    monthly_discounts: {
      discount_15_days: Number(car.discount_15_days ?? 0),
      discount_1_month: Number(car.discount_1_month ?? 0),
      discount_3_months: Number(car.discount_3_months ?? 0),
      discount_6_months: Number(car.discount_6_months ?? 0),
    },
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

const formatCarDetail = (
  car,
  rentalDays,
  isEstimated,
  rentalType = "rental",
  planType = null
) => {
  const isMonthly = rentalType === "monthly";

  return {
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
    enable_monthly_subscription: Boolean(car.enable_monthly_subscription),
    monthly_discounts: {
      discount_15_days: Number(car.discount_15_days ?? 0),
      discount_1_month: Number(car.discount_1_month ?? 0),
      discount_3_months: Number(car.discount_3_months ?? 0),
      discount_6_months: Number(car.discount_6_months ?? 0),
    },
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
    subscription_plans: isMonthly ? buildMonthlyPlansPreview(car) : null,
    fare_preview: buildFarePreview(car, rentalDays, {
      isEstimated,
      rentalType,
      planType,
    }),
  };
};

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

const buildFindCarsContext = async (payload) => {
  const rental = resolveRentalMode(payload);
  const isMonthly = rental.rental_type === "monthly";
  const city = await resolveCityScope(rental.city_id);
  const categories = await selfDriveRepository.findCategoriesWithStartingPrice(
    rental.city_id,
    isMonthly
  );
  const totalCars = await selfDriveRepository.countPricedCars(
    rental.city_id,
    isMonthly
  );

  return {
    rental_type: rental.rental_type,
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

const assertCategoryAvailable = async (carTypeId, cityId = null, isMonthly = false) => {
  const count = await selfDriveRepository.categoryHasCars(carTypeId, cityId, isMonthly);
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
  const isMonthly = browse.rental_type === "monthly";
  const city = await resolveCityScope(browse.city_id);
  const categories = await selfDriveRepository.findCategoriesWithStartingPrice(
    browse.city_id,
    isMonthly
  );
  const totalCars = await selfDriveRepository.countPricedCars(
    browse.city_id,
    isMonthly
  );

  
  return {
    rental_type: browse.rental_type,
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
  const isMonthly = rental.rental_type === "monthly";
  const city = rental.city_id ? await resolveCityScope(rental.city_id) : null;

  if (query.car_type_id) {
    await assertCategoryAvailable(query.car_type_id, rental.city_id, isMonthly);
  }

  const result = await selfDriveRepository.findAvailableCars({
    cityId: rental.city_id,
    carTypeId: query.car_type_id,
    transmission: query.transmission,
    fuelType: query.fuel_type,
    isMonthly,
    page: query.page,
    limit: query.limit,
  });

  return {
    rental_type: rental.rental_type,
    mode: rental.mode,
    city,
    pickup_at: rental.pickup_at,
    drop_at: rental.drop_at,
    rental_days: rental.rental_days,
    is_estimated: rental.is_estimated,
    rows: result.rows.map((car) =>
      formatCarListItem(car, rental.rental_days, rental.is_estimated, rental.rental_type)
    ),
    count: result.count,
    pagination: result.pagination,
  };
};

export const getCarById = async (carId, query) => {
  const rental = resolveRentalMode(query);
  const isMonthly = rental.rental_type === "monthly";

  if (rental.city_id) {
    await resolveCityScope(rental.city_id);
  }

  const car = await selfDriveRepository.findAvailableCarById(
    carId,
    rental.mode === "find" ? rental.city_id : null,
    isMonthly
  );

  if (!car) {
    throw new ApiError(404, "Car not found or unavailable");
  }

  if (isMonthly && !car.enable_monthly_subscription) {
    throw new ApiError(400, "This car is not available for monthly subscription");
  }

  return formatCarDetail(
    car,
    rental.rental_days,
    rental.is_estimated,
    rental.rental_type,
    query.plan_type
  );
};
