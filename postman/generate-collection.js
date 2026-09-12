import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const successExample = (message, data, statusCode = 200, pagination = null) => {
  const body = {
    code: statusCode,
    status: true,
    message,
    data,
  };
  if (pagination) body.pagination = pagination;
  return {
    name: "Success",
    status: statusCode === 201 ? "Created" : "OK",
    code: statusCode,
    _postman_previewlanguage: "json",
    header: [{ key: "Content-Type", value: "application/json" }],
    body: JSON.stringify(body, null, 2),
  };
};

const jsonBody = (payload) => ({
  mode: "raw",
  raw: JSON.stringify(payload, null, 2),
  options: { raw: { language: "json" } },
});

const authHeader = (tokenVar) => ({
  key: "Authorization",
  value: `Bearer {{${tokenVar}}}`,
});

const queryParam = (key, value, description = "", disabled = false) => ({
  key,
  value: String(value),
  ...(description ? { description } : {}),
  ...(disabled ? { disabled: true } : {}),
});

const pathVariable = (key, value, description = "") => ({
  key,
  value: String(value),
  ...(description ? { description } : {}),
});

const buildUrl = (routePath, { queryParams = [], pathVariables = [] } = {}) => {
  const activeQuery = queryParams.filter((p) => !p.disabled);
  const queryString = activeQuery.length
    ? `?${activeQuery.map((p) => `${p.key}=${p.value}`).join("&")}`
    : "";
  const urlObj = {
    raw: `{{baseUrl}}${routePath}${queryString}`,
    host: ["{{baseUrl}}"],
    path: routePath.replace(/^\//, "").split("/"),
  };
  if (queryParams.length) {
    urlObj.query = queryParams.map(({ key, value, description, disabled }) => ({
      key,
      value: String(value),
      ...(description ? { description } : {}),
      disabled: !!disabled,
    }));
  }
  if (pathVariables.length) {
    urlObj.variable = pathVariables;
  }
  return urlObj;
};

const folder = (name, items, description = "") => ({
  name,
  ...(description ? { description } : {}),
  item: items,
});

const paginationParams = (defaultLimit = "20", max = "50") => [
  queryParam("page", "1", "Page number (default 1)."),
  queryParam("limit", defaultLimit, `Items per page (max ${max}).`),
];

const adminListParams = [
  ...paginationParams("20", "100"),
  queryParam("search", "", "Optional text search.", true),
  queryParam("status", "1", "Filter: 1=active, 2=inactive."),
];

const modeABrowseCategoriesParams = [
  queryParam(
    "city_id",
    "{{city_id}}",
    "Optional. Filter by city; omit for all cities with 1-day estimate.",
    true
  ),
];

const modeABrowseCategoriesByCityParams = [
  queryParam("city_id", "{{city_id}}", "City ID. Narrows category pricing to this city."),
];

const modeAListCarsParams = [
  queryParam("car_type_id", "{{car_type_id}}", "Optional. Car type ID (e.g. 1=Hatchback)."),
  queryParam("city_id", "{{city_id}}", "Optional. Filter cars in this city.", true),
  queryParam("transmission", "manual", "Optional: manual | automatic.", true),
  queryParam("fuel_type", "petrol", "Optional: petrol | diesel | cng.", true),
  ...paginationParams(),
];

const modeAListCarsByCityParams = [
  queryParam("city_id", "{{city_id}}", "City ID."),
  queryParam("car_type_id", "{{car_type_id}}", "Optional. Car type ID."),
  queryParam("transmission", "manual", "Optional: manual | automatic.", true),
  queryParam("fuel_type", "petrol", "Optional: petrol | diesel | cng.", true),
  ...paginationParams(),
];

const modeBFindQueryParams = [
  queryParam("city_id", "{{city_id}}", "Required with pickup_at and drop_at."),
  queryParam("pickup_at", "{{pickup_at}}", "ISO 8601 rental start."),
  queryParam("drop_at", "{{drop_at}}", "ISO 8601 rental end. Must be after pickup_at."),
];

const modeBListCarsParams = [
  ...modeBFindQueryParams,
  queryParam("car_type_id", "{{car_type_id}}", "Optional. Car type ID."),
  queryParam("transmission", "manual", "Optional: manual | automatic.", true),
  queryParam("fuel_type", "petrol", "Optional: petrol | diesel | cng.", true),
  ...paginationParams(),
];

const modeACarDetailParams = [
  queryParam("city_id", "{{city_id}}", "Optional fare-preview context.", true),
  queryParam(
    "pickup_at",
    "{{pickup_at}}",
    "Do not send unless drop_at and city_id are also sent.",
    true
  ),
  queryParam(
    "drop_at",
    "{{drop_at}}",
    "Do not send unless pickup_at and city_id are also sent.",
    true
  ),
];

const availableCouponsParams = [
  queryParam("car_id", "{{car_id}}", "Required. Car being booked."),
  queryParam("city_id", "{{city_id}}", "Required. Pickup city."),
  queryParam("pickup_at", "{{pickup_at}}", "Required. ISO 8601 rental start."),
  queryParam("drop_at", "{{drop_at}}", "Required. ISO 8601 rental end."),
  queryParam("insurance_selected", "true", "Optional. true | false."),
  queryParam("home_delivery_selected", "false", "Optional. true | false.", true),
];

const listBookingsParams = [
  ...paginationParams(),
  queryParam(
    "booking_status",
    "5",
    "Optional. 1=pending_payment, 2=payment_processing, 3=payment_failed, 4=payment_cancelled, 5=confirmed, 6=cancelled.",
    true
  ),
];

const request = (name, method, routePath, options = {}) => {
  const headers = [{ key: "Content-Type", value: "application/json" }];
  if (options.auth) headers.push(authHeader(options.auth));
  if (options.multipart) headers.length = 0;

  const item = {
    name,
    ...(options.description ? { description: options.description } : {}),
    request: {
      method,
      header: headers,
      url: buildUrl(routePath, {
        queryParams: options.queryParams || [],
        pathVariables: options.pathVariables || [],
      }),
    },
    response: [
      successExample(
        options.successMessage,
        options.successData,
        options.statusCode || 200,
        options.pagination
      ),
    ],
  };

  if (options.body) {
    item.request.body = jsonBody(options.body);
  }

  if (options.formdata) {
    item.request.body = { mode: "formdata", formdata: options.formdata };
    if (options.auth) {
      item.request.header = [authHeader(options.auth)];
    }
  }

  if (options.testScript) {
    item.event = [
      {
        listen: "test",
        script: {
          type: "text/javascript",
          exec: options.testScript,
        },
      },
    ];
  }

  return item;
};

const masterCrudFolder = (config) => {
  const {
    folderName,
    basePath,
    sampleRow,
    listMessage,
    createMessage,
    updateMessage,
    deleteMessage,
    createRequestName,
  } = config;

  const listData = [sampleRow];
  const singular = folderName.replace(/s$/, "");

  return folder(folderName, [
    request(`List ${folderName}`, "GET", basePath, {
      auth: "admin_token",
      queryParams: adminListParams,
      successMessage: listMessage,
      successData: listData,
      pagination: {
        totalItems: 1,
        currentPage: 1,
        totalPages: 1,
        limit: 20,
      },
    }),
    request(createRequestName || `Create ${singular}`, "POST", basePath, {
      auth: "admin_token",
      body: sampleRow.createBody,
      successMessage: createMessage,
      successData: sampleRow,
      statusCode: 201,
    }),
    request(`Update ${singular}`, "PUT", `${basePath}/:id`, {
      auth: "admin_token",
      pathVariables: [pathVariable("id", "1", `${singular} ID.`)],
      body: sampleRow.updateBody,
      successMessage: updateMessage,
      successData: { ...sampleRow, ...sampleRow.updateBody },
    }),
    request(`Deactivate ${singular}`, "DELETE", `${basePath}/:id`, {
      auth: "admin_token",
      pathVariables: [pathVariable("id", "1", `${singular} ID.`)],
      successMessage: deleteMessage,
      successData: { ...sampleRow, status: 2 },
    }),
  ]);
};

const bookingPayload = {
  car_id: 1,
  city_id: 1,
  pickup_at: "2026-05-28T04:30:00.000Z",
  drop_at: "2026-05-30T14:30:00.000Z",
  pickup_location: "HSR Layout, Sector 2",
  drop_location: "HSR Layout, Sector 2",
  insurance_selected: true,
  home_delivery_selected: false,
  coupon_code: "WKND25",
};

const couponSample = {
  id: 1,
  code: "WKND25",
  title: "Flat 25% off weekend rentals",
  description: "Max ₹600 · valid till 30 May",
  discount_percent: 25,
  max_discount_amount: 600,
  min_base_rental_amount: 2000,
  valid_from: "2026-05-01T00:00:00.000Z",
  valid_to: "2026-05-30T23:59:59.000Z",
  usage_limit: 1000,
  used_count: 0,
  status: 1,
};

const cloudinaryMainImage =
  "https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374717/inyatri/cars/j5gotdib5ev7l9fmnasi.jpg";
const cloudinaryAdditionalImages = [
  "https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/k7wrp1ducfutuiwv5vsm.jpg",
  "https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/iroii5rueeskaiknfjqz.jpg",
  "https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/wbgv9lxg07bt9ncetrwd.jpg",
  "https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/gzyiyuznxw64om2byfjz.jpg",
];

const healthRequest = {
  name: "Health",
  request: {
    method: "GET",
    header: [],
    url: buildUrl("/health"),
  },
  response: [
    {
      name: "Success",
      status: "OK",
      code: 200,
      _postman_previewlanguage: "plain",
      header: [{ key: "Content-Type", value: "text/html; charset=utf-8" }],
      body: "Health Ok",
    },
  ],
};

const collection = {
  info: {
    _postman_id: "inyatri-api-collection",
    name: "INYATRI",
    description:
      "InYatri API collection. Set baseUrl (http://localhost:5000). Run Admin Login or Verify Otp for tokens. Self Drive: Mode A browse (optional city_id, 1-day estimate) vs Mode B find (city_id + pickup_at + drop_at).",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:5000" },
    { key: "admin_token", value: "" },
    { key: "user_token", value: "" },
    { key: "city_id", value: "1" },
    { key: "pickup_at", value: "2026-05-28T04:30:00.000Z" },
    { key: "drop_at", value: "2026-05-30T14:30:00.000Z" },
    { key: "car_id", value: "1" },
    { key: "car_type_id", value: "1" },
  ],
  item: [
    folder("User", [
      folder("Auth", [
        request("Send Otp", "POST", "/api/user/v1/auth/send-otp", {
          body: { country_code: "+91", mobile: "7535040111" },
          successMessage: "OTP sent successfully",
          successData: { isExistingUser: false, expiresIn: 60 },
        }),
        request("Verify Otp", "POST", "/api/user/v1/auth/verify-otp", {
          body: { country_code: "+91", mobile: "7535040111", otp: "123456" },
          successMessage: "OTP verified successfully",
          successData: {
            isNewUser: true,
            isExistingUser: false,
            requiresProfile: true,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
            user: {
              id: 1,
              mobile: "7535040111",
              country_code: "+91",
              full_name: "",
              requires_profile: true,
            },
          },
          testScript: [
            "const json = pm.response.json();",
            "if (json?.data?.token) {",
            "  pm.collectionVariables.set('user_token', json.data.token);",
            "}",
          ],
        }),
        request("Resend Otp", "POST", "/api/user/v1/auth/resend-otp", {
          body: { country_code: "+91", mobile: "7535040111" },
          successMessage: "OTP sent successfully",
          successData: { isExistingUser: false, expiresIn: 60 },
        }),
        request("Complete Profile", "POST", "/api/user/v1/auth/complete-profile", {
          auth: "user_token",
          body: {
            full_name: "John Doe",
            email: "john@example.com",
            dob: "1995-06-15",
            agreed_to_terms: true,
            marketing_opt_in: false,
          },
          successMessage: "Profile updated successfully",
          successData: {
            id: 1,
            mobile: "7535040111",
            full_name: "John Doe",
            email: "john@example.com",
            requires_profile: false,
          },
        }),
        request("Logout", "POST", "/api/user/v1/auth/logout", {
          auth: "user_token",
          successMessage: "Logged out successfully",
          successData: [],
        }),
      ]),
      folder(
        "Self Drive",
        [
          folder("Common", [
            request("List Cities", "GET", "/api/user/v1/self-drive/cities", {
              description:
                "List active cities for self-drive. Used before Mode A or Mode B flows.",
              queryParams: paginationParams("20", "100"),
              successMessage: "Cities fetched successfully",
              successData: [
                {
                  id: 1,
                  short_name: "BLR",
                  name: "Bengaluru",
                  address: "Bengaluru, Karnataka",
                  image: "https://example.com/bengaluru.jpg",
                },
              ],
              pagination: {
                totalItems: 1,
                currentPage: 1,
                totalPages: 1,
                limit: 20,
              },
            }),
          ]),
          folder(
            "Mode A - Browse",
            [
              request("List Categories (All)", "GET", "/api/user/v1/self-drive/categories", {
                description:
                  "Browse all car categories with 1-day estimated pricing. No dates required.",
                queryParams: modeABrowseCategoriesParams,
                successMessage: "Categories fetched successfully",
                successData: {
                  mode: "browse",
                  city: null,
                  rental_days: 1,
                  is_estimated: true,
                  total_available_cars: 5,
                  categories: [
                    {
                      car_type_id: 1,
                      name: "Hatchback",
                      starting_price_per_day: 1420,
                      rental_total_for_default_day: 1420,
                      cheapest_car_name: "Maruti Swift VXi",
                      cheapest_car_city: "Bengaluru",
                      available_cars_count: 2,
                      example_models: ["Swift", "Tiago", "Wagon-R"],
                    },
                  ],
                },
              }),
              request("List Categories (By City)", "GET", "/api/user/v1/self-drive/categories", {
                description:
                  "Browse categories for a specific city with 1-day estimated pricing.",
                queryParams: modeABrowseCategoriesByCityParams,
                successMessage: "Categories fetched successfully",
                successData: {
                  mode: "browse",
                  city: { id: 1, short_name: "BLR", name: "Bengaluru" },
                  rental_days: 1,
                  is_estimated: true,
                  total_available_cars: 3,
                  categories: [
                    {
                      car_type_id: 1,
                      name: "Hatchback",
                      starting_price_per_day: 1420,
                      rental_total_for_default_day: 1420,
                      cheapest_car_name: "Maruti Swift VXi",
                      cheapest_car_city: "Bengaluru",
                      available_cars_count: 2,
                      example_models: ["Swift", "Tiago"],
                    },
                  ],
                },
              }),
              request("List Cars (By Category)", "GET", "/api/user/v1/self-drive/cars", {
                description:
                  "Browse cars in a category with 1-day estimate. Do not send pickup_at/drop_at.",
                queryParams: modeAListCarsParams,
                successMessage: "Cars fetched successfully",
                successData: {
                  mode: "browse",
                  city: null,
                  pickup_at: null,
                  drop_at: null,
                  rental_days: 1,
                  is_estimated: true,
                  cars: [
                    {
                      id: 1,
                      car_name: "Maruti Swift VXi",
                      model: "Swift",
                      made_year: 2022,
                      transmission: "manual",
                      seats: 5,
                      fuel_type: "petrol",
                      price_per_day: 1420,
                      rental_days: 1,
                      rental_total: 1420,
                      is_estimated: true,
                      main_image: cloudinaryMainImage,
                      city: { id: 1, short_name: "BLR", name: "Bengaluru" },
                      car_type: { id: 1, type_name: "Hatchback" },
                    },
                  ],
                  pagination: {
                    totalItems: 1,
                    currentPage: 1,
                    totalPages: 1,
                    limit: 20,
                  },
                },
              }),
              request("List Cars (By City And Category)", "GET", "/api/user/v1/self-drive/cars", {
                description:
                  "Browse cars filtered by city and optional car type with 1-day estimate.",
                queryParams: modeAListCarsByCityParams,
                successMessage: "Cars fetched successfully",
                successData: {
                  mode: "browse",
                  city: { id: 1, short_name: "BLR", name: "Bengaluru" },
                  pickup_at: null,
                  drop_at: null,
                  rental_days: 1,
                  is_estimated: true,
                  cars: [
                    {
                      id: 1,
                      car_name: "Maruti Swift VXi",
                      model: "Swift",
                      made_year: 2022,
                      transmission: "manual",
                      seats: 5,
                      fuel_type: "petrol",
                      price_per_day: 1420,
                      rental_days: 1,
                      rental_total: 1420,
                      is_estimated: true,
                      main_image: cloudinaryMainImage,
                      city: { id: 1, short_name: "BLR", name: "Bengaluru" },
                      car_type: { id: 1, type_name: "Hatchback" },
                    },
                  ],
                  pagination: {
                    totalItems: 1,
                    currentPage: 1,
                    totalPages: 1,
                    limit: 20,
                  },
                },
              }),
              request("Get Car By Id", "GET", "/api/user/v1/self-drive/cars/{{car_id}}", {
                description:
                  "Car detail in browse mode with 1-day fare preview. Uses collection variable car_id.",
                queryParams: modeACarDetailParams,
                successMessage: "Car fetched successfully",
                successData: {
                  mode: "browse",
                  city: { id: 1, short_name: "BLR", name: "Bengaluru" },
                  pickup_at: null,
                  drop_at: null,
                  rental_days: 1,
                  is_estimated: true,
                  car: {
                    id: 1,
                    car_name: "Maruti Swift VXi",
                    model: "Swift",
                    made_year: 2022,
                    transmission: "manual",
                    seats: 5,
                    fuel_type: "petrol",
                    mileage: "21 kmpl",
                    main_image: cloudinaryMainImage,
                    additional_images: cloudinaryAdditionalImages.map((image_url, index) => ({
                      id: index + 1,
                      image_url,
                      sort_order: index + 1,
                    })),
                    specifications: {
                      seats: 5,
                      transmission: "manual",
                      fuel_type: "petrol",
                      mileage: "21 kmpl",
                      travelling_allowed_per_day: 250,
                      extra_charge_per_km: 12,
                    },
                    fare_preview: {
                      rental_days: 1,
                      price_per_day: 1420,
                      rental_total: 1420,
                      refundable_deposit: 5000,
                      travelling_allowed_per_day: 250,
                      extra_charge_per_km: 12,
                      is_estimated: true,
                    },
                  },
                },
              }),
            ],
            "Optional city_id. 1-day estimated pricing. No pickup/drop dates required."
          ),
          folder(
            "Mode B - Find",
            [
              request("Search", "POST", "/api/user/v1/self-drive/search", {
                description:
                  "Find flow entry point. Returns categories for city + date range with exact rental days.",
                body: {
                  city_id: 1,
                  pickup_at: "2026-05-28T04:30:00.000Z",
                  drop_at: "2026-05-30T14:30:00.000Z",
                },
                successMessage: "Search completed successfully",
                successData: {
                  mode: "find",
                  city: {
                    id: 1,
                    short_name: "BLR",
                    name: "Bengaluru",
                    address: "Bengaluru, Karnataka",
                    image: "https://example.com/bengaluru.jpg",
                  },
                  pickup_at: "2026-05-28T04:30:00.000Z",
                  drop_at: "2026-05-30T14:30:00.000Z",
                  rental_days: 3,
                  is_estimated: false,
                  total_available_cars: 5,
                  categories: [
                    {
                      car_type_id: 1,
                      name: "Hatchback",
                      starting_price_per_day: 1420,
                      rental_total_for_default_day: 4260,
                      cheapest_car_name: "Maruti Swift VXi",
                      cheapest_car_city: "Bengaluru",
                      available_cars_count: 2,
                      example_models: ["Swift", "Tiago"],
                    },
                    {
                      car_type_id: 2,
                      name: "SUV",
                      starting_price_per_day: 2840,
                      rental_total_for_default_day: 8520,
                      cheapest_car_name: "Hyundai Creta",
                      cheapest_car_city: "Bengaluru",
                      available_cars_count: 1,
                      example_models: ["Creta"],
                    },
                  ],
                },
              }),
              request("List Cars", "GET", "/api/user/v1/self-drive/cars", {
                description:
                  "List available cars for city + date range. city_id, pickup_at, and drop_at are required together.",
                queryParams: modeBListCarsParams,
                successMessage: "Cars fetched successfully",
                successData: {
                  mode: "find",
                  city: { id: 1, short_name: "BLR", name: "Bengaluru" },
                  pickup_at: "2026-05-28T04:30:00.000Z",
                  drop_at: "2026-05-30T14:30:00.000Z",
                  rental_days: 3,
                  is_estimated: false,
                  cars: [
                    {
                      id: 1,
                      car_name: "Maruti Swift VXi",
                      model: "Swift",
                      made_year: 2022,
                      transmission: "manual",
                      seats: 5,
                      fuel_type: "petrol",
                      price_per_day: 1420,
                      rental_days: 3,
                      rental_total: 4260,
                      is_estimated: false,
                      main_image: cloudinaryMainImage,
                      city: { id: 1, short_name: "BLR", name: "Bengaluru" },
                      car_type: { id: 1, type_name: "Hatchback" },
                    },
                  ],
                  pagination: {
                    totalItems: 1,
                    currentPage: 1,
                    totalPages: 1,
                    limit: 20,
                  },
                },
              }),
              request("Get Car By Id", "GET", "/api/user/v1/self-drive/cars/{{car_id}}", {
                description:
                  "Car detail with exact fare for the selected rental window. Requires city_id + pickup_at + drop_at.",
                queryParams: modeBFindQueryParams,
                successMessage: "Car fetched successfully",
                successData: {
                  mode: "find",
                  city: { id: 1, short_name: "BLR", name: "Bengaluru" },
                  pickup_at: "2026-05-28T04:30:00.000Z",
                  drop_at: "2026-05-30T14:30:00.000Z",
                  rental_days: 3,
                  is_estimated: false,
                  car: {
                    id: 1,
                    car_name: "Maruti Swift VXi",
                    model: "Swift",
                    made_year: 2022,
                    transmission: "manual",
                    seats: 5,
                    fuel_type: "petrol",
                    mileage: "21 kmpl",
                    main_image: cloudinaryMainImage,
                    additional_images: cloudinaryAdditionalImages.map((image_url, index) => ({
                      id: index + 1,
                      image_url,
                      sort_order: index + 1,
                    })),
                    specifications: {
                      seats: 5,
                      transmission: "manual",
                      fuel_type: "petrol",
                      mileage: "21 kmpl",
                      travelling_allowed_per_day: 250,
                      extra_charge_per_km: 12,
                    },
                    fare_preview: {
                      rental_days: 3,
                      price_per_day: 1420,
                      rental_total: 4260,
                      refundable_deposit: 5000,
                      travelling_allowed_per_day: 250,
                      extra_charge_per_km: 12,
                      is_estimated: false,
                    },
                  },
                },
              }),
            ],
            "Requires city_id + pickup_at + drop_at together. Exact rental pricing."
          ),
        ],
        "Self-drive discovery APIs. Mode A = browse with 1-day estimate. Mode B = find with dates."
      ),
      folder("Bookings", [
        request("Booking Summary", "POST", "/api/user/v1/self-drive/bookings/summary", {
          auth: "user_token",
          body: bookingPayload,
          successMessage: "Booking summary fetched successfully",
          successData: {
            pickup_at: bookingPayload.pickup_at,
            drop_at: bookingPayload.drop_at,
            fare_breakdown: {
              rental_days: 3,
              price_per_day: 1420,
              base_rental_amount: 4260,
              insurance_amount: 598,
              delivery_amount: 0,
              gst_percent: 5,
              gst_amount: 243,
              discount_amount: 600,
              payable_amount: 4501,
              security_deposit_amount: 5000,
            },
            coupon: {
              code: "WKND25",
              is_applicable: true,
              message: "You saved ₹600 with WKND25",
            },
          },
        }),
        request("Checkout And Pay", "POST", "/api/user/v1/self-drive/bookings/checkout", {
          auth: "user_token",
          description:
            "Creates booking + PayU session. Dev/local: copy data.payu_redirect_url from response and open in Chrome (do NOT use literal {bookingId}).",
          body: bookingPayload,
          successMessage: "Checkout initiated successfully",
          successData: {
            booking: {
              id: 1,
              booking_ref: "IY-00001",
              booking_status: "payment_processing",
              payment_status: "initiated",
            },
            payment: {
              payable_amount: 4501,
              payu: {
                payment_url: "https://test.payu.in/_payment",
                key: "oerEcQ",
                txnid: "IY00001-1-1234567890",
                amount: "4501.00",
                hash: "sample-hash",
                service_provider: "payu_paisa",
              },
            },
            payu_redirect_url:
              "http://localhost:5000/api/user/v1/payments/payu/redirect/1?token=eyJ...",
          },
          statusCode: 201,
          testScript: [
            "const json = pm.response.json();",
            "if (json?.data?.payu_redirect_url) {",
            "  console.log('Open this URL in Chrome to pay:', json.data.payu_redirect_url);",
            "}",
          ],
        }),
        request("Open PayU (Dev Redirect)", "GET", "/api/user/v1/payments/payu/redirect/:id", {
          auth: "user_token",
          description:
            "Dev/local only. Prefer payu_redirect_url from Checkout response. Replace :id with numeric booking id (e.g. 2), never {bookingId}.",
          pathVariables: [
            pathVariable("id", "1", "Numeric booking ID from checkout response data.booking.id"),
          ],
          queryParams: [
            queryParam(
              "token",
              "{{user_token}}",
              "Required in browser. Auto-filled from checkout payu_redirect_url.",
              true
            ),
          ],
          successMessage: "Redirecting to PayU",
          successData: { note: "Response is HTML, not JSON" },
        }),
        request("List Bookings", "GET", "/api/user/v1/self-drive/bookings", {
          auth: "user_token",
          description: "List current user's bookings with optional status filter.",
          queryParams: listBookingsParams,
          successMessage: "Bookings fetched successfully",
          successData: [
            {
              id: 1,
              booking_ref: "IY-00001",
              booking_status: "confirmed",
              payment_status: "success",
            },
            {
              id: 2,
              booking_ref: "IY-00002",
              booking_status: "payment_cancelled",
              payment_status: "cancelled",
            },
          ],
          pagination: {
            totalItems: 2,
            currentPage: 1,
            totalPages: 1,
            limit: 20,
          },
        }),
        request("Get Booking By Id", "GET", "/api/user/v1/self-drive/bookings/:id", {
          auth: "user_token",
          pathVariables: [pathVariable("id", "1", "Booking ID.")],
          successMessage: "Booking fetched successfully",
          successData: {
            id: 1,
            booking_ref: "IY-00001",
            booking_status: "confirmed",
            payment_status: "success",
          },
        }),
        request("Retry Payment", "POST", "/api/user/v1/self-drive/bookings/:id/pay", {
          auth: "user_token",
          pathVariables: [pathVariable("id", "2", "Booking ID with failed/cancelled payment.")],
          successMessage: "Payment retry initiated successfully",
          successData: {
            booking: {
              id: 2,
              booking_ref: "IY-00002",
              booking_status: "payment_processing",
              payment_status: "initiated",
            },
            payment: {
              payable_amount: 3010,
              payu: {
                payment_url: "https://test.payu.in/_payment",
                txnid: "IY00002-2-1234567890",
              },
            },
          },
        }),
      ]),
      folder("Coupons", [
        request("List Available Coupons", "GET", "/api/user/v1/self-drive/coupons/available", {
          auth: "user_token",
          description: "Coupons applicable to a rental quote before checkout.",
          queryParams: availableCouponsParams,
          successMessage: "Available coupons fetched successfully",
          successData: {
            base_rental_amount: 4260,
            coupons: [
              {
                code: "WKND25",
                title: "Flat 25% off weekend rentals",
                estimated_discount: 600,
                is_applicable: true,
              },
            ],
          },
        }),
        request("Validate Coupon", "POST", "/api/user/v1/self-drive/coupons/validate", {
          auth: "user_token",
          body: {
            code: "WKND25",
            ...bookingPayload,
          },
          successMessage: "Coupon validated successfully",
          successData: {
            coupon: {
              code: "WKND25",
              is_applicable: true,
              message: "You saved ₹600 with WKND25",
            },
            fare_breakdown: {
              discount_amount: 600,
              payable_amount: 4501,
            },
          },
        }),
      ]),
    ]),
    folder("Admin", [
      folder("Auth", [
        request("Admin Login", "POST", "/api/admin/v1/auth/admin-login", {
          body: {
            email: "inyatriadmin@gmail.com",
            password: "Admin@2300",
          },
          successMessage: "Admin logged in successfully",
          successData: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
            admin: {
              id: 1,
              email: "inyatriadmin@gmail.com",
              name: "Admin",
              status: 1,
            },
          },
          testScript: [
            "const json = pm.response.json();",
            "if (json?.data?.token) {",
            "  pm.collectionVariables.set('admin_token', json.data.token);",
            "}",
          ],
        }),
      ]),
      masterCrudFolder({
        folderName: "Car Brands",
        basePath: "/api/admin/v1/car-brands",
        listMessage: "Car brands fetched successfully",
        createMessage: "Car brand created successfully",
        updateMessage: "Car brand updated successfully",
        deleteMessage: "Car brand deactivated successfully",
        createRequestName: "Create Car Brand",
        sampleRow: {
          id: 1,
          brand_name: "Maruti Suzuki",
          status: 1,
          createBody: { brand_name: "Maruti Suzuki", status: 1 },
          updateBody: { brand_name: "Maruti Suzuki Updated" },
        },
      }),
      masterCrudFolder({
        folderName: "Car Features",
        basePath: "/api/admin/v1/car-features",
        listMessage: "Car features fetched successfully",
        createMessage: "Car feature created successfully",
        updateMessage: "Car feature updated successfully",
        deleteMessage: "Car feature deactivated successfully",
        createRequestName: "Create Car Feature",
        sampleRow: {
          id: 1,
          name: "Air Conditioning",
          status: 1,
          createBody: { name: "Air Conditioning", status: 1 },
          updateBody: { name: "AC" },
        },
      }),
      masterCrudFolder({
        folderName: "States",
        basePath: "/api/admin/v1/states",
        listMessage: "States fetched successfully",
        createMessage: "State created successfully",
        updateMessage: "State updated successfully",
        deleteMessage: "State deactivated successfully",
        createRequestName: "Create State",
        sampleRow: {
          id: 1,
          state_name: "Maharashtra",
          country_code: "IN",
          status: 1,
          createBody: {
            state_name: "Maharashtra",
            country_code: "IN",
            status: 1,
          },
          updateBody: { state_name: "Maharashtra" },
        },
      }),
      folder("Cities", [
        request("List Cities", "GET", "/api/admin/v1/cities", {
          auth: "admin_token",
          queryParams: adminListParams,
          successMessage: "Cities fetched successfully",
          successData: [
            {
              id: 1,
              short_name: "PNQ",
              name: "Pune",
              address: "Pune, Maharashtra",
              image: "https://example.com/pune.jpg",
              status: 1,
            },
          ],
          pagination: {
            totalItems: 1,
            currentPage: 1,
            totalPages: 1,
            limit: 20,
          },
        }),
        request("Create City", "POST", "/api/admin/v1/cities", {
          auth: "admin_token",
          body: {
            short_name: "PNQ",
            name: "Pune",
            address: "Pune, Maharashtra, India",
            image: "https://example.com/pune.jpg",
            status: 1,
          },
          successMessage: "City created successfully",
          successData: { id: 1, short_name: "PNQ", name: "Pune", status: 1 },
          statusCode: 201,
        }),
        request("Update City", "PUT", "/api/admin/v1/cities/:id", {
          auth: "admin_token",
          pathVariables: [pathVariable("id", "1", "City ID.")],
          body: { name: "Pune City" },
          successMessage: "City updated successfully",
          successData: { id: 1, short_name: "PNQ", name: "Pune City", status: 1 },
        }),
        request("Deactivate City", "DELETE", "/api/admin/v1/cities/:id", {
          auth: "admin_token",
          pathVariables: [pathVariable("id", "1", "City ID.")],
          successMessage: "City deactivated successfully",
          successData: { id: 1, name: "Pune", status: 2 },
        }),
      ]),
      masterCrudFolder({
        folderName: "Car Types",
        basePath: "/api/admin/v1/car-types",
        listMessage: "Car types fetched successfully",
        createMessage: "Car type created successfully",
        updateMessage: "Car type updated successfully",
        deleteMessage: "Car type deactivated successfully",
        createRequestName: "Create Car Type",
        sampleRow: {
          id: 1,
          type_name: "SUV",
          status: 1,
          createBody: { type_name: "SUV", status: 1 },
          updateBody: { type_name: "Compact SUV" },
        },
      }),
      folder("Coupons", [
        request("List Coupons", "GET", "/api/admin/v1/coupons", {
          auth: "admin_token",
          queryParams: adminListParams,
          successMessage: "Coupons fetched successfully",
          successData: [couponSample],
          pagination: {
            totalItems: 1,
            currentPage: 1,
            totalPages: 1,
            limit: 20,
          },
        }),
        request("Create Coupon", "POST", "/api/admin/v1/coupons", {
          auth: "admin_token",
          body: {
            code: "WKND25",
            title: "Flat 25% off weekend rentals",
            description: "Max ₹600 · valid till 30 May",
            discount_percent: 25,
            max_discount_amount: 600,
            min_base_rental_amount: 2000,
            valid_from: "2026-05-01T00:00:00.000Z",
            valid_to: "2026-05-30T23:59:59.000Z",
            usage_limit: 1000,
            status: 1,
          },
          successMessage: "Coupon created successfully",
          successData: couponSample,
          statusCode: 201,
        }),
        request("Update Coupon", "PUT", "/api/admin/v1/coupons/:id", {
          auth: "admin_token",
          pathVariables: [pathVariable("id", "1", "Coupon ID.")],
          body: { title: "Weekend 25% off", max_discount_amount: 700 },
          successMessage: "Coupon updated successfully",
          successData: { ...couponSample, title: "Weekend 25% off", max_discount_amount: 700 },
        }),
        request("Deactivate Coupon", "DELETE", "/api/admin/v1/coupons/:id", {
          auth: "admin_token",
          pathVariables: [pathVariable("id", "1", "Coupon ID.")],
          successMessage: "Coupon deactivated successfully",
          successData: { ...couponSample, status: 2 },
        }),
      ]),
      folder("Cars", [
        request("Car Meta", "GET", "/api/admin/v1/cars/meta", {
          auth: "admin_token",
          successMessage: "Car metadata fetched successfully",
          successData: {
            fuelTypes: ["petrol", "diesel", "cng"],
            transmissions: ["manual", "automatic"],
            seats: [5, 6, 7],
          },
        }),
        request("Upload Single Image", "POST", "/api/admin/v1/cars/upload/image", {
          auth: "admin_token",
          multipart: true,
          formdata: [
            { key: "file", type: "file", src: [] },
          ],
          successMessage: "Image uploaded successfully",
          successData: {
            url: "https://res.cloudinary.com/demo/image/upload/v1/inyatri/cars/sample.jpg",
            public_id: "inyatri/cars/sample",
          },
        }),
        request("Upload Multiple Images", "POST", "/api/admin/v1/cars/upload/images", {
          auth: "admin_token",
          multipart: true,
          formdata: [
            { key: "files", type: "file", src: [] },
            { key: "files", type: "file", src: [] },
          ],
          successMessage: "Images uploaded successfully",
          successData: [
            {
              url: "https://res.cloudinary.com/demo/image/upload/v1/inyatri/cars/sample1.jpg",
              public_id: "inyatri/cars/sample1",
            },
            {
              url: "https://res.cloudinary.com/demo/image/upload/v1/inyatri/cars/sample2.jpg",
              public_id: "inyatri/cars/sample2",
            },
          ],
        }),
        request("List Cars", "GET", "/api/admin/v1/cars", {
          auth: "admin_token",
          queryParams: adminListParams,
          successMessage: "Cars fetched successfully",
          successData: [
            {
              id: 1,
              car_name: "Swift VXI",
              vehicle_number: "MH12AB1234",
              brand_id: 1,
              city_id: 1,
              status: 1,
            },
          ],
          pagination: {
            totalItems: 1,
            currentPage: 1,
            totalPages: 1,
            limit: 20,
          },
        }),
        request("Create Car", "POST", "/api/admin/v1/cars", {
          auth: "admin_token",
          body: {
            car_name: "Swift VXI",
            vehicle_number: "MH12AB1234",
            brand_id: 1,
            city_id: 1,
            location: "Pune, Maharashtra",
            latitude: 18.5204,
            longitude: 73.8567,
            fuel_type: "petrol",
            feature_ids: [1, 2],
            made_year: 2022,
            model: "Swift",
            travelled_km: 15000,
            travelling_allowed_per_day: 250,
            extra_charge_per_km: 12,
            seats: 5,
            car_type_id: 1,
            transmission: "manual",
            price_per_hour: 59,
            price_per_day: 1420,
            weekend_price_per_hour: 70,
            short_description: "Well maintained hatchback",
            main_image: cloudinaryMainImage,
            additional_images: cloudinaryAdditionalImages,
            enable_monthly_subscription: false,
            refundable_deposit: 5000,
            home_delivery_charge: 2000,
            show_on_top: false,
            home_delivery_available: true,
            status: 1,
          },
          successMessage: "Car created successfully",
          successData: { id: 1, car_name: "Swift VXI", status: 1 },
          statusCode: 201,
        }),
        request("Get Car By Id", "GET", "/api/admin/v1/cars/:id", {
          auth: "admin_token",
          pathVariables: [pathVariable("id", "1", "Car ID.")],
          successMessage: "Car fetched successfully",
          successData: {
            id: 1,
            car_name: "Swift VXI",
            vehicle_number: "MH12AB1234",
            brand: { id: 1, brand_name: "Maruti Suzuki" },
            city: { id: 1, short_name: "PNQ", name: "Pune" },
            status: 1,
          },
        }),
        request("Update Car", "PUT", "/api/admin/v1/cars/:id", {
          auth: "admin_token",
          pathVariables: [pathVariable("id", "1", "Car ID.")],
          body: {
            car_name: "Swift VXI Updated",
            price_per_hour: 550,
          },
          successMessage: "Car updated successfully",
          successData: {
            id: 1,
            car_name: "Swift VXI Updated",
            price_per_hour: 550,
            status: 1,
          },
        }),
        request("Deactivate Car", "PATCH", "/api/admin/v1/cars/:id/status", {
          auth: "admin_token",
          pathVariables: [pathVariable("id", "1", "Car ID.")],
          body: { status: 2 },
          successMessage: "Car deactivated successfully",
          successData: { id: 1, car_name: "Swift VXI", status: 2 },
        }),
        request("Activate Car", "PATCH", "/api/admin/v1/cars/:id/status", {
          auth: "admin_token",
          pathVariables: [pathVariable("id", "1", "Car ID.")],
          body: { status: 1 },
          successMessage: "Car activated successfully",
          successData: { id: 1, car_name: "Swift VXI", status: 1 },
        }),
      ]),
    ]),
    healthRequest,
  ],
};

const outPath = path.join(__dirname, "INYATRI.postman_collection.json");
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
console.log(`Generated: ${outPath}`);
