import { sequelize } from '../config/dbConfig.js';

async function runMigration() {
  try {
    const columns = [
      { name: 'rental_type', def: "VARCHAR(20) NOT NULL DEFAULT 'rental' COMMENT 'rental or monthly'" },
      { name: 'subscription_plan', def: "VARCHAR(50) NULL COMMENT '15_days, 1_month, 3_months, 6_months, custom'" },
      { name: 'plan_discount_percent', def: "DECIMAL(5,2) NOT NULL DEFAULT 0" },
      { name: 'plan_discount_amount', def: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
      { name: 'payment_option', def: "VARCHAR(20) NOT NULL DEFAULT 'full' COMMENT 'full or part'" },
      { name: 'part_payment_percent', def: "DECIMAL(5,2) NOT NULL DEFAULT 0" },
      { name: 'total_booking_amount', def: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
      { name: 'paid_amount', def: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
      { name: 'remaining_amount', def: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
    ];

    const [existingCols] = await sequelize.query('DESCRIBE bookings');
    const existingNames = new Set(existingCols.map(c => c.Field));

    for (const col of columns) {
      if (!existingNames.has(col.name)) {
        console.log(`Adding column: ${col.name}`);
        await sequelize.query(`ALTER TABLE bookings ADD COLUMN ${col.name} ${col.def}`);
      } else {
        console.log(`Column already exists: ${col.name}`);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
