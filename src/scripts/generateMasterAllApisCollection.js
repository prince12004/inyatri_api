import fs from "fs";
import path from "path";

// Load base collections
const legacyPath = path.resolve("postman/INYATRI.postman_collection.json");
const cabPath = path.resolve("postman/INYATRI_Cab_Flow.postman_collection.json");

const legacy = JSON.parse(fs.readFileSync(legacyPath, "utf-8"));
const cab = JSON.parse(fs.readFileSync(cabPath, "utf-8"));

// 1. Unified Variables
const variableMap = new Map();

// Insert defaults
const defaultVars = [
  { key: "baseUrl", value: "http://localhost:5000" },
  { key: "admin_token", value: "" },
  { key: "user_token", value: "" },
  { key: "city_id", value: "1" },
  { key: "pickup_at", value: "2026-11-01T10:00:00.000Z" },
  { key: "drop_at", value: "2026-11-03T18:00:00.000Z" },
  { key: "car_id", value: "1" },
  { key: "car_type_id", value: "1" },
  { key: "package_id", value: "1" },
  { key: "pricing_id", value: "1" },
  { key: "cab_booking_id", value: "1" },
  { key: "booking_id", value: "1" },
  { key: "payu_txn_id", value: "" },
  { key: "departure_at", value: "2026-11-01T10:00:00.000Z" },
  { key: "return_at", value: "2026-11-03T18:00:00.000Z" },
];

defaultVars.forEach((v) => variableMap.set(v.key, v));
if (legacy.variable) {
  legacy.variable.forEach((v) => {
    if (!variableMap.has(v.key)) variableMap.set(v.key, v);
  });
}
if (cab.variable) {
  cab.variable.forEach((v) => {
    if (!variableMap.has(v.key)) variableMap.set(v.key, v);
  });
}

// 2. Extract Folders from Cab collection
const adminCabFolder = cab.item.find((i) => i.name.includes("Admin - Cab Management"));
const oneWayFolder = cab.item.find((i) => i.name.includes("Flow A - One Way"));
const roundTripFolder = cab.item.find((i) => i.name.includes("Flow B - Round Trip"));
const localFolder = cab.item.find((i) => i.name.includes("Flow C - Local Rental"));
const airportFolder = cab.item.find((i) => i.name.includes("Flow D - Airport"));
const cabBookingsFolder = cab.item.find((i) => i.name.includes("User Cab Bookings"));
const payuSimulatorsFolder = cab.item.find((i) => i.name.includes("Payment Callback Simulators"));

// 3. Build Unified User Folders
const userItem = legacy.item.find((i) => i.name === "User");
const existingUserFolders = userItem ? [...userItem.item] : [];

// Combine into clean Cab Flow group
const cabFlowMasterFolder = {
  name: "Cab Flow (All Trip Types)",
  description: "End-to-end cab booking flows for all 4 trip types (One-Way, Round-Trip, Local Rental Packages, and Airport point-to-point) up to checkout, PayU payment generation, retry, and sync.",
  item: [
    oneWayFolder,
    roundTripFolder,
    localFolder,
    airportFolder,
    cabBookingsFolder,
  ].filter(Boolean),
};

// Check if Cab Flow already exists in User, otherwise append
const updatedUserSubfolders = [
  ...existingUserFolders.filter((f) => !f.name.includes("Cab")),
  cabFlowMasterFolder,
];

// Add PayU simulators to User if not present
if (payuSimulatorsFolder) {
  updatedUserSubfolders.push(payuSimulatorsFolder);
}

// 4. Build Unified Admin Folders
const adminItem = legacy.item.find((i) => i.name === "Admin");
const existingAdminFolders = adminItem ? [...adminItem.item] : [];

const updatedAdminSubfolders = [
  ...existingAdminFolders.filter((f) => !f.name.includes("Cab")),
  adminCabFolder,
].filter(Boolean);

// 5. Health Check Request
const healthItem = {
  name: "Health Check",
  request: {
    method: "GET",
    header: [],
    url: {
      raw: "{{baseUrl}}/health",
      host: ["{{baseUrl}}"],
      path: ["health"],
    },
    description: "Server health check endpoint. Returns 'Health Ok'.",
  },
};

// 6. Assemble Final Collection Object
const masterCollection = {
  info: {
    _postman_id: "inyatri-complete-master-collection",
    name: "INYATRI - Complete Master API Collection (All Modules)",
    description: "Complete single Postman collection containing ALL APIs for the entire INYATRI platform. Covers both User and Admin portals across all modules: Authentication, Self-Drive Rentals, Monthly Car Subscriptions, Cab Booking Engine (One-Way with multi-stops, Round-Trip, Local Hourly Packages, and Airport point-to-point), Master Data (Brands, Types, Features, States, Cities), Inventory Cars Management, Coupons Management, PayU Payment Gateway, and Webhook Simulators.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: Array.from(variableMap.values()),
  item: [
    {
      name: "1. User APIs",
      description: "All client-facing endpoints for mobile and web apps: Authentication, Self-Drive Rentals, Monthly Subscriptions, Cab Booking Flow (One-Way, Round-Trip, Local, Airport), Booking History, and Payment Operations.",
      item: updatedUserSubfolders,
    },
    {
      name: "2. Admin APIs",
      description: "All admin dashboard and back-office APIs: Authentication, Master Data (Brands, Types, Features, States, Cities), Inventory Cars Management, Coupons Management, Cab Dashboard, Local Packages, and Car-wise Fare Slabs.",
      item: updatedAdminSubfolders,
    },
    healthItem,
  ],
};

// 7. Write to both postman/INYATRI_All_APIs.postman_collection.json and postman/INYATRI.postman_collection.json
const allApisPath = path.resolve("postman/INYATRI_All_APIs.postman_collection.json");
fs.writeFileSync(allApisPath, JSON.stringify(masterCollection, null, 2), "utf-8");
console.log("✅ Written master collection to:", allApisPath);

fs.writeFileSync(legacyPath, JSON.stringify(masterCollection, null, 2), "utf-8");
console.log("✅ Synchronized master collection to:", legacyPath);
