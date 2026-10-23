import { sequelize } from "../config/dbConfig.js";

export const runNotificationMigration = async () => {
  try {
    const [userCols] = await sequelize.query("SHOW COLUMNS FROM `users` LIKE 'fcm_token'");
    if (userCols.length === 0) {
      await sequelize.query("ALTER TABLE `users` ADD COLUMN `fcm_token` VARCHAR(512) NULL DEFAULT NULL AFTER `token`");
      console.log("✅ Added fcm_token column to users table");
    } else {
      console.log("ℹ️ users.fcm_token already exists");
    }

    const [adminCols] = await sequelize.query("SHOW COLUMNS FROM `admin` LIKE 'fcm_token'");
    if (adminCols.length === 0) {
      await sequelize.query("ALTER TABLE `admin` ADD COLUMN `fcm_token` VARCHAR(512) NULL DEFAULT NULL AFTER `image`");
      console.log("✅ Added fcm_token column to admin table");
    } else {
      console.log("ℹ️ admin.fcm_token already exists");
    }

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`notifications\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NULL,
        \`admin_id\` INT NULL,
        \`recipient_role\` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        \`title\` VARCHAR(255) NOT NULL,
        \`body\` TEXT NOT NULL,
        \`type\` VARCHAR(50) NOT NULL DEFAULT 'general',
        \`data\` JSON NULL,
        \`is_read\` TINYINT(1) NOT NULL DEFAULT 0,
        \`read_at\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_user_id\` (\`user_id\`),
        INDEX \`idx_admin_id\` (\`admin_id\`),
        INDEX \`idx_recipient_role\` (\`recipient_role\`),
        INDEX \`idx_is_read\` (\`is_read\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ notifications table verified/created");
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
};

if (process.argv[1]?.endsWith("migrateNotificationSchema.js")) {
  runNotificationMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
