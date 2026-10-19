import * as cabRepository from "../../repositories/admin/cab.repository.js";
import * as carRepository from "../../repositories/admin/car.repository.js";
import * as cityRepository from "../../repositories/admin/city.repository.js";
import ApiError from "../../utils/ApiError.js";
import { CAB_TRIP_TYPES } from "../../utils/constants/cab.enums.js";

// ─── Formatters ────────────────────────────────────────────────────────────

const formatSlab = (slab) => ({
  id: slab.id,
  car: slab.car
    ? {
        id: slab.car.id,
        car_name: slab.car.car_name,
        seats: slab.car.seats,
        city: slab.car.city
          ? { id: slab.car.city.id, name: slab.car.city.name }
          : null,
      }
    : null,
  trip_type: slab.trip_type,
  package: slab.package
    ? {
        id: slab.package.id,
        label: slab.package.label,
        duration_hours: slab.package.duration_hours,
        included_km: slab.package.included_km,
      }
    : null,
  base_km: Number(slab.base_km),
  base_fare: Number(slab.base_fare),
  per_km_charge: Number(slab.per_km_charge),
  driver_allowance: Number(slab.driver_allowance),
  status: slab.status,
  status_label: slab.status === 1 ? "Active" : "Inactive",
  created_at: slab.created_at,
  updated_at: slab.updated_at,
});

const formatPackage = (pkg) => ({
  id: pkg.id,
  city: pkg.city
    ? { id: pkg.city.id, name: pkg.city.name, short_name: pkg.city.short_name }
    : null,
  duration_hours: pkg.duration_hours,
  included_km: pkg.included_km,
  label: pkg.label,
  sort_order: pkg.sort_order,
  status: pkg.status,
  status_label: pkg.status === 1 ? "Active" : "Inactive",
  created_at: pkg.created_at,
});

// ─── Dashboard ─────────────────────────────────────────────────────────────

/**
 * GET /admin/cab/dashboard
 * Returns stats + car-wise availability table.
 */
export const getCabDashboard = async (query) => {
  const [stats, availability] = await Promise.all([
    cabRepository.getCabDashboardStats(),
    cabRepository.findCarsWithCabStatus({
      page: query.page,
      limit: query.limit,
      search: query.search,
      cityId: query.city_id,
    }),
  ]);

  return {
    stats,
    cab_availability: availability.rows,
    count: availability.count,
    pagination: availability.pagination,
  };
};

// ─── Cab Pricing ───────────────────────────────────────────────────────────

/**
 * GET /admin/cab/pricing
 * Paginated list of all fare slabs (Cab Pricing table).
 */
export const listCabPricings = async (query) => {
  const result = await cabRepository.findAllCabPricings({
    page: query.page,
    limit: query.limit,
    carId: query.car_id,
    tripType: query.trip_type,
    status: query.status !== undefined ? Number(query.status) : undefined,
  });

  return {
    rows: result.rows.map(formatSlab),
    count: result.count,
    pagination: result.pagination,
  };
};

/**
 * POST /admin/cab/pricing
 * Create a new fare slab entry ("Add Pricing" form).
 */
export const createCabPricing = async (payload) => {
  // Validate car exists and is active
  const car = await carRepository.findById(payload.car_id);
  if (!car || car.status !== 1) {
    throw new ApiError(404, "Car not found or inactive");
  }

  // Validate trip_type
  if (!Object.values(CAB_TRIP_TYPES).includes(payload.trip_type)) {
    throw new ApiError(400, "Invalid trip type");
  }

  // Validate package_id required for local
  if (payload.trip_type === CAB_TRIP_TYPES.LOCAL && !payload.package_id) {
    throw new ApiError(400, "package_id is required for local trip type");
  }

  // Check for duplicate active slab (same car + trip_type + package_id)
  const existing = await cabRepository.findCabPricingByCarAndTripType(
    payload.car_id,
    payload.trip_type,
    payload.package_id ?? null
  );
  if (existing) {
    throw new ApiError(
      409,
      "An active pricing slab already exists for this car and trip type"
    );
  }

  const slab = await cabRepository.createCabPricing({
    car_id: payload.car_id,
    trip_type: payload.trip_type,
    package_id: payload.package_id ?? null,
    base_km: payload.base_km ?? 0,
    base_fare: payload.base_fare,
    per_km_charge: payload.per_km_charge ?? 0,
    driver_allowance: payload.driver_allowance ?? 0,
    status: 1,
  });

  const full = await cabRepository.findCabPricingById(slab.id);
  return formatSlab(full);
};

/**
 * PUT /admin/cab/pricing/:id
 * Update fare fields of an existing slab.
 */
export const updateCabPricing = async (id, payload) => {
  const slab = await cabRepository.findCabPricingById(id);
  if (!slab) {
    throw new ApiError(404, "Cab pricing not found");
  }

  const updateData = {};
  if (payload.base_km !== undefined) updateData.base_km = payload.base_km;
  if (payload.base_fare !== undefined) updateData.base_fare = payload.base_fare;
  if (payload.per_km_charge !== undefined) updateData.per_km_charge = payload.per_km_charge;
  if (payload.driver_allowance !== undefined) updateData.driver_allowance = payload.driver_allowance;

  await cabRepository.updateCabPricing(id, updateData);
  const updated = await cabRepository.findCabPricingById(id);
  return formatSlab(updated);
};

