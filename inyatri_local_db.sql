-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2026 at 08:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inyatri_local_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `pass_view` varchar(255) DEFAULT NULL,
  `login_type` enum('superadmin','admin') NOT NULL DEFAULT 'admin',
  `location` varchar(20) DEFAULT NULL,
  `image` text NOT NULL,
  `status` int(11) NOT NULL,
  `timestamp` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`, `pass_view`, `login_type`, `location`, `image`, `status`, `timestamp`) VALUES
(19, 'Admin', 'inyatriadmin@gmail.com', 'a2aa7ea0e0ce5ca3d9cbe7e7567755e3', 'Admin@2300', 'admin', '8', '', 1, '2026-04-17 07:07:16');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booking_ref` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `coupon_id` int(11) DEFAULT NULL,
  `pickup_at` datetime NOT NULL,
  `drop_at` datetime NOT NULL,
  `rental_days` int(11) NOT NULL,
  `pickup_location` varchar(300) NOT NULL,
  `drop_location` varchar(300) NOT NULL,
  `insurance_selected` tinyint(1) NOT NULL DEFAULT 0,
  `home_delivery_selected` tinyint(1) NOT NULL DEFAULT 0,
  `base_rental_amount` decimal(10,2) NOT NULL,
  `insurance_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gst_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payable_amount` decimal(10,2) NOT NULL,
  `security_deposit_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `booking_status` tinyint(4) NOT NULL DEFAULT 1,
  `payment_status` tinyint(4) NOT NULL DEFAULT 1,
  `payu_txn_id` varchar(100) DEFAULT NULL,
  `payu_mihpayid` varchar(100) DEFAULT NULL,
  `payu_payment_id` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_ref`, `user_id`, `car_id`, `city_id`, `coupon_id`, `pickup_at`, `drop_at`, `rental_days`, `pickup_location`, `drop_location`, `insurance_selected`, `home_delivery_selected`, `base_rental_amount`, `insurance_amount`, `delivery_amount`, `gst_amount`, `discount_amount`, `payable_amount`, `security_deposit_amount`, `booking_status`, `payment_status`, `payu_txn_id`, `payu_mihpayid`, `payu_payment_id`, `created_at`, `updated_at`) VALUES
