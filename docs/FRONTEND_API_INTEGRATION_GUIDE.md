# 🚀 INYATRI — Complete Frontend API Integration Guide
> **Audience**: Frontend Engineers (Web & Mobile Apps)  
> **Backend Version**: 1.0.0  
> **Base URL (Local)**: `http://localhost:5000`  
> **Production Base URL**: `https://api.inyatri.com` *(or configured domain)*  
> **User API Prefix**: `/api/user/v1`  
> **Admin API Prefix**: `/api/admin/v1`  
> **Health Check**: `GET /health` $\rightarrow$ returns `"Health Ok"`

---

## 📑 Table of Contents
1. [Core Standards & Conventions](#1-core-standards--conventions)
2. [PayU Payment Gateway Integration (Web & Mobile)](#2-payu-payment-gateway-integration)
3. [USER APIS — Authentication](#3-user-apis--authentication)
4. [USER APIS — Self-Drive Car Rental & Subscription](#4-user-apis--self-drive-car-rental--subscription)
5. [USER APIS — Cab Flow (One-Way, Round-Trip, Local, Airport)](#5-user-apis--cab-flow)
6. [USER APIS — Coupons](#6-user-apis--coupons)
7. [ADMIN APIS — Authentication](#7-admin-apis--authentication)
8. [ADMIN APIS — Master Data (Cities, States, Brands, Types, Features)](#8-admin-apis--master-data)
9. [ADMIN APIS — Cars Inventory Management](#9-admin-apis--cars-inventory-management)
10. [ADMIN APIS — Coupon Management](#10-admin-apis--coupon-management)
11. [ADMIN APIS — Cab Management & Pricing Engine](#11-admin-apis--cab-management--pricing-engine)
12. [Postman Collections & Testing Resources](#12-postman-collections--testing-resources)

---

## 1. Core Standards & Conventions

### 1.1 Headers
- **JSON Requests**: `Content-Type: application/json`
- **Authenticated Requests**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Multipart (File Uploads)**: `Content-Type: multipart/form-data`

### 1.2 Standard Success Response
Every successful response returns `status: true`:
```json
{
  "code": 200,
  "status": true,
  "message": "Operation completed successfully",
  "data": { ... } // Or an array [ ... ]
}
```

### 1.3 Standard Paginated Response
Endpoints with pagination return a `pagination` object:
```json
{
  "code": 200,
  "status": true,
  "message": "Items fetched successfully",
  "data": [ ... ],
  "pagination": {
    "totalItems": 45,
    "currentPage": 1,
    "totalPages": 3,
    "limit": 20
  }
}
```

### 1.4 Standard Error Response
When validation or business logic fails:
```json
{
  "code": 400, // 400, 401, 404, 409, 500
  "status": false,
  "message": "Clear explanation of the error",
  "data": []
}
```

---

## 2. PayU Payment Gateway Integration

Both **Self-Drive** and **Cab** flows return a `payu` form object upon checkout:

### 2.1 PayU Response Object (from Checkout / Pay Retry)
```json
{
  "booking": { "id": 1, "booking_ref": "IYC-00001", ... },
  "payment": {
    "payable_amount": 3360,
    "payu": {
      "payment_url": "https://test.payu.in/_payment", // or secure.payu.in in prod
      "key": "PAYU_MERCHANT_KEY",
      "txnid": "IYC00001-1-1729500000000",
      "amount": "3360.00",
      "productinfo": "Cab Booking IYC-00001",
      "firstname": "Rahul",
      "email": "customer@gmail.com",
      "phone": "9876543210",
      "udf1": "1",          // Booking ID
      "udf2": "cab",        // "cab" or "self_drive"
      "surl": "http://localhost:5000/api/user/v1/payments/payu/success",
      "furl": "http://localhost:5000/api/user/v1/payments/payu/failure",
      "hash": "generated_sha512_hash",
      "service_provider": "payu_paisa"
    }
  }
}
```

### 2.2 How to Handle in Frontend
- **Web (React / Next.js / Vue)**:
  Create an invisible `<form method="POST" action={payu.payment_url}>` dynamically, insert hidden inputs for each key in `payu`, and call `form.submit()`.
- **Mobile (React Native / Flutter)**:
  Open a `WebView` that submits the POST form or load the HTML representation.
- **Payment Reconciliation / Fallback**:
  If the user returns after payment or closes the browser, call:
  `POST /api/user/v1/cab/bookings/:id/payments/sync` or `POST /api/user/v1/self-drive/bookings/:id/payments/sync`.

---

## 3. USER APIS — Authentication

Base prefix: `/api/user/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/send-otp` | Public | Send 4-digit OTP to mobile |
| `POST` | `/verify-otp` | Public | Verify OTP & obtain JWT token |
| `POST` | `/resend-otp` | Public | Resend OTP |

#### `POST /api/user/v1/auth/send-otp`
**Request Body**:
```json
{
  "mobile": "9876543210"
}
```
**Response (200)**:
```json
{
  "code": 200,
  "status": true,
  "message": "OTP sent successfully",
  "data": { "mobile": "9876543210" }
}
```

#### `POST /api/user/v1/auth/verify-otp`
**Request Body**:
```json
{
  "mobile": "9876543210",
  "otp": "1234"
}
```
**Response (200)**:
```json
{
  "code": 200,
  "status": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": 1,
      "mobile": "9876543210",
      "firstname": "Rahul",
      "lastname": "Sharma"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
> 💡 *Save `token` in LocalStorage / SecureStore and send in `Authorization: Bearer <token>` for all private user endpoints.*

---

## 4. USER APIS — Self-Drive Car Rental & Subscription

Base prefix: `/api/user/v1/self-drive`

### 4.1 Browse Cities
`GET /api/user/v1/self-drive/cities` (Public)  
**Query Params**: `page` (default 1), `limit` (default 50)  
**Response**: List of active cities where Self-Drive is available.

---

### 4.2 Search Cars (Mode A: Browse vs Mode B: Date-Window)
`POST /api/user/v1/self-drive/search` (Public)  
**Request Body (Standard Rental)**:
```json
{
  "city_id": 1,
  "pickup_at": "2026-11-01T10:00:00.000Z",
  "drop_at": "2026-11-03T18:00:00.000Z",
  "rental_type": "rental"
}
```
**Request Body (Monthly Subscription)**:
```json
{
  "city_id": 1,
  "rental_type": "monthly",
  "subscription_plan": "1_month" // 15_days | 1_month | 3_months | 6_months | custom
}
```

---

### 4.3 List Cars with Filters
`GET /api/user/v1/self-drive/cars` (Public)  
**Query Params**:
- `city_id` (Number)
- `pickup_at`, `drop_at` (ISO dates)
- `rental_type`: `"rental"` \| `"monthly"`
- `subscription_plan`: `"15_days"` \| `"1_month"` \| `"3_months"` \| `"6_months"`
- `brand_id`, `car_type_id`, `fuel_type`, `transmission`
- `sort`: `"price_low"` \| `"price_high"` \| `"popular"`
- `page`, `limit`

---

### 4.4 Car Detail Page
`GET /api/user/v1/self-drive/cars/:id` (Public)  
**Query Params**: `city_id`, `pickup_at`, `drop_at`, `rental_type`, `subscription_plan`  
**Response**: Car specs, images, available features, and itemized fare preview with security deposit.

---

### 4.5 Review Booking Summary
`POST /api/user/v1/self-drive/bookings/summary` *(Auth Required)*  
**Request Body**:
```json
{
  "car_id": 1,
  "city_id": 1,
  "pickup_at": "2026-11-01T10:00:00.000Z",
  "drop_at": "2026-11-03T18:00:00.000Z",
  "rental_type": "rental",
  "payment_option": "full",   // "full" or "part"
  "coupon_code": "WELCOME100" // Optional
}
```
**Response**: Itemized breakdown including base rental, duration, GST (18%), discount, refundable security deposit, part payment breakdown (if applicable), and total payable amount.

---

### 4.6 Checkout Booking & Generate PayU
`POST /api/user/v1/self-drive/bookings/checkout` *(Auth Required)*  
**Request Body**: Same as summary.  
**Response**: Creates booking in `pending_payment` status and returns the `payu` checkout parameters.

---

### 4.7 Booking History & Details
- `GET /api/user/v1/self-drive/bookings` *(Auth)* — Query: `page`, `limit`, `status`
- `GET /api/user/v1/self-drive/bookings/:id` *(Auth)* — Full booking details + live payment status
- `POST /api/user/v1/self-drive/bookings/:id/pay` *(Auth)* — Retry failed payment
- `POST /api/user/v1/self-drive/bookings/:id/payments/sync` *(Auth)* — Reconcile directly with PayU

---

## 5. USER APIS — Cab Flow

Base prefix: `/api/user/v1/cab`

The Cab module covers **4 Trip Types**:
1. `one_way`: One-way ride with optional intermediate stops and client km.
2. `round_trip`: Departure + Return datetime, return to starting location.
3. `local`: City-scoped hourly rental package (e.g. 1hr · 10km, 2hr · 20km).
4. `airport`: Point-to-point Airport ride (`to_airport` or `from_airport`), **no extra stops allowed**.

```
Search -> Car Listing -> Car Detail -> Review Summary -> Checkout -> PayU Redirect -> Sync
```

---

### 5.1 Local Rental Packages List
`GET /api/user/v1/cab/packages?city_id=1` (Public)  
**Response**:
```json
{
  "code": 200,
  "status": true,
  "data": {
    "city": { "id": 1, "name": "Delhi NCR", "short_name": "DEL" },
    "packages": [
      { "id": 1, "label": "1 Hour · 10 km", "duration_hours": 1, "included_km": 10 },
      { "id": 2, "label": "2 Hours · 20 km", "duration_hours": 2, "included_km": 20 },
      { "id": 3, "label": "4 Hours · 40 km", "duration_hours": 4, "included_km": 40 },
      { "id": 4, "label": "8 Hours · 80 km", "duration_hours": 8, "included_km": 80 }
    ]
  }
}
```

---

### 5.2 Search Cabs
`POST /api/user/v1/cab/search` (Public)

#### Request Payloads by Trip Type:
**A. One-Way**:
```json
{
  "trip_type": "one_way",
  "pickup_location": "Noida Sector 62, Uttar Pradesh",
  "drop_location": "Taj Mahal, Agra, Uttar Pradesh",
  "stops": ["Mathura Toll Plaza"],
  "distance_km": 180,
  "departure_at": "2026-11-01T10:00:00.000Z"
}
```

**B. Round-Trip**:
```json
{
  "trip_type": "round_trip",
  "pickup_location": "Connaught Place, New Delhi",
  "drop_location": "Jaipur, Rajasthan",
  "distance_km": 560,
  "departure_at": "2026-11-01T06:00:00.000Z",
  "return_at": "2026-11-03T20:00:00.000Z"
}
```

**C. Local Rental**:
```json
{
  "trip_type": "local",
  "city_id": 1,
  "package_id": 1,
  "pickup_location": "Indira Gandhi International Airport, Terminal 3",
  "departure_at": "2026-11-01T10:00:00.000Z"
}
```

**D. Airport**:
```json
{
  "trip_type": "airport",
  "airport_direction": "to_airport", // "to_airport" or "from_airport"
  "airport_name": "BLR Airport T1",
  "pickup_location": "HSR Layout, Sector 2, Bengaluru",
  "drop_location": "Kempegowda International Airport, Terminal 1, Bengaluru",
  "distance_km": 45,
  "departure_at": "2026-11-01T09:00:00.000Z"
}
```
> ⚠️ **Airport Rule**: `stops` must be empty (`[]`). Extra stops will be rejected by validation.

**Response**: Returns available cars configured by admin for that trip type with calculated starting fares.

---

### 5.3 List Cab Cars with Calculated Fares
`GET /api/user/v1/cab/cars` (Public)  
**Query Parameters**:
- `trip_type`: `"one_way"` \| `"round_trip"` \| `"local"` \| `"airport"` (Required)
- `distance_km`: Number (Required for one_way, round_trip, airport)
- `city_id`: Number (Required for local)
- `package_id`: Number (Required for local)
- `pickup_location`: Optional string (Pickup address/landmark)
- `drop_location`: Optional string (Drop address/landmark)
- `departure_at`: ISO Date string
- `return_at`: ISO Date string (Required for round_trip)
- `airport_name`, `airport_direction`: Optional for airport
- `page`, `limit`

**Response Item**:
```json
{
  "id": 1,
  "car_name": "Maruti Swift Dzire",
  "model": "2023",
  "seats": 4,
  "fuel_type": "CNG",
  "main_image": "https://res.cloudinary.com/...",
  "subtitle": "or similar · driver included",
  "fare": {
    "total_fare": 3360,
    "base_fare": 3200,
    "base_km": 150,
    "per_km_after": "₹12/km",
    "driver_allowance": 0,
    "gst_amount": 160,
    "fare_includes": [
      { "label": "Driver charges", "value": "Included" },
      { "label": "Fuel", "value": "Included" },
      { "label": "150 km", "value": "Then ₹12/km" },
      { "label": "Toll & parking", "value": "At actuals" },
      { "label": "State tax", "value": "Included" }
    ]
  }
}
```

---

### 5.4 Get Cab Car Details & Specs
`GET /api/user/v1/cab/cars/:id` (Public)  
**Query Parameters**: `trip_type`, `distance_km`, `city_id`, `package_id`  
**Response**: Full car specifications, baggage capacity, seating, and itemized fare preview for client.

---

### 5.5 Review Cab Booking Summary
`POST /api/user/v1/cab/bookings/summary` *(Auth Required)*  
**Request Body**:
```json
{
  "car_id": 1,
  "trip_type": "airport",
  "airport_direction": "to_airport",
  "airport_name": "BLR Airport T1",
  "pickup_location": "HSR Layout, Sector 2, Bengaluru",
  "drop_location": "Kempegowda International Airport, Terminal 1, Bengaluru",
  "distance_km": 45,
  "departure_at": "2026-11-01T09:00:00.000Z",
  "contact_number": "9876543210",
  "coupon_code": "" // Optional
}
```
**Response**: Full trip details, contact information, itemized fare breakdown (base fare, driver allowance, GST 5%, discount, total payable).

---

### 5.6 Validate Cab Coupon
`POST /api/user/v1/cab/bookings/validate-coupon` *(Auth Required)*  
**Request Body**: Same as summary + `"coupon_code": "DISCOUNT50"`.  
**Response**: Returns coupon discount and updated fare breakdown.

---

### 5.7 Checkout Cab Booking & PayU Generation
`POST /api/user/v1/cab/bookings/checkout` *(Auth Required)*  
**Request Body**: Same as summary.  
**Response (201 Created)**:
Creates `CabBooking` record and returns PayU parameters (`key`, `txnid`, `amount`, `productinfo`, `firstname`, `email`, `phone`, `udf1`, `udf2: "cab"`, `surl`, `furl`, `hash`).

---

### 5.8 Cab Booking History & Operations
- `GET /api/user/v1/cab/bookings` *(Auth)*: List user's cab bookings (query: `trip_type`, `booking_status`, `page`, `limit`).
- `GET /api/user/v1/cab/bookings/:id` *(Auth)*: Get confirmed booking details.
- `POST /api/user/v1/cab/bookings/:id/pay` *(Auth)*: Initiate retry payment session if previous attempt failed.
- `POST /api/user/v1/cab/bookings/:id/payments/sync` *(Auth)*: Sync payment with PayU gateway.

---

## 6. USER APIS — Coupons

Base prefix: `/api/user/v1/self-drive/coupons`

- `GET /available` *(Auth)*: List coupons applicable to the logged-in user.
- `POST /validate` *(Auth)*:
  ```json
  {
    "code": "WELCOME100",
    "base_rental_amount": 3500
  }
  ```

---

## 7. ADMIN APIS — Authentication

Base prefix: `/api/admin/v1/auth`

#### `POST /api/admin/v1/auth/admin-login`
**Request Body**:
```json
{
  "email": "admin@inyatri.com",
  "password": "Password@123"
}
```
**Response (200)**:
```json
{
  "code": 200,
  "status": true,
  "message": "Login successful",
  "data": {
    "admin": { "id": 1, "name": "Super Admin", "email": "admin@inyatri.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 8. ADMIN APIS — Master Data

All endpoints require `Authorization: Bearer <admin_token>`.

### 8.1 Car Brands (`/api/admin/v1/car-brands`)
- `GET /` — List brands
- `POST /` — Add brand (`{ "brand_name": "Toyota", "logo_url": "..." }`)
- `PUT /:id` — Update brand
- `PATCH /:id/status` — Toggle status (`{ "status": 1 }` or `2`)
- `DELETE /:id` — Delete brand

### 8.2 Car Features (`/api/admin/v1/car-features`)
- `GET /` — List features (e.g., Airbags, Sunroof, Bluetooth)
- `POST /` — Add feature (`{ "name": "Sunroof", "icon_url": "..." }`)
- `PUT /:id` — Update feature
- `PATCH /:id/status` — Toggle status
- `DELETE /:id` — Delete feature

### 8.3 Car Types / Categories (`/api/admin/v1/car-types`)
- `GET /` — List car types (e.g., Sedan, SUV, Hatchback)
- `POST /` — Add car type (`{ "type_name": "SUV", "image_url": "..." }`)
- `PUT /:id` — Update car type
- `PATCH /:id/status` — Toggle status
- `DELETE /:id` — Delete car type

### 8.4 States (`/api/admin/v1/states`) & Cities (`/api/admin/v1/cities`)
- Full CRUD for States and Cities with active/inactive toggles.

---

## 9. ADMIN APIS — Cars Inventory Management

Base prefix: `/api/admin/v1/cars`  
All endpoints require `Authorization: Bearer <admin_token>`.

### 9.1 Meta Information for Car Form
`GET /api/admin/v1/cars/meta`  
Returns all dropdown options needed to populate the "Add Car" form (active brands, types, cities, and features).

---

### 9.2 Image Uploads
- `POST /api/admin/v1/cars/upload/image` (`multipart/form-data`, key: `image`) $\rightarrow$ Uploads main image to Cloudinary and returns CDN URL.
- `POST /api/admin/v1/cars/upload/images` (`multipart/form-data`, key: `images`) $\rightarrow$ Uploads gallery images.

---

### 9.3 Cars CRUD
- `GET /` — List cars with filters (`city_id`, `brand_id`, `car_type_id`, `status`, `search`, `page`, `limit`)
- `POST /` — Create new car:
```json
{
  "car_name": "Mahindra XUV700",
  "brand_id": 1,
  "car_type_id": 2,
  "city_id": 1,
  "registration_number": "DL01AB1234",
  "model": "2024",
  "seats": 7,
  "fuel_type": "Diesel",
  "transmission": "Automatic",
  "main_image": "https://res.cloudinary.com/...",
  "gallery_images": ["https://..."],
  "feature_ids": [1, 2, 4],
  "hourly_rental_rate": 250,
  "per_day_price": 3500,
  "security_deposit": 5000,
  "free_km_per_day": 250,
  "extra_km_charge": 15,
  "is_monthly_available": true,
  "monthly_subscription_rate": 45000
}
```
- `GET /:id` — Get full car details
- `PUT /:id` — Update car details
- `PATCH /:id/status` — Activate/Deactivate car (`{ "status": 1 }`)

---

## 10. ADMIN APIS — Coupon Management

Base prefix: `/api/admin/v1/coupons`  
All endpoints require `Authorization: Bearer <admin_token>`.

- `GET /` — List coupons (query: `search`, `status`, `page`, `limit`)
- `GET /:id` — Get coupon details
- `POST /` — Create coupon:
```json
{
  "code": "FESTIVE50",
  "title": "50% Off Festive Deal",
  "discount_percent": 50,
  "max_discount_amount": 1000,
  "min_booking_amount": 2500,
  "usage_limit_per_user": 1,
  "total_usage_limit": 500,
  "start_date": "2026-10-01T00:00:00.000Z",
  "end_date": "2026-11-30T23:59:59.000Z",
  "status": 1
}
```
- `PUT /:id` — Update coupon
- `PATCH /:id/status` — Enable/Disable coupon
- `DELETE /:id` — Delete coupon

---

## 11. ADMIN APIS — Cab Management & Pricing Engine

Base prefix: `/api/admin/v1/cab`  
All endpoints require `Authorization: Bearer <admin_token>`.

### 11.1 Cab Dashboard
`GET /api/admin/v1/cab/dashboard?page=1&limit=20`  
**Response**:
```json
{
  "code": 200,
  "status": true,
  "data": {
    "stats": {
      "total_cars": 12,
      "total_cabs": 8,
      "one_way": 6,
      "round_trip": 5,
      "local": 4,
      "airport": 4
    },
    "cab_availability": [
      {
        "id": 1,
        "car_name": "Maruti Swift Dzire",
        "seats": 4,
        "city_name": "Delhi NCR",
        "pricing_count": 3,
        "cab_configured": true
      }
    ]
  }
}
```

---

### 11.2 Cars Dropdown (for "Add Pricing" modal)
`GET /api/admin/v1/cab/cars/dropdown`  
Returns list of active cars with their configured pricing counts:
```json
{
  "code": 200,
  "status": true,
  "data": [
    { "id": 1, "car_name": "Maruti Swift Dzire", "pricing_count": 3 }
  ]
}
```

---

### 11.3 Local Rental Packages Management
- `GET /packages?city_id=1` — List packages for city
- `POST /packages` — Create package:
```json
{
  "city_id": 1,
  "duration_hours": 1,
  "included_km": 10,
  "label": "1 Hour · 10 km",
  "sort_order": 1
}
```
- `PUT /packages/:id` — Update package
- `PATCH /packages/:id/status` — Toggle status (`{ "status": 1 }` or `2`)

---

### 11.4 Pricing Slabs Management (Car-Wise)
- `GET /pricing?page=1&limit=20&car_id=1&trip_type=one_way` — List slabs
- `POST /pricing` — Add fare slab for a car:

**One-Way Pricing**:
```json
{
  "car_id": 1,
  "trip_type": "one_way",
  "base_km": 150,
  "base_fare": 3200,
  "per_km_charge": 12,
  "driver_allowance": 300
}
```

**Round-Trip Pricing**:
```json
{
  "car_id": 1,
  "trip_type": "round_trip",
  "base_km": 250,
  "base_fare": 5000,
  "per_km_charge": 11,
  "driver_allowance": 500
}
```

**Local Rental Pricing**:
```json
{
  "car_id": 1,
  "trip_type": "local",
  "package_id": 1,
  "base_km": 10,
  "base_fare": 450,
  "per_km_charge": 15,
  "driver_allowance": 100
}
```

**Airport Pricing**:
```json
{
  "car_id": 1,
  "trip_type": "airport",
  "base_km": 40,
  "base_fare": 999,
  "per_km_charge": 14,
  "driver_allowance": 150
}
```

- `PUT /pricing/:id` — Update slab amounts
- `PATCH /pricing/:id/status` — Enable / Disable slab (`{ "status": 1 }` or `2`)
- `DELETE /pricing/:id` — Delete slab

---

## 12. Postman Collections & Testing Resources

You can share these JSON collections with the frontend team for instant API importing and testing:

1. **🌟 Master Single Collection (ALL 108 APIs in Project — User & Admin)**:  
   📂 `postman/INYATRI_All_APIs.postman_collection.json`  
   *(Also mirrored to `postman/INYATRI.postman_collection.json`)*
2. **Dedicated Cab Flow (All 4 Trip Types + Admin Management)**:  
   📂 `postman/INYATRI_Cab_Flow.postman_collection.json`
3. **Dedicated Airport Flow Only**:  
   📂 `postman/INYATRI_Airport_Cab_Flow.postman_collection.json`
4. **Environment Variables Template**:  
   📂 `postman/INYATRI.postman_environment.json`