/**
 * PATCH /admin/cab/pricing/:id/status
 * Disable (2) or Enable (1) a fare slab — "Disable" button in admin UI.
 */
export const updateCabPricingStatus = async (id, status) => {
  if (![1, 2].includes(Number(status))) {
    throw new ApiError(400, "Invalid status. Use 1 for active or 2 for inactive");
  }

  const slab = await cabRepository.findCabPricingById(id);
  if (!slab) {
    throw new ApiError(404, "Cab pricing not found");
  }

  if (slab.status === Number(status)) {
    throw new ApiError(
      400,
      status === 2 ? "Pricing is already disabled" : "Pricing is already active"
    );
  }

  await cabRepository.updateCabPricingStatus(id, Number(status));
  const updated = await cabRepository.findCabPricingById(id);
  return {
    slab: formatSlab(updated),
    message: status === 2 ? "Pricing disabled successfully" : "Pricing enabled successfully",
  };
};

/**
 * DELETE /admin/cab/pricing/:id
 * Hard delete a fare slab — "Delete" button in admin UI.
 */
export const deleteCabPricing = async (id) => {
  const slab = await cabRepository.findCabPricingById(id);
  if (!slab) {
    throw new ApiError(404, "Cab pricing not found");
  }

  await cabRepository.deleteCabPricing(id);
  return { message: "Pricing deleted successfully" };
};

/**
 * GET /admin/cab/cars
 * "Select Car" dropdown for the pricing form.
 */
export const listCarsForDropdown = async () => {
  const cars = await cabRepository.findActiveCarsForDropdown();
  return cars.map((car) => ({
    id: car.id,
    car_name: car.car_name,
    seats: car.seats,
    city: car.city
      ? { id: car.city.id, name: car.city.name, short_name: car.city.short_name }
      : null,
  }));
};

// ─── Cab Packages ─────────────────────────────────────────────────────────

/**
 * GET /admin/cab/packages
 * List all cab packages (Local trip type).
 */
export const listCabPackages = async (query) => {
  const result = await cabRepository.findAllCabPackages({
    page: query.page,
    limit: query.limit,
    cityId: query.city_id,
    status: query.status !== undefined ? Number(query.status) : undefined,
  });

  return {
    rows: result.rows.map(formatPackage),
    count: result.count,
    pagination: result.pagination,
  };
};

/**
 * POST /admin/cab/packages
 * Create a new local package (e.g. "1 Hour · 10 km").
 */
export const createCabPackage = async (payload) => {
  const city = await cityRepository.findActiveById(payload.city_id);
  if (!city) {
    throw new ApiError(404, "City not found or inactive");
  }

  const autoLabel =
    payload.label?.trim() ||
    `${payload.duration_hours} Hour${payload.duration_hours > 1 ? "s" : ""} · ${payload.included_km} km`;

  const pkg = await cabRepository.createCabPackage({
    city_id: payload.city_id,
    duration_hours: payload.duration_hours,
    included_km: payload.included_km,
    label: autoLabel,
    sort_order: payload.sort_order ?? 0,
    status: 1,
  });

  const full = await cabRepository.findCabPackageById(pkg.id);
  return formatPackage(full);
};

/**
 * PUT /admin/cab/packages/:id
 * Update a local package.
 */
export const updateCabPackage = async (id, payload) => {
  const pkg = await cabRepository.findCabPackageById(id);
  if (!pkg) {
    throw new ApiError(404, "Cab package not found");
  }

  const updateData = {};
  if (payload.duration_hours !== undefined) updateData.duration_hours = payload.duration_hours;
  if (payload.included_km !== undefined) updateData.included_km = payload.included_km;
  if (payload.label !== undefined) updateData.label = payload.label.trim();
  if (payload.sort_order !== undefined) updateData.sort_order = payload.sort_order;

  await cabRepository.updateCabPackage(id, updateData);
  const updated = await cabRepository.findCabPackageById(id);
  return formatPackage(updated);
};

/**
 * PATCH /admin/cab/packages/:id/status
 * Enable / Disable a local package.
 */
export const updateCabPackageStatus = async (id, status) => {
  if (![1, 2].includes(Number(status))) {
    throw new ApiError(400, "Invalid status. Use 1 for active or 2 for inactive");
  }

  const pkg = await cabRepository.findCabPackageById(id);
  if (!pkg) {
    throw new ApiError(404, "Cab package not found");
  }

  await cabRepository.updateCabPackageStatus(id, Number(status));
  const updated = await cabRepository.findCabPackageById(id);
  return {
    package: formatPackage(updated),
    message: status === 2 ? "Package disabled successfully" : "Package enabled successfully",
  };
};
