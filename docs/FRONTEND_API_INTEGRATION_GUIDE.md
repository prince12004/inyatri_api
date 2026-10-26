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
3. [USER APIS — Authentication, Profile & Documents](#3-user-apis--authentication-profile--documents)
4. [USER APIS — Unified Bookings Hub (Mobile "Bookings" Tab)](#4-user-apis--unified-bookings-hub-mobile-bookings-tab)
5. [USER APIS — Self-Drive Car Rental & Subscription](#5-user-apis--self-drive-car-rental--subscription)
6. [USER APIS — Cab Flow (One-Way, Round-Trip, Local, Airport)](#6-user-apis--cab-flow)
7. [USER APIS — Coupons](#7-user-apis--coupons)
8. [ADMIN APIS — Authentication](#8-admin-apis--authentication)
9. [ADMIN APIS — User Management & Document Verification](#9-admin-apis--user-management--document-verification)
10. [ADMIN APIS — Master Data (Cities, States, Brands, Types, Features)](#10-admin-apis--master-data)
11. [ADMIN APIS — Cars Inventory Management](#11-admin-apis--cars-inventory-management)
12. [ADMIN APIS — Coupon Management](#12-admin-apis--coupon-management)
13. [ADMIN APIS — Cab Management & Pricing Engine](#13-admin-apis--cab-management--pricing-engine)
14. [Push Notifications & In-App Notifications (Bell Icon)](#14-push-notifications--in-app-notifications-bell-icon)
15. [Postman Collections & Testing Resources](#15-postman-collections--testing-resources)

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

### 3.2 User Profile & Documents (Driving License & Govt ID)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/profile` or `/me` | User Auth | Fetch full logged-in user profile with document URLs |
| `PATCH` | `/profile` | User Auth | Update user details and document URLs/files optionally |
| `POST` | `/complete-profile` | User Auth | Complete/update profile on onboarding or later |

Users can update documents at any time either:
1. **As JSON**: passing document URLs (`driving_license_front`, `driving_license_back`, `government_id`).
2. **As Multipart Form-Data**: uploading actual image files directly in fields `driving_license_front`, `driving_license_back`, `government_id`, `picture`.

#### `GET /api/user/v1/auth/profile` *(or `/me`)*
**Headers**: `Authorization: Bearer <TOKEN>`  
**Response (200)**:
```json
{
  "code": 200,
  "status": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": 1,
    "mobile": "9876543210",
    "country_code": "+91",
    "firstname": "Rahul",
    "lastname": "Sharma",
    "full_name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dob": "1998-05-15",
    "city": "Bengaluru",
    "address": "123 Indiranagar, Bengaluru",
    "picture": "https://res.cloudinary.com/demo/image/upload/user_pic.jpg",
    "driving_license_front": "https://res.cloudinary.com/demo/image/upload/dl_front.jpg",
    "driving_license_back": "https://res.cloudinary.com/demo/image/upload/dl_back.jpg",
    "government_id": "https://res.cloudinary.com/demo/image/upload/gov_id.jpg",
    "marketing_opt_in": 1,
    "agreed_to_terms": 1,
    "status": 1
  }
}
```

#### `PATCH /api/user/v1/auth/profile` *(or `POST /complete-profile`)*
**Headers**: `Authorization: Bearer <TOKEN>`  
**Request Body (JSON option)**:
```json
{
  "full_name": "Rahul Sharma",
  "email": "rahul@example.com",
  "dob": "1998-05-15",
  "city": "Bengaluru",
  "address": "123 Indiranagar",
  "driving_license_front": "https://res.cloudinary.com/demo/image/upload/dl_front.jpg",
  "driving_license_back": "https://res.cloudinary.com/demo/image/upload/dl_back.jpg",
  "government_id": "https://res.cloudinary.com/demo/image/upload/gov_id.jpg"
}
```
*(All fields are optional; update only what has changed).*

---

### 3.3 Delete Account (Soft Delete API)

Allows the logged-in user to soft-delete their account.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `DELETE` | `/api/user/v1/auth/delete-account` | User Auth (Bearer) | Soft deletes user account & frees phone number |
| `POST` | `/api/user/v1/auth/delete-account` | User Auth (Bearer) | Alternate POST method for web clients |
| `DELETE` | `/api/user/v1/auth/profile` | User Auth (Bearer) | Alternate profile deletion alias |

> 🔑 **Phone Number Reuse Guarantee**:
> When an account is soft-deleted:
> 1. The account status is set to `0` (`deleted`), active sessions & FCM tokens are cleared, and `deleted_at` timestamp is set.
> 2. The phone number is safely suffixed in the background (`<mobile>_del_<timestamp>`), freeing up the exact original phone number.
> 3. The user (or anyone with that mobile number) can **immediately send OTP and register a brand new, fresh account** with that same phone number.
> 4. Past bookings, invoices, and payments stay intact linked to the historical record for financial audits.

**Headers**:
```http
Authorization: Bearer <USER_JWT_TOKEN>
```

**Response (200)**:
```json
{
  "code": 200,
  "status": true,
  "message": "Account deleted successfully",
  "data": {
    "id": 44,
    "mobile": "9876543210",
    "status": "deleted",
    "deleted_at": "2026-10-24T11:44:00.000Z",
    "message": "Account deleted successfully. You can create a new account using the same phone number anytime."
  }
}
```

---

## 4. USER APIS — Unified Bookings Hub (Mobile "Bookings" Tab)


Base prefix: `/api/user/v1/bookings`

This unified endpoint powers the mobile **Bookings** tab shown in the app design. It seamlessly consolidates both **Self-Drive** and **Cab** bookings with dual-tier filtering (Status & Trip Type) and formatted cards.

### 4.1 Filter Options
- **Row 1 (Status Tabs)**:
  - `all` (All bookings)
  - `upcoming` (Scheduled trips & ongoing rides)
  - `completed` (Concluded trips)
  - `cancelled` (Cancelled or failed bookings)
- **Row 2 (Trip Type Chips)**:
  - `all` (All categories)
  - `self_drive` (Self-drive rentals & subscriptions)
  - `one_way` (One-way cab rides)
  - `round_trip` (Round-trip outstation cabs)
  - `local` (or `local_rental` - Local hourly packages)
  - `airport` (Airport transfers)

---

### 4.2 List Unified Bookings
`GET /api/user/v1/bookings` *(Auth Required)*  
**Query Parameters**:
| Parameter | Type | Default | Description |
|---|---|---|---|
| `status` | string | `all` | `all`, `upcoming`, `completed`, `cancelled` |
| `trip_type` | string | `all` | `all`, `self_drive`, `one_way`, `round_trip`, `local`, `airport` |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |

**Sample Request**:
```
GET /api/user/v1/bookings?status=upcoming&trip_type=one_way&page=1&limit=20
```

**Response (200 - Exact Mobile Card Representation)**:
```json
{
  "code": 200,
  "status": true,
  "message": "Bookings fetched successfully",
  "data": [
    {
      "id": 5521,
      "booking_ref": "IY-CAB-5521",
      "category": "cab",
      "category_label": "Cab",
      "trip_type": "one_way",
      "trip_type_label": "One Way",
      "car_name": "Innova Crysta",
      "car_image": "https://res.cloudinary.com/.../innova.jpg",
      "status": "upcoming",
      "status_label": "upcoming",
      "status_badge_color": "#FF7A00",
      "price": 3880,
      "currency": "₹",
      "formatted_price": "₹3880",
      "location": "Bengaluru...",
      "pickup_location": "Bengaluru Airport Terminal 1, Bengaluru",
      "drop_location": "Mysuru Central",
      "scheduled_at": "2026-06-28T09:00:00.000Z",
      "scheduled_at_formatted": "Sun, 28 Jun · 9:00 AM",
      "ends_at": null,
      "ends_at_formatted": null,
      "booking_status_raw": 5,
      "booking_status_label": "confirmed",
      "payment_status_raw": 3,
      "payment_status_label": "success",
      "created_at": "2026-06-23T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "totalRecords": 1
  }
}
```

---

### 4.3 Get Booking Detail
`GET /api/user/v1/bookings/:id` *(Auth Required)*  
*`:id` can be either numeric booking ID or alphanumeric `booking_ref` (e.g. `IY-CAB-5521` or `5521`).*  
**Optional Query**: `?type=cab` or `?type=self_drive` (auto-detected if omitted).

**Response (200)**:
```json
{
  "code": 200,
  "status": true,
  "message": "Booking details fetched successfully",
  "data": {
    "id": 5521,
    "booking_ref": "IY-CAB-5521",
    "category": "cab",
    "category_label": "Cab",
    "trip_type": "one_way",
    "trip_type_label": "One Way",
    "car_name": "Innova Crysta",
    "status": "upcoming",
    "status_label": "upcoming",
    "status_badge_color": "#FF7A00",
    "price": 3880,
    "formatted_price": "₹3880",
    "scheduled_at_formatted": "Sun, 28 Jun · 9:00 AM",
    "car": {
      "id": 12,
      "car_name": "Innova Crysta",
      "vehicle_number": "KA-01-AB-1234",
      "seats": 7,
      "fuel_type": "diesel",
      "transmission": "manual",
      "made_year": 2024,
      "main_image": "https://res.cloudinary.com/.../innova.jpg",
      "brand": { "id": 1, "name": "Toyota" },
      "car_type": { "id": 3, "name": "SUV" }
    },
    "trip_details": {
      "pickup_location": "Bengaluru Airport Terminal 1, Bengaluru",
      "drop_location": "Mysuru Central",
      "stops": [],
      "scheduled_at": "2026-06-28T09:00:00.000Z",
      "scheduled_at_formatted": "Sun, 28 Jun · 9:00 AM",
      "ends_at": null,
      "ends_at_formatted": null,
      "distance_km": 145.5,
      "rental_days": null
    },
    "contact_number": "9876543210",
    "fare_breakdown": {
      "base_fare": 3500,
      "driver_allowance": 200,
      "gst_amount": 180,
      "discount_amount": 0,
      "payable_amount": 3880,
      "total_booking_amount": 3880,
      "paid_amount": 3880,
      "remaining_amount": 0
    },
    "coupon": null,
    "payment_summary": {
      "payment_option": "full",
      "payment_status": "success",
      "payu_txn_id": "IYC5521-1-1729500000000",
      "payments": [
        {
          "id": 1,
          "attempt_no": 1,
          "amount": 3880,
          "status": "success",
          "payu_txn_id": "IYC5521-1-1729500000000",
          "created_at": "2026-06-23T08:05:00.000Z"
        }
      ]
    }
  }
}
```

---

### 4.4 Cancel Booking API (Unified for Cab & Self-Drive)

Cancels an upcoming booking and stores the user's cancellation reason and cancellation timestamp.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/user/v1/bookings/:id/cancel` | User Auth (Bearer) | **Recommended**: Cancel any booking (Cab or Self-Drive) by ID or `booking_ref` |
| `PATCH` | `/api/user/v1/bookings/:id/cancel` | User Auth (Bearer) | Alternate PATCH method |
| `POST` | `/api/user/v1/self-drive/bookings/:id/cancel` | User Auth (Bearer) | Self-drive sub-route cancel alias |
| `POST` | `/api/user/v1/cab/bookings/:id/cancel` | User Auth (Bearer) | Cab sub-route cancel alias |

- **URL Parameter `:id`**: Numeric booking ID (e.g. `12`) or alphanumeric booking reference (e.g. `IY-CAB-5521` or `IYS-010423`).
- **Headers**:
  ```http
  Authorization: Bearer <USER_JWT_TOKEN>
  Content-Type: application/json
  ```
- **Request Body (JSON - Optional)**:
  ```json
  {
    "reason": "Travel plans changed due to flight schedule"
  }
  ```
  *(If omitted or blank, defaults to `"Cancelled by user"`).*

**Validation Rules**:
- Returns `404 Not Found` if booking doesn't exist or does not belong to logged-in user.
- Returns `400 Bad Request` if booking is already cancelled (`"Booking is already cancelled"`).
- Returns `400 Bad Request` if trip has already completed (`"Cannot cancel a completed booking"`).

**Success Response (200)**:
```json
{
  "code": 200,
  "status": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": 5521,
    "booking_ref": "IY-CAB-5521",
    "category": "cab",
    "category_label": "Cab",
    "trip_type": "one_way",
    "trip_type_label": "One Way",
    "car_name": "Innova Crysta",
    "car_image": "https://res.cloudinary.com/.../innova.jpg",
    "status": "cancelled",
    "status_label": "cancelled",
    "status_badge_color": "#EF4444",
    "price": 3880,
    "formatted_price": "₹3880",
    "booking_status_raw": 6,
    "booking_status_label": "cancelled",
    "cancellation_reason": "Travel plans changed due to flight schedule",
    "cancelled_at": "2026-10-24T11:44:24.000Z",
    "cancelled_at_formatted": "Sat, 24 Oct · 5:14 PM",
    "trip_details": {
      "pickup_location": "Bengaluru Airport Terminal 1, Bengaluru",
      "drop_location": "Mysuru Central",
      "scheduled_at": "2026-06-28T09:00:00.000Z",
      "scheduled_at_formatted": "Sun, 28 Jun · 9:00 AM"
    },
    "fare_breakdown": {
      "payable_amount": 3880,
      "total_booking_amount": 3880
    }
  }
}
```

---

## 5. USER APIS — Self-Drive Car Rental & Subscription



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

## 8. ADMIN APIS — Authentication

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

## 9. ADMIN APIS — User Management & Document Verification

Base prefix: `/api/admin/v1/users`  
*All endpoints require `Authorization: Bearer <admin_token>`.*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List users with search, status & document filters |
| `GET` | `/:id` | Get user details with documents and booking stats |
| `PATCH` | `/:id` | Update user details or document URLs |
| `PATCH` | `/:id/status` | Activate (`1`) or Deactivate (`2`) user account |
| `DELETE` | `/:id` | Deactivate user account |

### 9.1 List Users
`GET /api/admin/v1/users`  
**Query Parameters**:
- `page`: Integer (default 1)
- `limit`: Integer (default 20, max 100)
- `search`: String (matches firstname, lastname, mobile, email)
- `status`: Integer `1` (Active) or `2` (Inactive)
- `has_documents`: Boolean `true` (users with DL or Govt ID uploaded) or `false`

**Response (200)**:
```json
{
  "code": 200,
  "status": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": 1,
      "firstname": "Rahul",
      "lastname": "Sharma",
      "full_name": "Rahul Sharma",
      "mobile": "9876543210",
      "country_code": "+91",
      "email": "rahul@example.com",
      "city": "Bengaluru",
      "status": 1,
      "has_driving_license": true,
      "has_government_id": true,
      "documents_uploaded": true,
      "driving_license_front": "https://res.cloudinary.com/.../dl_front.jpg",
      "driving_license_back": "https://res.cloudinary.com/.../dl_back.jpg",
      "government_id": "https://res.cloudinary.com/.../gov_id.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "totalRecords": 1
  }
}
```

### 9.2 Get User Detail
`GET /api/admin/v1/users/:id`  
**Response (200)**:
Returns full user profile with document URLs plus booking activity counts:
```json
{
  "code": 200,
  "status": true,
  "message": "User details fetched successfully",
  "data": {
    "id": 1,
    "full_name": "Rahul Sharma",
    "mobile": "9876543210",
    "email": "rahul@example.com",
    "driving_license_front": "https://res.cloudinary.com/.../dl_front.jpg",
    "driving_license_back": "https://res.cloudinary.com/.../dl_back.jpg",
    "government_id": "https://res.cloudinary.com/.../gov_id.jpg",
    "has_driving_license": true,
    "has_government_id": true,
    "self_drive_bookings_count": 3,
    "cab_bookings_count": 2,
    "total_bookings_count": 5,
    "status": 1
  }
}
```

### 9.3 Update User Status
`PATCH /api/admin/v1/users/:id/status`  
**Request Body**:
```json
{
  "status": 1 // 1 = Active, 2 = Deactivated/Blocked
}
```

---

## 10. ADMIN APIS — Master Data

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

1. **🌟 Master Single Collection (ALL APIs in Project — User & Admin)**:  
   📂 `postman/INYATRI_All_APIs.postman_collection.json`  
   *(Also mirrored to `postman/INYATRI.postman_collection.json`)*
2. **Dedicated Cab Flow (All 4 Trip Types + Admin Management)**:  
   📂 `postman/INYATRI_Cab_Flow.postman_collection.json`
3. **Dedicated Airport Flow Only**:  
   📂 `postman/INYATRI_Airport_Cab_Flow.postman_collection.json`
4. **Environment Variables Template**:  
   📂 `postman/INYATRI.postman_environment.json`

---

## 13. Push Notifications & In-App Notifications (Bell Icon)

Firebase Cloud Messaging (FCM) is configured for push notifications. All notifications are also persisted in MySQL for the **Bell Icon** notification center.

### 13.1 Update Device FCM Token
Call this upon login, token refresh, or app launch to bind the client's FCM token.

- `POST /api/user/v1/auth/fcm-token` *(Auth Required)*
- `PATCH /api/user/v1/auth/fcm-token` *(Auth Required)*
- `POST /api/user/v1/notifications/fcm-token` *(Auth Required)*

**Request Body**:
```json
{
  "fcm_token": "eX_example_fcm_registration_token_from_firebase_sdk"
}
```
*(Accepts either `fcm_token` or `device_token`)*

*Note*: You can also pass `fcm_token` / `device_token` directly in the payload of `POST /api/user/v1/auth/verify-otp` and `POST /api/user/v1/auth/complete-profile`.

---

### 13.2 In-App Notifications (Bell Icon Center)

#### A. List Notifications (with Unread Count & Pagination)
`GET /api/user/v1/notifications?page=1&limit=20` *(Auth Required)*  
Query options: `page`, `limit`, `is_read` (`0` for unread only, `1` for read only).

**Response**:
```json
{
  "code": 200,
  "status": true,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "Booking Confirmed! 🎉",
      "body": "Your Cab booking #IYC-00001 is confirmed. Thank you for booking with InYatri!",
      "type": "booking_confirmed",
      "data": {
        "booking_id": 1,
        "booking_ref": "IYC-00001",
        "is_cab": true,
        "type": "booking_confirmed"
      },
      "is_read": 0,
      "read_at": null,
      "created_at": "2026-10-23T12:00:00.000Z"
    }
  ],
  "unread_count": 1,
  "pagination": {
    "totalItems": 1,
    "currentPage": 1,
    "totalPages": 1,
    "limit": 20
  }
}
```

#### B. Quick Unread Count (For Bell Icon Badge)
`GET /api/user/v1/notifications/unread-count` *(Auth Required)*  
**Response**:
```json
{
  "code": 200,
  "status": true,
  "message": "Unread count fetched successfully",
  "data": {
    "unread_count": 3
  }
}
```

#### C. Mark Single Notification as Read
`PATCH /api/user/v1/notifications/:id/read` *(Auth Required)*

#### D. Mark All Notifications as Read
`PATCH /api/user/v1/notifications/read-all` *(Auth Required)*

---

### 13.3 Automatic Push Notification Triggers

1. **Booking Confirmation**:
   - **To User**: Push notification sent + bell icon record saved when payment succeeds or booking is confirmed.
   - **To Admin**: Push notification sent to all active admin devices + bell icon record saved.
2. **Booking Date Reminder / Acknowledgment**:
   - **To User**: On the scheduled departure/pickup date, the user receives an acknowledgment push + bell icon notification reminder.
3. **User Account Creation**:
   - **To User**: Welcome notification sent + bell icon notification saved.
   - **To Admin**: Notification sent to admin regarding the newly registered customer.

---

### 13.4 Admin Notification Endpoints

Base prefix: `/api/admin/v1/notifications`  
*All endpoints require `Authorization: Bearer <ADMIN_TOKEN>`.*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List admin notifications (`page`, `limit`, `is_read=0\|1`) |
| `GET` | `/unread-count` | Get admin unread notifications badge count |
| `PATCH` | `/:id/read` | Mark specific admin notification as read |
| `PATCH` | `/read-all` | Mark all admin notifications as read |
| `POST` | `/fcm-token` | Register/update admin FCM device push token |
| `POST` | `/trigger-date-reminders` | Manually trigger departure-date reminder check |
| `POST` | `/send-broadcast` | Broadcast push & bell notification to all active users |
| `POST` | `/send-user` | Send targeted push & bell notification to a specific user |

#### A. Send Broadcast Notification (All Users)
`POST /api/admin/v1/notifications/send-broadcast`
```json
{
  "title": "Festival Offer 🪔",
  "body": "Get flat 20% off on all outstation cab bookings this weekend!",
  "data": {
    "promo_code": "FESTIVAL20"
  }
}
```

#### B. Send Direct Notification to User
`POST /api/admin/v1/notifications/send-user`
```json
{
  "user_id": 1,
  "title": "Documents Verified 🎉",
  "body": "Your driving license and government ID have been verified.",
  "data": {
    "type": "document_verified"
  }
}
```


