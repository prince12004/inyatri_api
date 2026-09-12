-- Self-drive user APIs: daily pricing on cars
ALTER TABLE cars
  ADD COLUMN price_per_day DECIMAL(10,2) NULL COMMENT 'Self-drive daily rate' AFTER price_per_hour;

-- Backfill from hourly rate where daily price is missing
UPDATE cars
SET price_per_day = ROUND(price_per_hour * 24, 2)
WHERE price_per_day IS NULL AND price_per_hour IS NOT NULL AND price_per_hour > 0;
