import { sequelize } from "../config/dbConfig.js";

export const runUserDocMigration = async () => {
  try {
    const [cols] = await sequelize.query("SHOW COLUMNS FROM `users`");
    const existing = cols.map((c) => c.Field);

    if (!existing.includes("driving_license_front")) {
      await sequelize.query(
        "ALTER TABLE `users` ADD COLUMN `driving_license_front` VARCHAR(500) NULL DEFAULT NULL AFTER `fcm_token`"
      );
      console.log("✅ Added driving_license_front to users");
    }

    if (!existing.includes("driving_license_back")) {
      await sequelize.query(
        "ALTER TABLE `users` ADD COLUMN `driving_license_back` VARCHAR(500) NULL DEFAULT NULL AFTER `driving_license_front`"
      );
      console.log("✅ Added driving_license_back to users");
    }

    if (!existing.includes("government_id")) {
      await sequelize.query(
        "ALTER TABLE `users` ADD COLUMN `government_id` VARCHAR(500) NULL DEFAULT NULL AFTER `driving_license_back`"
      );
      console.log("✅ Added government_id to users");
    }

    const [updatedCols] = await sequelize.query("SHOW COLUMNS FROM `users`");
    console.log("Current users columns:", updatedCols.map((c) => c.Field));
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
};

if (process.argv[1]?.endsWith("migrateUserDocSchema.js")) {
  runUserDocMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
