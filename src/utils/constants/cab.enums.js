export const CAB_TRIP_TYPES = {
  ONE_WAY: "one_way",
  ROUND_TRIP: "round_trip",
  LOCAL: "local",
  AIRPORT: "airport",
};

export const CAB_TRIP_TYPE_LIST = Object.values(CAB_TRIP_TYPES);

export const CAB_ACTIVE_TRIP_TYPES = [
  CAB_TRIP_TYPES.ONE_WAY,
  CAB_TRIP_TYPES.ROUND_TRIP,
  CAB_TRIP_TYPES.LOCAL,
];

/** GST percent applied to cab fares (same as self-drive) */
export const CAB_GST_PERCENT = 5;
