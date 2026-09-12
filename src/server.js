import "dotenv/config";
import http from "http";
import { sequelize } from "./config/dbConfig.js";
import app from "./app.js";
import logger from "./utils/logger.js";

const ENV = process.env.NODE_ENV || "development";
const PORT = normalizePort(process.env.PORT || "3000");
const server = http.createServer(app);

const startServer = async () => {
  await connectDatabase();

  server.on("clientError", onClientError);
  server.on("error", onError);
  server.on("listening", onListening);

  server.listen(PORT);
};

function normalizePort(val) {
  const port = parseInt(val, 10);
  return isNaN(port) ? val : port >= 0 ? port : false;
}

function onError(error) {
  if (error.syscall !== "listen") throw error;

  const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;
  switch (error.code) {
    case "EACCES":
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case "EADDRINUSE":
      logger.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`🚀 Server running on ${bind}`);
  console.log(`📝 Environment: ${ENV}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
}

function onClientError(err, socket) {
  if (socket.writable) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n", () => {
      socket.destroy();
    });
  } else {
    socket.destroy();
  }

  logger.error("Client error:", err);
}

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (err) {
    logger.error("❌ Failed to connect to the database:", err);
    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  logger.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  logger.info("👋 SIGTERM received. Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

startServer();