(1, 'IY-00001', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00001-1-1788928541377', NULL, NULL, '2026-09-09 04:35:41', '2026-09-09 04:35:41'),
(2, 'IY-00002', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00002-1-1788929381620', NULL, NULL, '2026-09-09 04:49:41', '2026-09-09 04:49:41'),
(3, 'IY-00003', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00003-1-1788930415480', NULL, NULL, '2026-09-09 05:06:55', '2026-09-09 05:06:55'),
(4, 'IY-00004', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00004-1-1788930956955', NULL, NULL, '2026-09-09 05:15:56', '2026-09-09 05:15:56'),
(5, 'IY-00005', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00005-1-1788932732117', NULL, NULL, '2026-09-09 05:45:32', '2026-09-09 05:45:32'),
(6, 'IY-00006', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00006-1-1788933048138', NULL, NULL, '2026-09-09 05:50:48', '2026-09-09 05:50:48'),
(7, 'IY-00007', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00007-1-1788933091064', NULL, NULL, '2026-09-09 05:51:31', '2026-09-09 05:51:31'),
(8, 'IY-00008', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00008-1-1788933293824', NULL, NULL, '2026-09-09 05:54:53', '2026-09-09 05:54:53'),
(9, 'IY-00009', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 2, 2, 'IY00009-1-1788933764578', NULL, NULL, '2026-09-09 06:02:44', '2026-09-09 06:02:44'),
(10, 'IY-00010', 38, 2, 6, 7, '2026-09-28 04:30:00', '2026-09-30 14:30:00', 3, 'HSR Layout, Sector 2', 'HSR Layout, Sector 2', 1, 1, 32400.00, 598.00, 2000.00, 1749.90, 1500.00, 35247.90, 5000.00, 5, 3, 'IY00010-1-1788933939098', '613345778913056778', '613345778913056778', '2026-09-09 06:05:39', '2026-09-09 06:06:04');

-- --------------------------------------------------------

--
-- Table structure for table `booking_modify`
--

CREATE TABLE `booking_modify` (
  `booking_modify_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `details_order_id` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `city` int(11) NOT NULL,
  `start` varchar(100) NOT NULL,
  `end` varchar(100) NOT NULL,
  `availability` datetime NOT NULL,
  `final_car_price` varchar(100) NOT NULL,
  `gst` varchar(100) NOT NULL,
  `refund` float NOT NULL,
  `total_payable` double NOT NULL,
  `remaining` double DEFAULT 0,
  `remark` text DEFAULT NULL,
  `home_delivery` tinyint(4) DEFAULT NULL,
  `home_delivery_charges` double DEFAULT NULL,
  `address` text DEFAULT NULL,
  `payment_status` tinyint(4) NOT NULL DEFAULT 0,
  `cancel_remark_admin` text DEFAULT NULL,
  `cancel_percentage` float DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_payments`
--

CREATE TABLE `booking_payments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `attempt_no` int(11) NOT NULL DEFAULT 1,
  `amount` decimal(10,2) NOT NULL,
  `payu_txn_id` varchar(100) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 2,
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateway_response`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_payments`
--

INSERT INTO `booking_payments` (`id`, `booking_id`, `attempt_no`, `amount`, `payu_txn_id`, `status`, `gateway_response`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 35247.90, 'IY00001-1-1788928541377', 2, NULL, '2026-09-09 04:35:41', '2026-09-09 04:35:41'),
(2, 2, 1, 35247.90, 'IY00002-1-1788929381620', 2, NULL, '2026-09-09 04:49:41', '2026-09-09 04:49:41'),
(3, 3, 1, 35247.90, 'IY00003-1-1788930415480', 2, NULL, '2026-09-09 05:06:55', '2026-09-09 05:06:55'),
(4, 4, 1, 35247.90, 'IY00004-1-1788930956955', 2, NULL, '2026-09-09 05:15:56', '2026-09-09 05:15:56'),
(5, 5, 1, 35247.90, 'IY00005-1-1788932732117', 2, NULL, '2026-09-09 05:45:32', '2026-09-09 05:45:32'),
(6, 6, 1, 35247.90, 'IY00006-1-1788933048138', 2, NULL, '2026-09-09 05:50:48', '2026-09-09 05:50:48'),
(7, 7, 1, 35247.90, 'IY00007-1-1788933091064', 2, NULL, '2026-09-09 05:51:31', '2026-09-09 05:51:31'),
(8, 8, 1, 35247.90, 'IY00008-1-1788933293824', 2, NULL, '2026-09-09 05:54:53', '2026-09-09 05:54:53'),
(9, 9, 1, 35247.90, 'IY00009-1-1788933764578', 2, NULL, '2026-09-09 06:02:44', '2026-09-09 06:02:44'),
(10, 10, 1, 35247.90, 'IY00010-1-1788933939098', 3, '{\"country\":\"\",\"udf10\":\"\",\"mode\":\"CC\",\"error_Message\":\"No Error\",\"state\":\"\",\"bankcode\":\"\",\"txnid\":\"IY00010-1-1788933939098\",\"net_amount_debit\":\"35247.90\",\"lastname\":\"\",\"zipcode\":\"\",\"phone\":\"7535040111\",\"productinfo\":\"Self Drive Booking IY-00010\",\"hash\":\"719ec660fcf68eab57cc0fe2ccf3e064c72065b7fb8b204e7e85ac832216802332ca0b99af2a25bc5e8469c5de67a9d36dde2ca7fb86b622c57b52ed5826782b\",\"status\":\"success\",\"firstname\":\"7535040111\",\"city\":\"\",\"isConsentPayment\":\"\",\"error\":\"E000\",\"addedon\":\"2026-09-09 11:35:40\",\"udf9\":\"\",\"udf7\":\"\",\"udf8\":\"\",\"encryptedPaymentId\":\"613345778913056778\",\"bank_ref_num\":\"624213956008952000\",\"key\":\"oerEcQ\",\"email\":\"7535040111@inyatri.local\",\"amount\":\"35247.90\",\"unmappedstatus\":\"captured\",\"address2\":\"\",\"payuMoneyId\":\"613345778913056778\",\"address1\":\"\",\"udf5\":\"\",\"mihpayid\":\"613345778913056778\",\"udf6\":\"\",\"udf3\":\"\",\"udf4\":\"\",\"udf1\":\"\",\"udf2\":\"\",\"giftCardIssued\":\"\",\"field1\":\"162443949717\",\"cardnum\":\"XXXXXXXXXXXX2346\",\"field7\":\"AUTHPOSITIVE\",\"field6\":\"02\",\"field9\":\"Transaction is Successful\",\"field8\":\"AUTHORIZED\",\"amount_split\":\"{\\\"PAYU\\\":\\\"35247.90\\\"}\",\"field3\":\"35247.90\",\"field2\":\"433252\",\"field5\":\"00\",\"PG_TYPE\":\"CC-PG\",\"field4\":\"\",\"name_on_card\":\"\"}', '2026-09-09 06:05:39', '2026-09-09 06:06:04');

-- --------------------------------------------------------

--
-- Table structure for table `cab_bookings`
--

CREATE TABLE `cab_bookings` (
  `id` int(11) NOT NULL,
  `trip_type` varchar(20) DEFAULT NULL,
  `pickup_city` varchar(100) DEFAULT NULL,
  `drop_city` varchar(100) DEFAULT NULL,
  `via_cities` text DEFAULT NULL,
  `distance_km` float DEFAULT NULL,
  `car_id` int(11) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cab_pricing`
--

CREATE TABLE `cab_pricing` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `trip_type` enum('oneway','roundtrip','local','airport') DEFAULT NULL,
  `base_fare` int(11) DEFAULT NULL,
  `per_km_price` int(11) DEFAULT NULL,
  `driver_charge` int(11) DEFAULT 0,
  `night_charge` int(11) DEFAULT 0,
  `min_km` int(11) DEFAULT 0,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `car`
--

CREATE TABLE `car` (
  `car_id` int(11) NOT NULL,
  `city` int(11) NOT NULL,
  `place` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `fuel` varchar(100) NOT NULL,
  `seats` varchar(100) NOT NULL,
  `car_type` varchar(100) NOT NULL,
  `made_year` varchar(15) NOT NULL,
  `model` varchar(50) NOT NULL,
  `mileage` varchar(10) NOT NULL,
  `travelled_km` varchar(20) NOT NULL,
  `horsepower` varchar(20) NOT NULL,
  `car_condition` varchar(50) NOT NULL,
  `version` varchar(20) NOT NULL,
  `transmission` varchar(100) NOT NULL,
  `price` varchar(100) NOT NULL,
  `weekend_price` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(100) NOT NULL,
  `home_delivery` varchar(100) DEFAULT NULL,
  `show_top` varchar(4) DEFAULT '0',
  `show_hide` tinyint(4) NOT NULL DEFAULT 1,
  `vehicle_number` varchar(200) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `hide_from` datetime DEFAULT NULL,
  `hide_to` datetime DEFAULT NULL,
  `hide_reason` varchar(200) NOT NULL,
  `sold_from` datetime DEFAULT NULL,
  `sold_to` datetime DEFAULT NULL,
  `sold_remark` varchar(200) NOT NULL,
  `refund_deposit` float NOT NULL DEFAULT 0,
  `home_delivery_charge` float NOT NULL DEFAULT 0,
  `car_lat` float(10,8) DEFAULT NULL,
  `car_long` float(10,8) DEFAULT NULL,
  `car_brand` varchar(200) NOT NULL,
  `car_features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `monthly_price` decimal(10,2) DEFAULT NULL,
  `is_monthly` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car`
--

INSERT INTO `car` (`car_id`, `city`, `place`, `name`, `fuel`, `seats`, `car_type`, `made_year`, `model`, `mileage`, `travelled_km`, `horsepower`, `car_condition`, `version`, `transmission`, `price`, `weekend_price`, `description`, `image`, `home_delivery`, `show_top`, `show_hide`, `vehicle_number`, `created`, `status`, `hide_from`, `hide_to`, `hide_reason`, `sold_from`, `sold_to`, `sold_remark`, `refund_deposit`, `home_delivery_charge`, `car_lat`, `car_long`, `car_brand`, `car_features`, `monthly_price`, `is_monthly`) VALUES
(17, 4, '14th Avenue, Gaur City 2, Ghaziabad, Uttar Pradesh, India', 'XUV700', 'Diesel', '7', 'SUV', '2023', 'AX7', '16', '53000', '', 'Fair', '', 'Automatic', '270', '280', 'Home delivery available', 'uploads/car/6996eb213e1cc.jpeg', '1', '1', 1, 'HR51CQ9793', '2026-02-19 10:51:13', 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '', 10000, 2000, 28.62194824, 77.41998291, 'MAHINDRA & MAHINDRA LIMITED', '[\"Small sunroof\",\"Panaromic sunroof\",\"All power windows\",\"Music system\",\"8 Airbags\",\"FM Radio\",\"Parking sensors\"]', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `car_name` varchar(200) NOT NULL,
  `vehicle_number` varchar(50) NOT NULL,
  `brand_id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `location` varchar(300) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `fuel_type` enum('petrol','diesel','cng') NOT NULL,
  `car_type_id` int(11) NOT NULL,
  `transmission` enum('manual','automatic') NOT NULL,
  `seats` tinyint(4) NOT NULL,
  `made_year` smallint(6) NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `mileage` varchar(50) DEFAULT NULL,
  `horsepower` varchar(50) DEFAULT NULL,
  `car_condition` varchar(100) DEFAULT NULL,
  `version` varchar(100) DEFAULT NULL,
  `travelled_km` int(11) NOT NULL,
  `travelling_allowed_per_day` int(11) NOT NULL COMMENT 'Max km allowed per rental day',
  `extra_charge_per_km` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Charge per km when daily limit exceeded',
  `price_per_hour` decimal(10,2) DEFAULT NULL,
  `weekend_price_per_hour` decimal(10,2) DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `main_image` varchar(500) DEFAULT NULL,
  `enable_monthly_subscription` tinyint(4) NOT NULL DEFAULT 0,
  `discount_15_days` decimal(5,2) NOT NULL DEFAULT 0.00,
  `discount_1_month` decimal(5,2) NOT NULL DEFAULT 0.00,
  `discount_3_months` decimal(5,2) NOT NULL DEFAULT 0.00,
  `discount_6_months` decimal(5,2) NOT NULL DEFAULT 0.00,
  `sold_from` datetime DEFAULT NULL,
  `sold_to` datetime DEFAULT NULL,
  `sold_remark` text DEFAULT NULL,
  `refundable_deposit` decimal(10,2) NOT NULL DEFAULT 5000.00,
  `home_delivery_charge` decimal(10,2) NOT NULL DEFAULT 2000.00,
  `show_on_top` tinyint(4) NOT NULL DEFAULT 0,
  `home_delivery_available` tinyint(4) NOT NULL DEFAULT 0,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `price_per_day` decimal(10,2) DEFAULT NULL COMMENT 'Self-drive daily rate; falls back to price_per_hour * 24'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`id`, `car_name`, `vehicle_number`, `brand_id`, `city_id`, `location`, `latitude`, `longitude`, `fuel_type`, `car_type_id`, `transmission`, `seats`, `made_year`, `model`, `mileage`, `horsepower`, `car_condition`, `version`, `travelled_km`, `travelling_allowed_per_day`, `extra_charge_per_km`, `price_per_hour`, `weekend_price_per_hour`, `short_description`, `main_image`, `enable_monthly_subscription`, `discount_15_days`, `discount_1_month`, `discount_3_months`, `discount_6_months`, `sold_from`, `sold_to`, `sold_remark`, `refundable_deposit`, `home_delivery_charge`, `show_on_top`, `home_delivery_available`, `status`, `created_at`, `updated_at`, `price_per_day`) VALUES
(1, 'Hyundai Creta SX', 'MH12CD2002', 2, 4, 'Baner, Pune', 18.55900000, 73.78680000, 'diesel', 2, 'automatic', 5, 2023, 'Creta', '18.4 kmpl', '115 BHP', 'Like New', 'SX Diesel AT', 9200, 300, 15.00, 850.00, 1100.00, 'Premium SUV with sunroof, perfect for family outings.', 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374717/inyatri/cars/j5gotdib5ev7l9fmnasi.jpg', 1, 8.00, 12.00, 15.00, 22.00, NULL, NULL, NULL, 8000.00, 2500.00, 1, 1, 1, '2026-09-03 08:30:03', '2026-09-03 08:30:03', NULL),
(2, 'Maruti Swift VXI', 'MH12AB1001', 1, 6, 'Koregaon Park, Pune', 18.53620000, 73.89580000, 'petrol', 1, 'manual', 5, 2022, 'Swift', '23.2 kmpl', '89 BHP', 'Excellent', 'VXI', 18500, 200, 10.00, 450.00, 600.00, 'Compact hatchback, ideal for city drives and short trips.', 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374717/inyatri/cars/j5gotdib5ev7l9fmnasi.jpg', 0, 5.00, 8.00, 12.00, 18.00, NULL, NULL, NULL, 5000.00, 2000.00, 0, 1, 1, '2026-09-03 08:31:22', '2026-09-03 08:31:22', NULL),
(3, 'Toyota Innova Crysta GX', 'MH12EF3003', 3, 8, 'Hinjewadi, Pune', 18.59120000, 73.73890000, 'diesel', 3, 'manual', 7, 2021, 'Innova Crysta', '14.1 kmpl', '150 BHP', 'Good', 'GX 7 STR', 52000, 350, 18.00, 950.00, 1250.00, 'Spacious 7-seater MUV for group travel and outstation trips.', 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374717/inyatri/cars/j5gotdib5ev7l9fmnasi.jpg', 1, 6.00, 10.00, 14.00, 20.00, NULL, NULL, NULL, 10000.00, 3000.00, 0, 1, 1, '2026-09-03 08:31:45', '2026-09-03 08:31:45', NULL),
(4, 'Maruti WagonR CNG LXI', 'MH12GH4004', 1, 10, 'Andheri West, Mumbai', 19.13640000, 72.82960000, 'cng', 1, 'manual', 5, 2020, 'WagonR', '32.5 km/kg', '67 BHP', 'Fair', 'LXI CNG', 68000, 180, 8.00, 350.00, 450.00, 'Economical CNG car for daily commute and budget rentals.', 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374717/inyatri/cars/j5gotdib5ev7l9fmnasi.jpg', 0, 4.00, 6.00, 10.00, 15.00, NULL, NULL, NULL, 4000.00, 1500.00, 0, 0, 1, '2026-09-03 08:32:06', '2026-09-03 08:32:06', NULL),
(5, 'Honda City ZX CVT', 'MH12IJ5005', 4, 12, 'Bandra Kurla Complex, Mumbai', 19.06630000, 72.86790000, 'petrol', 4, 'automatic', 5, 2024, 'City', '17.8 kmpl', '121 BHP', 'Brand New', 'ZX CVT', 3200, 250, 12.00, 750.00, 950.00, 'Premium sedan with ADAS and leather interiors for business travel.', 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374717/inyatri/cars/j5gotdib5ev7l9fmnasi.jpg', 1, 7.00, 11.00, 16.00, 25.00, NULL, NULL, NULL, 7000.00, 2200.00, 1, 1, 1, '2026-09-03 08:32:36', '2026-09-03 08:32:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `car_additional_images`
--

CREATE TABLE `car_additional_images` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `sort_order` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_additional_images`
--

INSERT INTO `car_additional_images` (`id`, `car_id`, `image_url`, `sort_order`) VALUES
(1, 1, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/k7wrp1ducfutuiwv5vsm.jpg', 1),
(2, 1, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/iroii5rueeskaiknfjqz.jpg', 2),
(3, 1, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/wbgv9lxg07bt9ncetrwd.jpg', 3),
(4, 1, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/gzyiyuznxw64om2byfjz.jpg', 4),
(5, 2, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/k7wrp1ducfutuiwv5vsm.jpg', 1),
(6, 2, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/iroii5rueeskaiknfjqz.jpg', 2),
(7, 2, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/wbgv9lxg07bt9ncetrwd.jpg', 3),
(8, 2, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/gzyiyuznxw64om2byfjz.jpg', 4),
(9, 3, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/k7wrp1ducfutuiwv5vsm.jpg', 1),
(10, 3, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/iroii5rueeskaiknfjqz.jpg', 2),
(11, 3, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/wbgv9lxg07bt9ncetrwd.jpg', 3),
(12, 3, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/gzyiyuznxw64om2byfjz.jpg', 4),
(13, 4, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/k7wrp1ducfutuiwv5vsm.jpg', 1),
(14, 4, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/iroii5rueeskaiknfjqz.jpg', 2),
(15, 4, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/wbgv9lxg07bt9ncetrwd.jpg', 3),
(16, 4, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/gzyiyuznxw64om2byfjz.jpg', 4),
(17, 5, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/k7wrp1ducfutuiwv5vsm.jpg', 1),
(18, 5, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/iroii5rueeskaiknfjqz.jpg', 2),
(19, 5, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/wbgv9lxg07bt9ncetrwd.jpg', 3),
(20, 5, 'https://res.cloudinary.com/iqzpa4vm/image/upload/v1788374764/inyatri/cars/gzyiyuznxw64om2byfjz.jpg', 4);

-- --------------------------------------------------------

--
-- Table structure for table `car_availability`
--

CREATE TABLE `car_availability` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `available_from` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `car_brands`
--

CREATE TABLE `car_brands` (
  `id` int(11) NOT NULL,
  `brand_name` varchar(50) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_brands`
--

INSERT INTO `car_brands` (`id`, `brand_name`, `status`, `created_at`) VALUES
(1, 'AUDI', 1, '2025-08-31 06:58:47'),
(2, 'TOYOTA', 1, '2025-08-31 06:59:03'),
(3, 'BMW', 1, '2025-08-31 06:59:03'),
(4, 'HONDA', 1, '2025-08-31 06:59:03'),
(5, 'HYUNDAI', 1, '2025-08-31 06:59:03'),
(6, 'KIA', 1, '2025-08-31 06:59:03'),
(7, 'JAGUAR', 1, '2025-08-31 06:59:03'),
(8, 'LEXUS', 1, '2025-08-31 06:59:03'),
(9, 'MAHINDRA & MAHINDRA LIMITED', 1, '2025-08-31 06:59:03'),
(10, 'NISSAN', 1, '2025-08-31 06:59:03'),
(11, 'SUBARU', 1, '2025-08-31 06:59:03'),
(12, 'TATA MOTORS', 1, '2025-08-31 06:59:03'),
(13, 'ALFA ROMEO', 1, '2025-08-31 06:59:03'),
(14, 'BENTLEY', 1, '2025-08-31 06:59:03'),
(15, 'BUICK', 1, '2025-08-31 06:59:03'),
(16, 'FERRARI', 1, '2025-08-31 06:59:03'),
(17, 'LAMBORGHINI', 1, '2025-08-31 06:59:03'),
(18, 'MARUTI SUZUKI', 1, '2025-08-31 06:59:03'),
(19, 'MAZDA', 1, '2025-08-31 06:59:03'),
(20, 'PORSCHE', 1, '2025-08-31 06:59:03'),
(21, 'VOLKSWAGEN', 1, '2025-08-31 06:59:03'),
(22, 'FORD', 1, '2025-08-31 06:59:03');

-- --------------------------------------------------------

--
-- Table structure for table `car_features`
--

CREATE TABLE `car_features` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_features`
--

INSERT INTO `car_features` (`id`, `name`, `status`, `created_at`) VALUES
(1, 'Small sunroof', 1, '2025-08-31 07:08:31'),
(2, 'Panaromic sunroof', 1, '2025-08-31 07:08:31'),
(3, 'All power windows', 1, '2025-08-31 07:08:52'),
(4, 'Music system', 1, '2025-08-31 07:08:52'),
(5, '2 Airbags', 1, '2025-08-31 07:09:03'),
(6, '4 Airbags', 1, '2025-08-31 07:09:23'),
(7, '6 Airbags', 1, '2025-08-31 07:09:23'),
(8, '8 Airbags', 1, '2025-08-31 07:09:23'),
(9, '12 Airbags', 1, '2025-08-31 07:09:23'),
(10, 'FM Radio', 1, '2025-08-31 07:09:23'),
(11, 'Parking sensors', 1, '2025-08-31 07:09:23');

-- --------------------------------------------------------

--
-- Table structure for table `car_feature_map`
--

CREATE TABLE `car_feature_map` (
  `car_id` int(11) NOT NULL,
  `feature_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_feature_map`
--

INSERT INTO `car_feature_map` (`car_id`, `feature_id`) VALUES
(1, 1),
(1, 2),
(1, 4),
(1, 5),
(2, 1),
(2, 2),
(2, 3),
(3, 1),
(3, 2),
(3, 3),
(3, 6),
(4, 1),
(4, 2),
(5, 1),
(5, 2),
(5, 3),
(5, 4),
(5, 5);

-- --------------------------------------------------------

--
-- Table structure for table `car_hide_history`
--

CREATE TABLE `car_hide_history` (
  `id` int(11) NOT NULL,
  `hide_from` datetime NOT NULL,
  `hide_to` datetime NOT NULL,
  `car_id` int(11) NOT NULL,
  `hide_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `car_hide_history`
--

INSERT INTO `car_hide_history` (`id`, `hide_from`, `hide_to`, `car_id`, `hide_reason`, `created_at`, `updated_at`) VALUES
(17324, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0, '', '2025-09-02 11:04:48', '2025-09-02 11:04:48'),
(17325, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0, '', '2025-09-02 12:15:54', '2025-09-02 12:15:54'),
(17326, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0, '', '2025-09-02 12:31:14', '2025-09-02 12:31:14'),
(17327, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0, '', '2025-09-02 12:45:17', '2025-09-02 12:45:17'),
(17330, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 3, '', '2025-09-04 09:37:40', '2025-09-04 09:37:40'),
(17331, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 4, '', '2025-09-04 11:00:43', '2025-09-04 11:00:43'),
(17334, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 1, '', '2025-09-04 11:06:09', '2025-09-04 11:06:09'),
(17336, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 6, '', '2025-09-04 11:23:13', '2025-09-04 11:23:13'),
(17337, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 7, '', '2025-09-04 11:31:52', '2025-09-04 11:31:52'),
(17338, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 8, '', '2025-09-04 11:45:23', '2025-09-04 11:45:23'),
(17339, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 9, '', '2025-09-04 11:54:51', '2025-09-04 11:54:51'),
(17340, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 10, '', '2025-09-04 11:59:16', '2025-09-04 11:59:16'),
(17341, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 2, '', '2025-09-05 13:41:00', '2025-09-05 13:41:00'),
(17342, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 11, '', '2025-09-24 14:25:03', '2025-09-24 14:25:03'),
(17347, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 5, '', '2025-09-25 11:23:42', '2025-09-25 11:23:42'),
(17348, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 16, '', '2026-01-30 08:13:35', '2026-01-30 08:13:35'),
(17349, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 17, '', '2026-02-19 10:51:13', '2026-02-19 10:51:13');

-- --------------------------------------------------------

--
-- Table structure for table `car_images`
--

CREATE TABLE `car_images` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_images`
--

INSERT INTO `car_images` (`id`, `car_id`, `image`, `status`) VALUES
(13, 0, 'uploads/car/68b6e392a8f09.jpeg', 1),
(14, 0, 'uploads/car/68b6e392aa4be.jpeg', 1),
(15, 0, 'uploads/car/68b6e392aa7e1.jpeg', 1),
(16, 0, 'uploads/car/68b6e392aaaac.jpeg', 1),
(17, 0, 'uploads/car/68b6e6dd7aa45.jpeg', 1),
(18, 0, 'uploads/car/68b6e6dd7ad38.jpeg', 1),
(19, 0, 'uploads/car/68b6e6dd7af7e.jpeg', 1),
(20, 0, 'uploads/car/68b6e6dd7b178.jpeg', 1),
(21, 1, 'uploads/car/68b6e8d73b409.jpeg', 1),
(22, 1, 'uploads/car/68b6e8d73b691.jpeg', 1),
(23, 1, 'uploads/car/68b6e8d73b8f2.jpeg', 1),
(24, 1, 'uploads/car/68b6e8d73bb29.jpeg', 1),
(25, 2, 'uploads/car/fortuner_10.jpeg', 1),
(26, 2, 'uploads/car/68b9591d300f6.jpeg', 1),
(27, 2, 'uploads/car/fortuner_9.jpeg', 1),
(28, 2, 'uploads/car/68b9591d30580.jpeg', 1),
(29, 3, 'uploads/car/68b95de4192f3.jpeg', 1),
(30, 3, 'uploads/car/68b95de4195b8.jpeg', 1),
(31, 3, 'uploads/car/68b95de4197d3.jpeg', 1),
(32, 3, 'uploads/car/68b95de4199e4.jpeg', 1),
(33, 4, 'uploads/car/68b9715b456ce.jpeg', 1),
(34, 4, 'uploads/car/68b9715b459e1.jpeg', 1),
(35, 4, 'uploads/car/68b9715b45c93.jpeg', 1),
(36, 4, 'uploads/car/68b9715b45ed5.jpeg', 1),
(37, 5, 'uploads/car/2.jpg', 1),
(38, 5, 'uploads/car/3.jpg', 1),
(39, 5, 'uploads/car/4.jpg', 1),
(40, 5, 'uploads/car/1.jpg', 1),
(41, 6, 'uploads/car/68b976a142678.jpeg', 1),
(42, 6, 'uploads/car/68b976a142962.jpeg', 1),
(43, 6, 'uploads/car/68b976a142bca.jpeg', 1),
(44, 6, 'uploads/car/68b976a142e1f.jpeg', 1),
(45, 7, 'uploads/car/68b978a82b214.jpeg', 1),
(46, 7, 'uploads/car/68b978a82b6ee.jpeg', 1),
(47, 7, 'uploads/car/68b978a82bb65.jpeg', 1),
(48, 7, 'uploads/car/68b978a82c1d1.jpeg', 1),
(49, 8, 'uploads/car/68b97bd3ec9be.jpeg', 1),
(50, 8, 'uploads/car/68b97bd3ecc13.jpeg', 1),
(51, 8, 'uploads/car/68b97bd3ecd90.jpeg', 1),
(52, 8, 'uploads/car/68b97bd3ecf14.jpeg', 1),
(53, 9, 'uploads/car/68b97e0bbd1ae.jpeg', 1),
(54, 9, 'uploads/car/68b97e0bbd37e.jpeg', 1),
(55, 9, 'uploads/car/68b97e0bbd556.jpeg', 1),
(56, 9, 'uploads/car/68b97e0bbd704.jpeg', 1),
(57, 10, 'uploads/car/68b97f14dacf8.jpeg', 1),
(58, 10, 'uploads/car/68b97f14db3bb.jpeg', 1),
(59, 10, 'uploads/car/68b97f14db798.jpeg', 1),
(60, 10, 'uploads/car/68b97f14db960.jpeg', 1),
(61, 11, 'uploads/car/68d3ff3f78ab2.png', 1),
(62, 11, 'uploads/car/68d3ff3f78e68.png', 1),
(63, 11, 'uploads/car/68d3ff3f791b0.png', 1),
(64, 11, 'uploads/car/68d3ff3f79541.png', 1),
(65, 16, 'uploads/car/697c682fb5212.jpg', 1),
(66, 16, 'uploads/car/697c682fb54b4.jpg', 1),
(67, 16, 'uploads/car/697c682fb5742.jpg', 1),
(68, 16, 'uploads/car/697c682fb59d4.jpg', 1),
(69, 17, 'uploads/car/6996eb213f89b.jpeg', 1),
(70, 17, 'uploads/car/6996eb21402c1.jpeg', 1),
(71, 17, 'uploads/car/6996eb21405cc.jpeg', 1),
(72, 17, 'uploads/car/6996eb2140a8a.jpeg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `car_subscriptions`
--

CREATE TABLE `car_subscriptions` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_subscriptions`
--

INSERT INTO `car_subscriptions` (`id`, `car_id`, `duration_days`, `discount_percent`, `created_at`) VALUES
(13, 16, 15, 10.00, '2026-01-30 08:13:35'),
(14, 16, 30, 15.00, '2026-01-30 08:13:35'),
(15, 16, 90, 20.00, '2026-01-30 08:13:35'),
(16, 16, 180, 30.00, '2026-01-30 08:13:35'),
(17, 17, 15, 22.00, '2026-02-19 10:51:13'),
(18, 17, 30, 36.00, '2026-02-19 10:51:13'),
(19, 17, 90, 40.00, '2026-02-19 10:51:13'),
(20, 17, 180, 48.00, '2026-02-19 10:51:13');

-- --------------------------------------------------------

--
-- Table structure for table `car_types`
--

CREATE TABLE `car_types` (
  `id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_types`
--

INSERT INTO `car_types` (`id`, `type_name`, `status`, `created_at`) VALUES
(1, 'Hatchback', 1, '2026-09-02 22:58:30'),
(2, 'Sedan', 1, '2026-09-02 22:58:30'),
(3, 'SUV', 1, '2026-09-02 22:58:30'),
(4, 'XUV', 1, '2026-09-02 22:58:30'),
(5, 'MUV', 1, '2026-09-02 22:58:30'),
(6, 'MPV', 1, '2026-09-02 22:58:30'),
(7, 'Crossover', 1, '2026-09-02 22:58:30'),
(8, 'Coupe', 1, '2026-09-02 22:58:30'),
(9, 'Convertible', 1, '2026-09-02 22:58:30'),
(10, 'Wagon / Station Wagon', 1, '2026-09-02 22:58:30'),
(11, 'Pickup Truck', 1, '2026-09-02 22:58:30'),
(12, 'Sports Car', 1, '2026-09-02 22:58:30'),
(13, 'Luxury Car', 1, '2026-09-02 22:58:30'),
(14, 'Supercar', 1, '2026-09-02 22:58:30'),
(15, 'Microcar', 1, '2026-09-02 22:58:30'),
(16, 'Compact SUV', 1, '2026-09-02 22:58:30'),
(17, 'Subcompact SUV', 1, '2026-09-02 22:58:30'),
(18, 'Full-Size SUV', 1, '2026-09-02 22:58:30'),
(19, 'Minivan', 1, '2026-09-02 22:58:30'),
(20, 'Electric Vehicle (EV)', 1, '2026-09-02 22:58:30');

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

CREATE TABLE `city` (
  `city_id` int(11) NOT NULL,
  `short_name` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `image` varchar(200) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `city`
--

INSERT INTO `city` (`city_id`, `short_name`, `name`, `address`, `image`, `status`) VALUES
(1, 'ASR', 'Amritsar', 'Amritsar', '', 0),
(2, 'CHD', 'Chandigarh', 'Chandigarh', '', 0),
(3, 'DDN', 'Dehradun', 'Dehradun', '', 0),
(4, 'DL', 'Delhi NCR', 'Delhi NCR', 'uploads/city/1738908627.png', 1),
(5, 'Chandigarh', 'Chandigarh', 'Taxi stand, Near Batra Cinema, Sector - 37B, Chandigarh - 160036', 'uploads/city/1738908615.png', 0),
(6, 'Goa', 'Goa', 'Camotim Vaddo, Candolim, Goa 403515', 'uploads/city/1738908601.png', 1),
(7, 'Guwahati', 'Guwahati', 'Unique Plaza, Bali Baat, Rukminigaon, Guwahati, Assam', 'uploads/city/1693903494.jpg', 0),
(8, 'Guwahati', 'Guwahati', 'Yashica Mansion 3 \r\nDowntown Zakir Hussain Road,Bye lane no 5', 'uploads/city/1738908587.png', 1),
(9, 'Indore', 'Indore', 'Vijay Nagar, Indore, Madhya Pradesh', 'uploads/city/1720589091.jpg', 0),
(10, 'Lucknow', 'Lucknow', 'Flat No. 1007, 10th Floor, Skyline Plaza-3, Sushant Golf City, Lucknow.', 'uploads/city/1738908523.png', 1),
(11, 'Amritsar', 'Amritsar', 'S404, Basant Avenue, Near Rajender Public School, Amritsar 143001', 'uploads/city/1738908569.png', 1),
(12, 'Indore', 'Indore', 'Mangal city, AB Rd, Scheme 54 PU4, Indore, Madhya Pradesh 452010', 'uploads/city/1738908558.png', 1);

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `discount_percent` decimal(5,2) NOT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `min_base_rental_amount` decimal(10,2) DEFAULT NULL,
  `valid_from` datetime NOT NULL,
  `valid_to` datetime NOT NULL,
  `usage_limit` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited',
  `used_count` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `title`, `description`, `discount_percent`, `max_discount_amount`, `min_base_rental_amount`, `valid_from`, `valid_to`, `usage_limit`, `used_count`, `status`, `created_at`, `updated_at`) VALUES
(1, 'WKND25', 'Flat 25% off weekend rentals', 'Max ₹600 · valid till 30 May', 25.00, 600.00, 2000.00, '2026-09-01 00:00:00', '2026-09-30 23:59:59', 100, 0, 1, '2026-09-09 03:35:18', '2026-09-09 03:35:18'),
(7, 'WKND45', 'Weekend 25% Off', 'Get 25% off on base rental for weekend bookings.', 25.00, 1500.00, 3000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 0, 1, 1, '0000-00-00 00:00:00', '2026-09-09 06:06:04'),
(8, 'FIRST500', 'First Booking ₹500 Off', 'Flat discount for first-time self-drive users (max ₹500).', 10.00, 500.00, 2000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 100, 0, 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(9, 'SAVE15', 'Save 15%', '15% off on any eligible rental with no minimum amount.', 15.00, 1000.00, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 0, 0, 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(10, 'FLAT300', 'Flat ₹300 Off', '₹300 off when base rental is ₹2500 or more.', 12.00, 300.00, 2500.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 50, 0, 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(11, 'TEST100', 'Test Coupon 100% (Dev Only)', 'Full base rental discount for local testing only.', 100.00, 5000.00, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 10, 0, 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usages`
--

CREATE TABLE `coupon_usages` (
  `id` int(11) NOT NULL,
  `coupon_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `applied_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupon_usages`
--

INSERT INTO `coupon_usages` (`id`, `coupon_id`, `user_id`, `booking_id`, `discount_amount`, `applied_at`) VALUES
(1, 7, 38, 10, 1500.00, '2026-09-09 06:06:04');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `documents_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `doc1` varchar(200) NOT NULL,
  `doc1status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = pending\r\n2= approved\r\n3 = rejected',
  `doc2` varchar(200) NOT NULL,
  `doc2status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = pending\r\n2 = approved\r\n3 = rejected',
  `license` varchar(200) NOT NULL,
  `licensestatus` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = pending\r\n2 = approved\r\n3 = rejected',
  `pan` varchar(200) DEFAULT NULL,
  `panstatus` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = pending\r\n2 = approved\r\n3 = rejected',
  `others` varchar(255) DEFAULT NULL,
  `othersstatus` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1 = pending\r\n2 = approved\r\n3 = rejected',
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `doc_status` varchar(20) NOT NULL DEFAULT 'Pending',
  `status_remark` varchar(255) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`documents_id`, `user_id`, `doc1`, `doc1status`, `doc2`, `doc2status`, `license`, `licensestatus`, `pan`, `panstatus`, `others`, `othersstatus`, `created`, `doc_status`, `status_remark`, `status`) VALUES
(467, 32, 'uploads/documents/doc1_1787050020.png', 1, '', 1, '', 1, NULL, 1, NULL, 1, '2026-08-18 10:47:00', 'Pending', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(50) NOT NULL,
  `login_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `user_id`, `ip_address`, `login_time`) VALUES
(1, 1, '::1', '2025-07-24 20:27:37'),
(2, 1, '::1', '2025-07-25 11:19:16'),
(3, 1, '::1', '2025-07-25 11:19:35'),
(4, 1, '::1', '2025-07-25 11:24:07'),
(5, 1, '::1', '2025-07-30 12:16:24'),
(6, 1, '::1', '2025-08-26 08:46:26'),
(7, 1, '::1', '2025-08-26 08:57:16'),
(8, 1, '::1', '2025-08-26 11:47:01'),
(9, 1, '::1', '2025-08-26 11:53:49'),
(10, 1, '::1', '2025-08-26 11:55:45'),
(11, 1, '::1', '2025-08-26 11:58:01'),
(12, 1, '::1', '2025-08-26 12:58:26'),
(13, 1, '::1', '2025-09-01 19:17:41'),
(14, 1, '::1', '2025-09-02 08:07:44'),
(15, 9, '106.219.166.216', '2025-09-02 11:07:55'),
(16, 10, '106.219.166.216', '2025-09-02 11:09:30'),
(17, 10, '49.36.188.184', '2025-09-04 14:24:58'),
(18, 10, '106.219.161.214', '2025-09-05 11:11:42'),
(19, 1, '157.49.80.235', '2025-09-05 11:34:52'),
(20, 10, '223.237.26.54', '2025-09-05 14:12:48'),
(21, 12, '152.58.120.200', '2025-09-20 18:42:57'),
(22, 1, '157.49.57.93', '2025-09-23 16:25:45'),
(23, 1, '157.49.177.134', '2025-09-27 10:48:06'),
(24, 1, '157.49.177.73', '2025-09-27 11:38:43'),
(25, 1, '157.49.177.73', '2025-09-27 11:43:33'),
(26, 1, '157.49.78.193', '2025-09-30 15:20:41'),
(27, 1, '49.36.188.172', '2025-10-03 11:30:46'),
(28, 1, '49.36.188.172', '2025-10-03 12:48:23'),
(29, 1, '49.36.188.172', '2025-10-03 12:54:27'),
(30, 1, '49.36.188.232', '2025-10-04 07:19:49'),
(31, 1, '49.36.188.232', '2025-10-04 07:47:03'),
(32, 11, '223.228.214.155', '2025-10-04 07:54:18'),
(33, 1, '49.36.188.232', '2025-10-04 10:06:46'),
(34, 1, '49.36.188.232', '2025-10-04 10:09:24'),
(35, 1, '49.36.188.232', '2025-10-04 10:26:55'),
(36, 1, '49.36.188.232', '2025-10-04 10:27:09'),
(37, 1, '49.36.188.232', '2025-10-04 10:27:17'),
(38, 10, '49.36.188.232', '2025-10-04 10:37:20'),
(39, 10, '49.36.188.232', '2025-10-04 10:37:54'),
(40, 17, '49.36.188.232', '2025-10-04 10:38:50'),
(41, 11, '223.228.214.155', '2025-10-04 11:20:20'),
(42, 17, '106.219.166.67', '2025-10-06 07:16:06'),
(43, 1, '49.36.188.172', '2025-10-06 08:22:11'),
(44, 1, '49.36.188.172', '2025-10-06 08:22:26'),
(45, 1, '49.36.188.172', '2025-10-06 08:22:34'),
(46, 17, '106.219.166.67', '2025-10-06 08:28:50'),
(47, 17, '106.219.166.67', '2025-10-06 08:32:00'),
(48, 17, '106.219.166.67', '2025-10-06 08:45:15'),
(49, 18, '106.219.166.67', '2025-10-06 08:47:20'),
(50, 17, '106.219.166.67', '2025-10-06 09:57:11'),
(51, 19, '106.219.166.67', '2025-10-06 11:47:03'),
(52, 1, '49.36.190.2', '2025-10-06 18:58:33'),
(53, 20, '106.219.160.157', '2025-10-07 08:45:00'),
(54, 1, '157.49.36.118', '2025-10-07 09:04:43'),
(55, 1, '49.36.190.2', '2025-10-07 09:08:38'),
(56, 21, '103.55.90.54', '2025-10-08 04:52:20'),
(57, 11, '106.219.166.191', '2025-10-12 13:13:36'),
(58, 22, '106.219.228.247', '2025-11-11 11:47:57'),
(59, 17, '49.47.71.107', '2025-12-22 11:42:37'),
(60, 17, '49.47.71.107', '2025-12-22 11:42:43'),
(61, 23, '106.221.230.9', '2025-12-24 03:47:43'),
(62, 17, '49.47.68.57', '2025-12-24 10:04:33'),
(63, 17, '49.47.68.57', '2025-12-24 10:04:41'),
(64, 24, '122.161.72.199', '2026-01-07 12:03:36'),
(65, 25, '49.36.186.162', '2026-01-30 08:19:10'),
(66, 25, '49.36.186.162', '2026-01-30 08:19:12'),
(67, 25, '223.237.25.92', '2026-01-30 08:27:54'),
(68, 25, '49.36.186.162', '2026-01-30 09:41:21'),
(69, 25, '49.36.186.162', '2026-01-30 09:41:32'),
(70, 25, '49.36.186.162', '2026-01-30 09:48:00'),
(71, 25, '49.36.186.162', '2026-01-30 09:51:29'),
(72, 25, '49.36.186.162', '2026-01-30 09:51:40'),
(73, 25, '49.36.186.162', '2026-01-30 09:51:58'),
(74, 26, '49.36.186.162', '2026-01-30 09:52:53'),
(75, 26, '49.36.186.162', '2026-01-30 09:53:05'),
(76, 26, '49.36.186.162', '2026-01-30 09:53:35'),
(77, 26, '49.36.186.162', '2026-01-30 09:53:54'),
(78, 26, '49.36.186.162', '2026-01-30 09:54:11'),
(79, 26, '49.36.186.162', '2026-01-30 09:55:26'),
(80, 27, '49.36.186.162', '2026-01-30 09:56:35'),
(81, 27, '49.36.186.162', '2026-01-30 10:11:08'),
(82, 27, '49.36.186.162', '2026-01-30 10:16:15'),
(83, 27, '49.36.186.162', '2026-01-30 10:27:10'),
(84, 27, '49.36.186.162', '2026-01-30 10:40:44'),
(85, 27, '49.36.186.162', '2026-01-30 11:01:59'),
(86, 27, '49.36.186.162', '2026-01-30 11:04:35'),
(87, 27, '49.36.186.162', '2026-01-30 11:07:07'),
(88, 27, '49.36.186.162', '2026-01-30 11:12:03'),
(89, 27, '49.36.186.162', '2026-01-30 11:16:49'),
(90, 27, '49.36.186.162', '2026-01-30 11:19:57'),
(91, 27, '49.36.186.162', '2026-01-30 11:38:52'),
(92, 27, '49.36.186.162', '2026-01-30 11:42:07'),
(93, 27, '49.36.186.162', '2026-01-30 11:43:03'),
(94, 27, '49.36.186.162', '2026-01-30 11:46:47'),
(95, 27, '49.36.184.208', '2026-02-16 06:08:19'),
(96, 24, '122.161.68.149', '2026-02-19 10:58:37'),
(97, 11, '122.161.68.149', '2026-02-19 10:59:57'),
(98, 28, '122.161.68.149', '2026-02-19 11:07:56'),
(99, 28, '::1', '2026-03-24 08:21:14'),
(100, 28, '::1', '2026-03-24 08:31:41'),
(101, 28, '::1', '2026-03-24 08:42:12'),
(102, 28, '::1', '2026-03-26 08:14:46'),
(103, 28, '::1', '2026-03-26 09:02:08'),
(104, 28, '::1', '2026-03-26 09:19:44'),
(105, 28, '::1', '2026-03-26 09:45:17'),
(106, 29, '::1', '2026-03-26 09:55:00'),
(107, 28, '::1', '2026-03-26 10:03:27'),
(108, 28, '::1', '2026-03-26 10:14:52'),
(109, 28, '::1', '2026-04-17 09:04:35'),
(110, 28, '::1', '2026-04-17 09:05:13'),
(111, 28, '::1', '2026-04-17 09:32:56'),
(112, 28, '::1', '2026-04-17 10:34:16'),
(113, 28, '::1', '2026-05-31 13:08:28'),
(114, 28, '::1', '2026-06-10 08:34:07'),
(115, 30, '::1', '2026-08-18 11:18:03'),
(116, 32, '::1', '2026-08-18 12:44:40'),
(117, 33, '::1', '2026-08-18 20:07:18'),
(118, 34, '::1', '2026-08-18 20:26:52'),
(119, 35, '::1', '2026-08-18 20:33:37'),
(120, 32, '::1', '2026-08-19 07:20:56'),
(121, 32, '::1', '2026-08-21 06:49:04');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `settings_id` int(11) NOT NULL,
  `type` longtext NOT NULL,
  `description` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`settings_id`, `type`, `description`) VALUES
(2, 'system_title', 'Admin Dashboard'),
(3, 'email', 'hello@happyeasyrides.com'),
(4, 'phone', '9289044919'),
(5, 'address', 'FF20, 14th Avenue High Street,\r\nCommercial Market, Gaur City 201318'),
(6, 'session', '2025'),
(7, 'refund', '5000'),
(8, 'header-background', 'bg-light header-text-dark'),
(9, 'menubar-background', 'bg-danger sidebar-text-light'),
(10, 'home_delivery', '2000'),
(11, 'gst', '18'),
(12, 'pick_start_time', '2025-04-17'),
(13, 'pick_end_time', '2025-04-21'),
(14, 'price_increase_percentage', '10'),
(15, 'price_decrease_percentage', ''),
(16, 'down_start_time', ''),
(17, 'down_end_time', '');

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` int(11) NOT NULL,
  `state_name` varchar(100) NOT NULL,
  `country_code` char(2) NOT NULL DEFAULT 'IN',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=active 2=inactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `states`
--

INSERT INTO `states` (`id`, `state_name`, `country_code`, `status`) VALUES
(1, 'Andhra Pradesh', 'IN', 1),
(2, 'Arunachal Pradesh', 'IN', 1),
(3, 'Assam', 'IN', 1),
(4, 'Bihar', 'IN', 1),
(5, 'Chhattisgarh', 'IN', 1),
(6, 'Goa', 'IN', 1),
(7, 'Gujarat', 'IN', 1),
(8, 'Haryana', 'IN', 1),
(9, 'Himachal Pradesh', 'IN', 1),
(10, 'Jharkhand', 'IN', 1),
(11, 'Karnataka', 'IN', 1),
(12, 'Kerala', 'IN', 1),
(13, 'Madhya Pradesh', 'IN', 1),
(14, 'Maharashtra', 'IN', 1),
(15, 'Manipur', 'IN', 1),
(16, 'Meghalaya', 'IN', 1),
(17, 'Mizoram', 'IN', 1),
(18, 'Nagaland', 'IN', 1),
(19, 'Odisha', 'IN', 1),
(20, 'Punjab', 'IN', 1),
(21, 'Rajasthan', 'IN', 1),
(22, 'Sikkim', 'IN', 1),
(23, 'Tamil Nadu', 'IN', 1),
(24, 'Telangana', 'IN', 1),
(25, 'Tripura', 'IN', 1),
(26, 'Uttar Pradesh', 'IN', 1),
(27, 'Uttarakhand', 'IN', 1),
(28, 'West Bengal', 'IN', 1),
(29, 'Andaman and Nicobar Islands', 'IN', 1),
(30, 'Chandigarh', 'IN', 1),
(31, 'Dadra and Nagar Haveli and Daman and Diu', 'IN', 1),
(32, 'Delhi', 'IN', 1),
(33, 'Jammu and Kashmir', 'IN', 1),
(34, 'Ladakh', 'IN', 1),
(35, 'Lakshadweep', 'IN', 1),
(36, 'Puducherry', 'IN', 1);

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `email` varchar(60) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1= optin',
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `email`, `status`, `created`) VALUES
(10, 'manojkachora8@gmail.com', 1, '2025-07-24 13:31:12'),
(11, 'adirao2511@gmail.com', 1, '2025-09-27 07:55:19'),
(12, 'goswamidiksha435@gmail.com', 1, '2025-10-03 04:59:23'),
(13, 'htpcl24@gmail.com', 1, '2025-10-03 05:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `txnid` varchar(50) NOT NULL,
  `user_id` int(10) NOT NULL,
  `bid` varchar(40) NOT NULL,
  `status` varchar(50) NOT NULL,
  `amount` varchar(20) NOT NULL,
  `discount` varchar(7) NOT NULL DEFAULT '00.00',
  `firstname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `error_Message` varchar(200) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `txnid`, `user_id`, `bid`, `status`, `amount`, `discount`, `firstname`, `email`, `phone`, `error_Message`, `created`) VALUES
(1, 'ORD17F18D27EB31759562552', 1, '8904', 'failure', '1.00', '0.00', 'manoj dixit', 'manojkachora8@gmail.com', '9149065975', 'Transaction failed due to customer pressing cancel button.', '2025-10-04 07:26:47'),
(2, 'ORD1128E849587B1759564481', 11, '8907', 'pending', '1.00', '0.00', 'Lalit', 'lalit.rv@live.com', '09899936736', 'Bank was unable to authenticate.', '2025-10-04 07:55:01'),
(3, 'ORD1427825365F1759564926', 1, '8908', 'success', '1.00', '0.00', 'manoj dixit', 'manojkachora8@gmail.com', '9149065975', '', '2025-10-04 08:02:32'),
(4, 'ORD1A915D7D9141759565297', 1, '8909', 'success', '1.00', '0.00', 'manoj dixit', 'manojkachora8@gmail.com', '9149065975', '', '2025-10-04 08:08:58'),
(5, 'ORD17BE41846DF1759570438', 1, '8910', 'failure', '1.00', '0.00', 'manoj dixit', 'manojkachora8@gmail.com', '9149065975', 'Transaction failed due to customer pressing cancel button.', '2025-10-04 09:34:27'),
(6, 'ORD171A61B8347F1759574795', 17, '8911', 'success', '1.00', '0.00', 'Prince', 'princekushwahfzd@gmail.com', '7055843588', '', '2025-10-04 10:47:10'),
(7, 'ORD174CF247D7271759575090', 17, '8913', 'success', '1.00', '0.00', 'Prince', 'princekushwahfzd@gmail.com', '7055843588', '', '2025-10-04 10:51:47'),
(8, 'ORD1101D4DA17011759576838', 11, '8919', 'pending', '5288.00', '0.00', 'Lalit', 'lalit.rv@live.com', '09899936736', 'Bank was unable to authenticate.', '2025-10-04 11:21:14'),
(9, 'ORD17345E7AF4FA1759738954', 17, '8922', 'pending', '18947.00', '0.00', 'prince kushwah', 'princekushwahfzd@gmail.com', '7055843588', 'Bank was unable to authenticate.', '2025-10-06 08:23:25'),
(10, 'ORD17345E7AF4FA1759738954', 17, '8922', 'pending', '18947.00', '0.00', 'prince kushwah', 'princekushwahfzd@gmail.com', '7055843588', 'Bank was unable to authenticate.', '2025-10-06 08:24:03'),
(11, 'ORD174CE0E5DF641759739994', 17, '8923', 'failure', '26120.00', '0.00', 'prince kushwah', 'princekushwahfzd@gmail.com', '7055843588', '', '2025-10-06 08:40:54'),
(12, 'ORD2098295C33A41759838067', 20, '8930', 'failure', '25760.00', '0.00', 'Developer', 'developerbanno@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2025-10-07 11:54:55'),
(13, 'ORD25A14B8366FB1769761793', 25, '', 'failure', '6960.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 08:30:13'),
(14, 'ORD25BBCCA6F1B61769763840', 25, '', 'failure', '14800.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 09:04:24'),
(15, 'ORD254C019BDFDE1769766118', 25, '', 'failure', '5480.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 09:42:14'),
(16, 'ORD255BD2EA69FB1769766502', 25, '', 'failure', '5480.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 09:50:53'),
(17, 'ORD270F8F0C8EBC1769767037', 27, '', 'failure', '5500.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 10:06:14'),
(18, 'ORD2793C312F69C1769767894', 27, '', 'failure', '5480.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 10:11:53'),
(19, 'ORD2752792475821769769583', 27, '', 'failure', '5980.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 10:40:01'),
(20, 'ORD27C0069091E21769769657', 27, '', 'failure', '5980.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 10:42:13'),
(21, 'ORD2787C875D3591769771022', 27, '', 'failure', '5480.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:04:01'),
(22, 'ORD273D4A360F591769771089', 27, '', 'failure', '11480.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:05:08'),
(23, 'ORD27E297F20A671769771276', 27, '', 'failure', '14600.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:11:04'),
(24, 'ORD272727A99BA51769771541', 27, '', 'failure', '5560.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:12:39'),
(25, 'ORD27CEB4A7C52F1769771826', 27, '', 'failure', '5480.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:19:30'),
(26, 'ORD27C828315DF91769773082', 27, '', 'failure', '5680.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:38:22'),
(27, 'ORD27F28B3DD7381769773170', 27, '', 'failure', '5680.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:41:40'),
(28, 'ORD274FD3AD30F21769773344', 27, '', 'failure', '7480.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:42:39'),
(29, 'ORD2741E5D21A4B1769773444', 27, '', 'failure', '13480.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:44:23'),
(30, 'ORD2792A944725C1769773649', 27, '', 'failure', '82000.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-01-30 11:47:45'),
(31, 'ORD2821A39F4DCA1771501197', 28, '', 'failure', '15832.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-02-19 11:40:12'),
(32, 'ORD28287855E6621774509360', 28, '', 'failure', '17184.00', '0.00', 'prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-03-26 07:16:16'),
(33, 'ORD28F5CA9248D41774512281', 28, '', 'failure', '26536.00', '0.00', 'Prince', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-03-26 08:04:56'),
(34, 'ORD2850B316FF601776415204', 28, '1', 'failure', '23969.00', '0.00', 'prince kushwah', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-04-17 08:40:32'),
(35, 'ORD28E0CFB07ED51781073270', 28, '9', 'failure', '15969.00', '0.00', 'prince kushwah', 'princekushwahfzd@gmail.com', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-06-10 06:34:46'),
(36, 'ORD32D1F9785CBA1787049897', 32, '10', 'failure', '14536.00', '0.00', '', '', '7055843588', '', '2026-08-18 10:45:30'),
(37, 'ORD35EE84B4051D1787078091', 35, '14', 'success', '1940', '0', 'Cab', 'cabpay2@example.com', '', '', '2026-08-18 18:34:51'),
(38, 'ORD326BE01B597F1787145715', 32, '17', 'failure', '14536.00', '0.00', '', '', '7055843588', 'Transaction failed due to customer pressing cancel button.', '2026-08-19 13:22:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(40) DEFAULT '',
  `lastname` varchar(40) DEFAULT '',
  `mobile` varchar(15) NOT NULL,
  `email` varchar(60) DEFAULT '',
  `dob` date DEFAULT NULL,
  `city` varchar(200) DEFAULT '',
  `address` varchar(300) DEFAULT '',
  `password` varchar(60) DEFAULT '',
  `picture` varchar(200) DEFAULT '',
  `google_id` varchar(200) DEFAULT '',
  `is_google_user` tinyint(4) NOT NULL DEFAULT 2 COMMENT '1=google user, 2=normal, 3=facebook',
  `token` varchar(512) DEFAULT NULL,
  `created` datetime NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=active',
  `country_code` varchar(5) DEFAULT '+91',
  `referral_code` varchar(50) DEFAULT NULL,
  `marketing_opt_in` tinyint(4) NOT NULL DEFAULT 0,
  `agreed_to_terms` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `mobile`, `email`, `dob`, `city`, `address`, `password`, `picture`, `google_id`, `is_google_user`, `token`, `created`, `status`, `country_code`, `referral_code`, `marketing_opt_in`, `agreed_to_terms`) VALUES
(30, 'prince kushwah', '', '', 'princekushwahfzd@gmail.com', NULL, '', '', '', 'https://lh3.googleusercontent.com/a-/ALV-UjXTPt3AN0Gi9aTh6EuLgi2PJr2EJcdpudz88oWurxE9T7vABMbfhjeMFvoswtCF1HoK75slI8GPHRfS2plgGE_lV75O5BlJcb0X09fUreTBhIllZMyzhpZ8WImDyF1GbQesAt7C4atPCoHroXNyc7buCdpJs-z', '106274721359261970349', 1, '34173cb38f07f89ddbebc2ac9128303f', '2026-08-18 09:18:03', 1, '+91', NULL, 0, 0),
(32, '', '', '7055843588', '', NULL, '', '', '', '', '', 2, '6364d3f0f495b6ab9dcf8d3b5c6e0b01', '2026-08-18 10:44:40', 1, '+91', NULL, 0, 0),
(36, 'Aarav', 'Mehta', '7535040321', 'aarav@example.com', '1995-06-15', '', '', '', '', '', 2, NULL, '2026-09-01 03:57:10', 1, '+91', 'WELCOME100', 0, 1),
(37, '', '', '7535040123', '', NULL, '', '', '', '', '', 2, NULL, '2026-09-01 04:09:04', 1, '+91', NULL, 0, 0),
(38, '', '', '7535040111', '', NULL, '', '', '', '', '', 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsIm1vYmlsZSI6Ijc1MzUwNDAxMTEiLCJ0eXBlIjoidXNlciIsImlhdCI6MTc4ODkyNzU3OSwiZXhwIjoxNzg5MTAwMzc5fQ.8VEjINFA5W56JqtndBS_pxV7ueJjAfeDV3JUXYYQByE', '2026-09-01 04:20:38', 1, '+91', NULL, 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_bookings_ref` (`booking_ref`),
  ADD UNIQUE KEY `booking_ref` (`booking_ref`),
  ADD KEY `idx_bookings_user` (`user_id`),
  ADD KEY `idx_bookings_car` (`car_id`),
  ADD KEY `idx_bookings_city` (`city_id`),
  ADD KEY `idx_bookings_coupon` (`coupon_id`),
  ADD KEY `idx_bookings_status` (`booking_status`,`payment_status`),
  ADD KEY `idx_bookings_payu_txn` (`payu_txn_id`);

--
-- Indexes for table `booking_modify`
--
ALTER TABLE `booking_modify`
  ADD PRIMARY KEY (`booking_modify_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `booking_payments`
--
ALTER TABLE `booking_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_payments_booking` (`booking_id`),
  ADD KEY `idx_booking_payments_txn` (`payu_txn_id`);

--
-- Indexes for table `cab_bookings`
--
ALTER TABLE `cab_bookings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cab_pricing`
--
ALTER TABLE `cab_pricing`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`car_id`);

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `brand_id` (`brand_id`),
  ADD KEY `city_id` (`city_id`),
  ADD KEY `car_type_id` (`car_type_id`);

--
-- Indexes for table `car_additional_images`
--
ALTER TABLE `car_additional_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `car_availability`
--
ALTER TABLE `car_availability`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `car_brands`
--
ALTER TABLE `car_brands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `car_features`
--
ALTER TABLE `car_features`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `car_feature_map`
--
ALTER TABLE `car_feature_map`
  ADD PRIMARY KEY (`car_id`,`feature_id`),
  ADD UNIQUE KEY `car_feature_map_feature_id_car_id_unique` (`car_id`,`feature_id`),
  ADD KEY `feature_id` (`feature_id`);

--
-- Indexes for table `car_hide_history`
--
ALTER TABLE `car_hide_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `car_id_search` (`car_id`);

--
-- Indexes for table `car_images`
--
ALTER TABLE `car_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `car_subscriptions`
--
ALTER TABLE `car_subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `car_types`
--
ALTER TABLE `car_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`city_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_coupons_code` (`code`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_coupons_status` (`status`),
  ADD KEY `idx_coupons_validity` (`valid_from`,`valid_to`);

--
-- Indexes for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_coupon_user` (`coupon_id`,`user_id`),
  ADD KEY `idx_coupon_usages_user` (`user_id`),
  ADD KEY `idx_coupon_usages_booking` (`booking_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`documents_id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`settings_id`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `booking_modify`
--
ALTER TABLE `booking_modify`
  MODIFY `booking_modify_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_payments`
--
ALTER TABLE `booking_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `cab_bookings`
--
ALTER TABLE `cab_bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cab_pricing`
--
ALTER TABLE `cab_pricing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `car`
--
ALTER TABLE `car`
  MODIFY `car_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `car_additional_images`
--
ALTER TABLE `car_additional_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `car_availability`
--
ALTER TABLE `car_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `car_brands`
--
ALTER TABLE `car_brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `car_features`
--
ALTER TABLE `car_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `car_hide_history`
--
ALTER TABLE `car_hide_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17350;

--
-- AUTO_INCREMENT for table `car_images`
--
ALTER TABLE `car_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `car_subscriptions`
--
ALTER TABLE `car_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `car_types`
--
ALTER TABLE `car_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `city`
--
ALTER TABLE `city`
  MODIFY `city_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `documents_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=468;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `settings_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `states`
--
ALTER TABLE `states`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `booking_payments`
--
ALTER TABLE `booking_payments`
  ADD CONSTRAINT `booking_payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `cars`
--
ALTER TABLE `cars`
  ADD CONSTRAINT `cars_ibfk_16` FOREIGN KEY (`brand_id`) REFERENCES `car_brands` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `cars_ibfk_17` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `cars_ibfk_18` FOREIGN KEY (`car_type_id`) REFERENCES `car_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `car_additional_images`
--
ALTER TABLE `car_additional_images`
  ADD CONSTRAINT `car_additional_images_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `car_feature_map`
--
ALTER TABLE `car_feature_map`
  ADD CONSTRAINT `car_feature_map_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `car_feature_map_ibfk_2` FOREIGN KEY (`feature_id`) REFERENCES `car_features` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD CONSTRAINT `coupon_usages_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `coupon_usages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `coupon_usages_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
