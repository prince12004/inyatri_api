-- Phase 4: Monthly Subscription and Part Payment Migration for bookings
-- Adds support for monthly subscription plan tracking and part payment (25% / Full)

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS rental_type VARCHAR(20) NOT NULL DEFAULT 'rental' COMMENT 'rental or monthly',
  ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) NULL COMMENT '15_days, 1_month, 3_months, 6_months, custom',
  ADD COLUMN IF NOT EXISTS plan_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plan_discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_option VARCHAR(20) NOT NULL DEFAULT 'full' COMMENT 'full or part',
  ADD COLUMN IF NOT EXISTS part_payment_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_booking_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
