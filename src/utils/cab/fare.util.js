import { CAB_GST_PERCENT } from "../constants/cab.enums.js";

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

/**
 * Calculate coupon discount against cab base fare.
 * Mirrors selfDrive fareBreakdown.util.js logic.
 */
export const calculateCabCouponDiscount = (coupon, baseAmount) => {
  if (!coupon) return 0;

  const rawDiscount = roundMoney(
    (baseAmount * Number(coupon.discount_percent)) / 100
  );

  if (coupon.max_discount_amount !== null && coupon.max_discount_amount !== undefined) {
    return Math.min(rawDiscount, Number(coupon.max_discount_amount));
  }

  return rawDiscount;
};

/**
 * Build fare breakdown for One Way / Round Trip cabs.
 *
 * Pricing logic:
 *   base_fare covers base_km
 *   extra_km  = max(0, distanceKm - base_km)
 *   km_charge = extra_km * per_km_charge
 *   trip_fare = base_fare + km_charge + driver_allowance
 *   gst       = 5% on (trip_fare - coupon_discount)
 *   total     = trip_fare - coupon_discount + gst
 */
export const buildOneWayRoundTripFare = ({
  fareSlab,
  distanceKm,
  tripType,
  coupon = null,
}) => {
  const {
    base_km,
    base_fare,
    per_km_charge,
    driver_allowance,
  } = fareSlab;

  const distKm = Number(distanceKm ?? 0);
  const baseFare = roundMoney(Number(base_fare));
  const baseKm = Number(base_km ?? 0);
  const perKm = roundMoney(Number(per_km_charge ?? 0));
  const driverAllowance = roundMoney(Number(driver_allowance ?? 0));

  const extraKm = Math.max(0, distKm - baseKm);
  const extraKmCharge = roundMoney(extraKm * perKm);

  const tripFareBeforeDriver = roundMoney(baseFare + extraKmCharge);
  const tripFare = roundMoney(tripFareBeforeDriver + driverAllowance);

  const discountAmount = calculateCabCouponDiscount(coupon, tripFare);
  const gstBase = roundMoney(tripFare - discountAmount);
  const gstAmount = roundMoney((gstBase * CAB_GST_PERCENT) / 100);
  const totalAmount = roundMoney(gstBase + gstAmount);

  return {
    trip_type: tripType,
    distance_km: distKm,
    base_km: baseKm,
    base_fare: baseFare,
    extra_km: extraKm,
    extra_km_charge: extraKmCharge,
    driver_allowance: driverAllowance,
    trip_fare: tripFare,
    gst_percent: CAB_GST_PERCENT,
    gst_amount: gstAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    payable_amount: totalAmount,
    per_km_charge: perKm,
    fare_includes: buildFareIncludesList(fareSlab, distKm),
    coupon: coupon
      ? {
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          discount_percent: Number(coupon.discount_percent),
          max_discount_amount:
            coupon.max_discount_amount !== null
              ? Number(coupon.max_discount_amount)
              : null,
        }
      : null,
  };
};

/**
 * Build fare breakdown for Local/Rental cabs (package-based flat rate).
 *
 * Pricing logic:
 *   base_fare = flat rate from fare slab (admin-set per package + car type)
 *   trip_fare = base_fare + driver_allowance
 *   gst       = 5% on (trip_fare - coupon_discount)
 *   total     = trip_fare - coupon_discount + gst
 */
export const buildLocalCabFare = ({
  fareSlab,
  pkg,
  coupon = null,
}) => {
  const {
    base_fare,
    driver_allowance,
    per_km_charge,
    base_km,
  } = fareSlab;

  const baseFare = roundMoney(Number(base_fare));
  const driverAllowance = roundMoney(Number(driver_allowance ?? 0));
  const perKm = roundMoney(Number(per_km_charge ?? 0));

  const tripFare = roundMoney(baseFare + driverAllowance);

  const discountAmount = calculateCabCouponDiscount(coupon, tripFare);
  const gstBase = roundMoney(tripFare - discountAmount);
  const gstAmount = roundMoney((gstBase * CAB_GST_PERCENT) / 100);
  const totalAmount = roundMoney(gstBase + gstAmount);

  return {
    trip_type: "local",
    package: pkg
      ? {
          id: pkg.id,
          label: pkg.label,
          duration_hours: pkg.duration_hours,
          included_km: pkg.included_km,
        }
      : null,
    base_km: Number(base_km ?? 0),
    base_fare: baseFare,
    driver_allowance: driverAllowance,
    trip_fare: tripFare,
    gst_percent: CAB_GST_PERCENT,
    gst_amount: gstAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    payable_amount: totalAmount,
    per_km_charge: perKm,
    fare_includes: buildLocalFareIncludesList(fareSlab, pkg),
    coupon: coupon
      ? {
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          discount_percent: Number(coupon.discount_percent),
          max_discount_amount:
            coupon.max_discount_amount !== null
              ? Number(coupon.max_discount_amount)
              : null,
        }
      : null,
  };
};

/**
 * Build a display list of what's included/excluded in the fare.
 * Matches the "Fare includes" section in the SS (car detail page).
 */
export const buildFareIncludesList = (fareSlab, distanceKm) => {
  const includes = [
    { label: "Driver charges", value: "Included" },
    { label: "Fuel", value: "Included" },
  ];

  const baseKm = Number(fareSlab.base_km ?? 0);
  const perKm = Number(fareSlab.per_km_charge ?? 0);

  if (baseKm > 0) {
    includes.push({
      label: `${baseKm} km`,
      value: perKm > 0 ? `Then ₹${perKm}/km` : "Included",
    });
  }

  includes.push({ label: "Toll & parking", value: "At actuals" });
  includes.push({ label: "State tax", value: "Included" });

  return includes;
};

export const buildLocalFareIncludesList = (fareSlab, pkg) => {
  const includes = [
    { label: "Driver charges", value: "Included" },
    { label: "Fuel", value: "Included" },
  ];

  if (pkg) {
    const perKm = Number(fareSlab.per_km_charge ?? 0);
    includes.push({
      label: `${pkg.included_km} km included`,
      value: perKm > 0 ? `Then ₹${perKm}/km` : "Included",
    });
    includes.push({
      label: `${pkg.duration_hours} hour(s) duration`,
      value: "Included",
    });
  }

  includes.push({ label: "Toll & parking", value: "At actuals" });

  return includes;
};

/**
 * Strip internal fields before sending to client.
 */
export const fareBreakdownForClient = (fareBreakdown) => {
  const { coupon: _coupon, ...rest } = fareBreakdown;
  return rest;
};
