-- Car module schema updates (run on inyatri_local_db)
-- city table may already exist from PHP legacy app.

-- Cars: replace state with city and add daily travel fields
ALTER TABLE cars
  ADD COLUMN city_id INT NULL AFTER brand_id,
  ADD COLUMN travelling_allowed_per_day INT NULL COMMENT 'Max km allowed per rental day',
  ADD COLUMN extra_charge_per_km DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Charge per km when daily limit exceeded';

-- Migrate existing rows if state_id was used (map manually before drop), then:
-- UPDATE cars SET city_id = <your_city_id> WHERE city_id IS NULL;

ALTER TABLE cars
  MODIFY city_id INT NOT NULL,
  DROP COLUMN state_id;

ALTER TABLE cars
  ADD INDEX idx_cars_city_id (city_id);

-- Remove disable schedules (availability managed via car status active/inactive)
DROP TABLE IF EXISTS car_disable_schedules;

-- Ensure city table has status for soft delete (skip if column already exists)
ALTER TABLE city
  ADD COLUMN status TINYINT NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive';
