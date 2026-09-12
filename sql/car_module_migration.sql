-- InYatri car module tables (run on inyatri_local_db)
-- car_brands, car_features, states may already exist from PHP — skip CREATE if present.

CREATE TABLE IF NOT EXISTS car_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(100) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  car_name VARCHAR(200) NOT NULL,
  vehicle_number VARCHAR(50) NOT NULL,
  brand_id INT NOT NULL,
  city_id INT NOT NULL,
  location VARCHAR(300) NOT NULL,
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  fuel_type ENUM('petrol','diesel','cng') NOT NULL,
  car_type_id INT NOT NULL,
  transmission ENUM('manual','automatic') NOT NULL,
  seats TINYINT NOT NULL,
  made_year SMALLINT NOT NULL,
  model VARCHAR(100) NULL,
  mileage VARCHAR(50) NULL,
  horsepower VARCHAR(50) NULL,
  car_condition VARCHAR(100) NULL,
  version VARCHAR(100) NULL,
  travelled_km INT NOT NULL,
  travelling_allowed_per_day INT NOT NULL COMMENT 'Max km allowed per rental day',
  extra_charge_per_km DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Charge per km when daily limit exceeded',
  price_per_hour DECIMAL(10,2) NULL,
  weekend_price_per_hour DECIMAL(10,2) NULL,
  short_description TEXT NULL,
  main_image VARCHAR(500) NULL,
  enable_monthly_subscription TINYINT(1) NOT NULL DEFAULT 0,
  discount_15_days DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_1_month DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_3_months DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_6_months DECIMAL(5,2) NOT NULL DEFAULT 0,
  sold_from DATETIME NULL,
  sold_to DATETIME NULL,
  sold_remark TEXT NULL,
  refundable_deposit DECIMAL(10,2) NOT NULL DEFAULT 5000,
  home_delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 2000,
  show_on_top TINYINT(1) NOT NULL DEFAULT 0,
  home_delivery_available TINYINT(1) NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cars_brand_id (brand_id),
  INDEX idx_cars_city_id (city_id),
  INDEX idx_cars_car_type_id (car_type_id),
  INDEX idx_cars_status (status)
);

CREATE TABLE IF NOT EXISTS car_feature_map (
  car_id INT NOT NULL,
  feature_id INT NOT NULL,
  PRIMARY KEY (car_id, feature_id),
  INDEX idx_car_feature_map_feature_id (feature_id)
);

CREATE TABLE IF NOT EXISTS car_additional_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  car_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order TINYINT NOT NULL DEFAULT 0,
  INDEX idx_car_additional_images_car_id (car_id)
);

-- Add status to states if missing (legacy PHP table may not have it; skip if column already exists)
ALTER TABLE states
  ADD COLUMN status TINYINT NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive';
