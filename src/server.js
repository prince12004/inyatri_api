import 'dotenv/config';
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "./config/dbConfig.js";
import app from "./app.js";
import logger from "./utils/logger.js";

// import User from './models/User.js';
// import Car from './models/Car.js';
// import City from './models/City.js';
// import CarAdditionalImage from './models/CarAdditionalImage.js';
// import CarFeatureMap from './models/CarFeatureMap.js';
// import Coupon from './models/Coupon.js';
// import CouponUsage from './models/CouponUsage.js';
// import Booking from './models/Booking.js';
// import BookingPayment from './models/BookingPayment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV = process.env.NODE_ENV || "development";
const PORT = normalizePort(process.env.PORT || "3000");

let server;
let io;


// === Create HTTP/HTTPS Server ===

if (process.env.USE_HTTPS === "true") {
  try {
    const key = fs.readFileSync(
      path.resolve(__dirname, process.env.SSL_KEY_PATH)
    );

    const cert = fs.readFileSync(
      path.resolve(__dirname, process.env.SSL_CERT_PATH)
    );

    server = https.createServer({ key, cert }, app);

    console.log("🔐 HTTPS server enabled");

  } catch (err) {
    logger.error("❌ Failed to load SSL certificate files:", err);
    process.exit(1);
  }

} else {

  server = http.createServer(app);

  console.log("🌐 HTTP server enabled");
}


// === Start the server ===

const startServer = async () => {
  await connectDatabase();

  server.on("clientError", onClientError);
  server.on("error", onError);

  server.on("listening", () => {
    onListening();
  });

  server.listen(PORT);
};


// === Normalize Port ===

function normalizePort(val) {
  const port = parseInt(val, 10);
  return isNaN(port) ? val : port >= 0 ? port : false;
}