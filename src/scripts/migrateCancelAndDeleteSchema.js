import { sequelize } from "../config/dbConfig.js";

async function migrate() {
  console.log("Running migration for cancel booking and delete account...");

  try {
    // 1. Widen users.mobile to VARCHAR(50)
    await sequelize.query(
      "ALTER TABLE `users` MODIFY COLUMN `mobile` VARCHAR(50) NOT NULL;"
    );
    console.log("✅ users.mobile modified to VARCHAR(50)");
  } catch (err) {
    console.log("ℹ️ users.mobile modify error/info:", err.message);
  }

  try {
    // 2. Add deleted_at to users
    const [cols] = await sequelize.query("SHOW COLUMNS FROM `users` LIKE 'deleted_at'");
    if (cols.length === 0) {
      await sequelize.query("ALTER TABLE `users` ADD COLUMN `deleted_at` DATETIME NULL DEFAULT NULL;");
      console.log("✅ Added deleted_at column to users table");
    } else {
      console.log("ℹ️ users.deleted_at column already exists");
    }
  } catch (err) {
    console.error("Error adding deleted_at to users:", err.message);
  }

  try {
    // 3. Add cancellation_reason and cancelled_at to bookings
    const [cols1] = await sequelize.query("SHOW COLUMNS FROM `bookings` LIKE 'cancellation_reason'");
    if (cols1.length === 0) {
      await sequelize.query("ALTER TABLE `bookings` ADD COLUMN `cancellation_reason` VARCHAR(500) NULL DEFAULT NULL;");
      await sequelize.query("ALTER TABLE `bookings` ADD COLUMN `cancelled_at` DATETIME NULL DEFAULT NULL;");
      console.log("✅ Added cancellation columns to bookings table");
    } else {
      console.log("ℹ️ bookings cancellation columns already exist");
    }
  } catch (err) {
    console.error("Error adding cancellation columns to bookings:", err.message);
  }

  try {
    // 4. Add cancellation_reason and cancelled_at to cab_bookings
    const [cols2] = await sequelize.query("SHOW COLUMNS FROM `cab_bookings` LIKE 'cancellation_reason'");
    if (cols2.length === 0) {
      await sequelize.query("ALTER TABLE `cab_bookings` ADD COLUMN `cancellation_reason` VARCHAR(500) NULL DEFAULT NULL;");
      await sequelize.query("ALTER TABLE `cab_bookings` ADD COLUMN `cancelled_at` DATETIME NULL DEFAULT NULL;");
      console.log("✅ Added cancellation columns to cab_bookings table");
    } else {
      console.log("ℹ️ cab_bookings cancellation columns already exist");
    }
  } catch (err) {
    console.error("Error adding cancellation columns to cab_bookings:", err.message);
  }

  console.log("Migration finished.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
