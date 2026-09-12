-- Phase 3: Self-drive bookings, coupons, and PayU payments

CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(500) NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  max_discount_amount DECIMAL(10,2) NULL,
  min_base_rental_amount DECIMAL(10,2) NULL,
  valid_from DATETIME NOT NULL,
  valid_to DATETIME NOT NULL,
  usage_limit INT NOT NULL DEFAULT 0 COMMENT '0 = unlimited',
  used_count INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1=active, 2=inactive',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_coupons_code (code),
  KEY idx_coupons_status (status),
  KEY idx_coupons_validity (valid_from, valid_to)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_ref VARCHAR(20) NOT NULL,
  user_id INT NOT NULL,
  car_id INT NOT NULL,
  city_id INT NOT NULL,
  coupon_id INT NULL,
  pickup_at DATETIME NOT NULL,
  drop_at DATETIME NOT NULL,
  rental_days INT NOT NULL,
  pickup_location VARCHAR(300) NOT NULL,
  drop_location VARCHAR(300) NOT NULL,
  insurance_selected TINYINT(1) NOT NULL DEFAULT 0,
  home_delivery_selected TINYINT(1) NOT NULL DEFAULT 0,
  base_rental_amount DECIMAL(10,2) NOT NULL,
  insurance_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payable_amount DECIMAL(10,2) NOT NULL,
  security_deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  booking_status TINYINT NOT NULL DEFAULT 1 COMMENT '1=pending_payment,2=payment_processing,3=payment_failed,4=payment_cancelled,5=confirmed,6=cancelled',
  payment_status TINYINT NOT NULL DEFAULT 1 COMMENT '1=not_initiated,2=initiated,3=success,4=failed,5=cancelled',
  payu_txn_id VARCHAR(100) NULL,
  payu_mihpayid VARCHAR(100) NULL,
  payu_payment_id VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_bookings_ref (booking_ref),
  KEY idx_bookings_user (user_id),
  KEY idx_bookings_car (car_id),
  KEY idx_bookings_status (booking_status, payment_status),
  KEY idx_bookings_payu_txn (payu_txn_id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_car FOREIGN KEY (car_id) REFERENCES cars(id),
  CONSTRAINT fk_bookings_city FOREIGN KEY (city_id) REFERENCES city(city_id),
  CONSTRAINT fk_bookings_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);

CREATE TABLE IF NOT EXISTS coupon_usages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id INT NOT NULL,
  booking_id INT NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_coupon_user (coupon_id, user_id),
  KEY idx_coupon_usages_booking (booking_id),
  CONSTRAINT fk_coupon_usages_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  CONSTRAINT fk_coupon_usages_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_coupon_usages_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

CREATE TABLE IF NOT EXISTS booking_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  attempt_no INT NOT NULL DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL,
  payu_txn_id VARCHAR(100) NOT NULL,
  status TINYINT NOT NULL DEFAULT 2 COMMENT '2=initiated,3=success,4=failed,5=cancelled',
  gateway_response JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_booking_payments_booking (booking_id),
  KEY idx_booking_payments_txn (payu_txn_id),
  CONSTRAINT fk_booking_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
