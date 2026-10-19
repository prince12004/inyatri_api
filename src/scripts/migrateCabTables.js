import {
  sequelize,
  CabPackage,
  CabFareSlab,
  CabBooking,
  CabBookingPayment,
} from "../models/index.js";

async function migrateCabTables() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Database connection established.");

    console.log("Syncing cab models...");
    await CabPackage.sync({ alter: true });
    console.log("✅ cab_packages table synced.");

    await CabFareSlab.sync({ alter: true });
    console.log("✅ cab_fare_slabs table synced.");

    await CabBooking.sync({ alter: true });
    console.log("✅ cab_bookings table synced.");

    await CabBookingPayment.sync({ alter: true });
    console.log("✅ cab_booking_payments table synced.");

    console.log("🎉 All cab tables migrated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateCabTables();
