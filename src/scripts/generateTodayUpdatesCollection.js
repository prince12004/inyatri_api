import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collection = {
  info: {
    _postman_id: "inyatri-today-updates-collection-2026",
    name: "INYATRI - Today's New & Updated APIs",
    description:
      "Collection of all APIs created and updated today, categorized module-wise:\n1. User Authentication & Profile (with Driving License & Govt ID docs)\n2. Unified Bookings Hub (Mobile Bookings Tab with status & trip filters)\n3. Cab Airport Search (Optional pickup & drop location)\n4. Admin User Management & Document Verification\n5. Push Notifications & In-App Notifications (Bell Icon)",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    {
      key: "baseUrl",
      value: "http://localhost:5000",
      type: "string",
    },
    {
      key: "user_token",
      value: "",
      type: "string",
    },
    {
      key: "admin_token",
      value: "",
      type: "string",
    },
    {
      key: "user_id",
      value: "1",
      type: "string",
    },
    {
      key: "booking_id",
      value: "1",
      type: "string",
    },
    {
      key: "booking_ref",
      value: "IY-CAB-5521",
      type: "string",
    },
    {
      key: "notification_id",
      value: "1",
      type: "string",
    },
  ],
  item: [
    // ─── MODULE 1: USER AUTH, PROFILE & DOCUMENTS ──────────────────────────
    {
      name: "01. User Auth, Profile & Documents",
      item: [
        {
          name: "Send OTP (User Login / Signup)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  country_code: "+91",
                  mobile: "9876543210",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/user/v1/auth/send-otp",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "auth", "send-otp"],
            },
          },
        },
        {
          name: "Verify OTP (Stores {{user_token}})",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var res = pm.response.json();",
                  "if (res.data && res.data.token) {",
                  "    pm.environment.set('user_token', res.data.token);",
                  "    pm.collectionVariables.set('user_token', res.data.token);",
                  "    console.log('User token captured successfully');",
                  "}",
                ],
                type: "text/javascript",
              },
            },
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  country_code: "+91",
                  mobile: "9876543210",
                  otp: "123456",
                  fcm_token: "sample_device_fcm_token_optional",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/user/v1/auth/verify-otp",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "auth", "verify-otp"],
            },
          },
        },
        {
          name: "Get User Profile with Documents (GET /profile)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/auth/profile",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "auth", "profile"],
            },
            description:
              "Fetches profile of logged-in user including driving_license_front, driving_license_back, government_id.",
          },
        },
        {
          name: "Get User Profile Alias (GET /me)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/auth/me",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "auth", "me"],
            },
          },
        },
        {
          name: "Update Profile & Documents (JSON URLs)",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  full_name: "Rahul Sharma",
                  email: "rahul.sharma@example.com",
                  dob: "1998-06-25",
                  city: "Bengaluru",
                  address: "Indiranagar, Bengaluru, Karnataka",
                  driving_license_front:
                    "https://res.cloudinary.com/demo/image/upload/sample_dl_front.jpg",
                  driving_license_back:
                    "https://res.cloudinary.com/demo/image/upload/sample_dl_back.jpg",
                  government_id:
                    "https://res.cloudinary.com/demo/image/upload/sample_gov_id.jpg",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/user/v1/auth/profile",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "auth", "profile"],
            },
            description:
              "Updates user profile and document URLs optionally. All fields are optional.",
          },
        },
        {
          name: "Update Profile & Documents (Multipart File Upload)",
          request: {
            method: "PATCH",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            body: {
              mode: "formdata",
              formdata: [
                {
                  key: "full_name",
                  value: "Rahul Sharma",
                  type: "text",
                },
                {
                  key: "city",
                  value: "Bengaluru",
                  type: "text",
                },
                {
                  key: "driving_license_front",
                  type: "file",
                  description: "Upload DL Front image",
                },
                {
                  key: "driving_license_back",
                  type: "file",
                  description: "Upload DL Back image",
                },
                {
                  key: "government_id",
                  type: "file",
                  description: "Upload Aadhaar / Passport / Govt ID image",
                },
                {
                  key: "picture",
                  type: "file",
                  description: "Profile Avatar image",
                },
              ],
            },
            url: {
              raw: "{{baseUrl}}/api/user/v1/auth/profile",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "auth", "profile"],
            },
            description:
              "Uploads actual image files directly. The backend streams them to Cloudinary ('inyatri/user_docs') and saves the URLs to user profile.",
          },
        },
        {
          name: "Complete Profile (Onboarding)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  full_name: "Rahul Sharma",
                  email: "rahul@example.com",
                  referral_code: "",
                  agreed_to_terms: true,
                  marketing_opt_in: true,
                  driving_license_front:
                    "https://res.cloudinary.com/demo/image/upload/sample_dl_front.jpg",
                  driving_license_back:
                    "https://res.cloudinary.com/demo/image/upload/sample_dl_back.jpg",
                  government_id:
                    "https://res.cloudinary.com/demo/image/upload/sample_gov_id.jpg",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/user/v1/auth/complete-profile",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "auth", "complete-profile"],
            },
          },
        },
      ],
    },

    // ─── MODULE 2: UNIFIED BOOKINGS HUB ────────────────────────────────────
    {
      name: "02. User Unified Bookings Hub (Mobile Design Match)",
      item: [
        {
          name: "List Bookings (Upcoming + All Types)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings?status=upcoming&trip_type=all&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings"],
              query: [
                { key: "status", value: "upcoming" },
                { key: "trip_type", value: "all" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
            description:
              "Matches the app screenshot top tab 'Upcoming'. Returns card format with car_name, status badge, formatted_price ('₹3880'), trip_type_label, location summary, and scheduled_at_formatted ('Sun, 28 Jun · 9:00 AM').",
          },
        },
        {
          name: "List Bookings (Upcoming + One Way)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings?status=upcoming&trip_type=one_way&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings"],
              query: [
                { key: "status", value: "upcoming" },
                { key: "trip_type", value: "one_way" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
            description:
              "Exact combination active in user screenshot (Orange 'Upcoming' tab + Black 'One Way' chip).",
          },
        },
        {
          name: "List Bookings (Upcoming + Round Trip)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings?status=upcoming&trip_type=round_trip&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings"],
              query: [
                { key: "status", value: "upcoming" },
                { key: "trip_type", value: "round_trip" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "List Bookings (All Status + Self Drive)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings?status=all&trip_type=self_drive&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings"],
              query: [
                { key: "status", value: "all" },
                { key: "trip_type", value: "self_drive" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "List Bookings (All Status + Local / Rental)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings?status=all&trip_type=local&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings"],
              query: [
                { key: "status", value: "all" },
                { key: "trip_type", value: "local" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "List Bookings (All Status + Airport)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings?status=all&trip_type=airport&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings"],
              query: [
                { key: "status", value: "all" },
                { key: "trip_type", value: "airport" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "List Bookings (Completed Tab)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings?status=completed&trip_type=all&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings"],
              query: [
                { key: "status", value: "completed" },
                { key: "trip_type", value: "all" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "List Bookings (Cancelled Tab)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings?status=cancelled&trip_type=all&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings"],
              query: [
                { key: "status", value: "cancelled" },
                { key: "trip_type", value: "all" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "Get Booking Detail by ID",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings/{{booking_id}}",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings", "{{booking_id}}"],
            },
            description:
              "Fetches comprehensive booking detail: card headers, car specs, trip details, fare breakdown, and payment transactions.",
          },
        },
        {
          name: "Get Booking Detail by Reference (IY-CAB-5521)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/bookings/{{booking_ref}}",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "bookings", "{{booking_ref}}"],
            },
            description:
              "Auto-resolves by booking_ref string directly (e.g. IY-CAB-5521 or IYS-00001).",
          },
        },
      ],
    },

    // ─── MODULE 3: CAB AIRPORT SEARCH (OPTIONAL PICKUP/DROP) ───────────────
    {
      name: "03. Cab Airport Search (Pickup & Drop Enabled)",
      item: [
        {
          name: "Search Airport Cabs with Optional Pickup & Drop",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/user/v1/cab/cars?trip_type=airport&distance_km=45&airport_name=BLR Airport T1&airport_direction=to_airport&pickup_location=Koramangala 4th Block, Bengaluru&drop_location=Kempegowda International Airport Terminal 1&departure_at=2026-11-01T09:00:00.000Z&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "cab", "cars"],
              query: [
                { key: "trip_type", value: "airport" },
                { key: "distance_km", value: "45" },
                { key: "airport_name", value: "BLR Airport T1" },
                { key: "airport_direction", value: "to_airport" },
                {
                  key: "pickup_location",
                  value: "Koramangala 4th Block, Bengaluru",
                },
                {
                  key: "drop_location",
                  value: "Kempegowda International Airport Terminal 1",
                },
                {
                  key: "departure_at",
                  value: "2026-11-01T09:00:00.000Z",
                },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
            description:
              "Updated API now accepts pickup_location and drop_location optionally alongside airport_name & airport_direction.",
          },
        },
      ],
    },

    // ─── MODULE 4: ADMIN USER MANAGEMENT ───────────────────────────────────
    {
      name: "04. Admin User Management & Document Verification",
      item: [
        {
          name: "Admin Login (Stores {{admin_token}})",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var res = pm.response.json();",
                  "if (res.data && res.data.token) {",
                  "    pm.environment.set('admin_token', res.data.token);",
                  "    pm.collectionVariables.set('admin_token', res.data.token);",
                  "    console.log('Admin token captured successfully');",
                  "}",
                ],
                type: "text/javascript",
              },
            },
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  email: "admin@inyatri.com",
                  password: "Password@123",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/admin/v1/auth/admin-login",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "auth", "admin-login"],
            },
          },
        },
        {
          name: "List Users (Paginated)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/users?page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "users"],
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "Search Users (by Name / Mobile / Email)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/users?search=Rahul&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "users"],
              query: [
                { key: "search", value: "Rahul" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "Filter Users with Uploaded Documents",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/users?has_documents=true&page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "users"],
              query: [
                { key: "has_documents", value: "true" },
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "Get User Detail (with Documents & Booking Stats)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/users/{{user_id}}",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "users", "{{user_id}}"],
            },
            description:
              "Returns complete user details including driving_license_front, driving_license_back, government_id, and counts of self_drive_bookings and cab_bookings.",
          },
        },
        {
          name: "Update User Details & Documents",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  firstname: "Rahul",
                  lastname: "Sharma",
                  city: "Bengaluru",
                  driving_license_front:
                    "https://res.cloudinary.com/demo/image/upload/sample_dl_front.jpg",
                  driving_license_back:
                    "https://res.cloudinary.com/demo/image/upload/sample_dl_back.jpg",
                  government_id:
                    "https://res.cloudinary.com/demo/image/upload/sample_gov_id.jpg",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/admin/v1/users/{{user_id}}",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "users", "{{user_id}}"],
            },
          },
        },
        {
          name: "Update User Status (Active / Inactive)",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  status: 1, // 1 = Active, 2 = Deactivated
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/admin/v1/users/{{user_id}}/status",
              host: ["{{baseUrl}}"],
              path: [
                "api",
                "admin",
                "v1",
                "users",
                "{{user_id}}",
                "status",
              ],
            },
          },
        },
        {
          name: "Deactivate User",
          request: {
            method: "DELETE",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/users/{{user_id}}",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "users", "{{user_id}}"],
            },
          },
        },
      ],
    },

    // ─── MODULE 5: NOTIFICATIONS & BELL ICON ───────────────────────────────
    {
      name: "05. Notifications (Push & In-App Bell Icon)",
      item: [
        {
          name: "Register / Update User FCM Device Token",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  fcm_token:
                    "c8928_sample_fcm_token_from_flutter_or_react_native_firebase",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/user/v1/auth/fcm-token",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "auth", "fcm-token"],
            },
          },
        },
        {
          name: "List User Notifications (Bell Icon Center)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/notifications?page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "notifications"],
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "Get Bell Icon Unread Count",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/notifications/unread-count",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "notifications", "unread-count"],
            },
          },
        },
        {
          name: "Mark Single Notification as Read",
          request: {
            method: "PATCH",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/notifications/{{notification_id}}/read",
              host: ["{{baseUrl}}"],
              path: [
                "api",
                "user",
                "v1",
                "notifications",
                "{{notification_id}}",
                "read",
              ],
            },
          },
        },
        {
          name: "Mark All Notifications as Read",
          request: {
            method: "PATCH",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{user_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/user/v1/notifications/read-all",
              host: ["{{baseUrl}}"],
              path: ["api", "user", "v1", "notifications", "read-all"],
            },
          },
        },
      ],
    },

    // ─── MODULE 6: ADMIN NOTIFICATIONS ─────────────────────────────────────
    {
      name: "06. Admin Notifications (Bell Center & Reminders)",
      item: [
        {
          name: "List Admin Notifications",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications?page=1&limit=20",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "notifications"],
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
            description: "Lists notifications received by admin (new bookings, user signups, reminders)."
          },
        },
        {
          name: "List Admin Notifications (Unread Only)",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications?page=1&limit=20&is_read=0",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "notifications"],
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
                { key: "is_read", value: "0" },
              ],
            },
          },
        },
        {
          name: "Get Admin Notifications Unread Count",
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications/unread-count",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "notifications", "unread-count"],
            },
            description: "Returns unread count badge for admin dashboard bell icon."
          },
        },
        {
          name: "Mark Single Admin Notification Read",
          request: {
            method: "PATCH",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications/{{notification_id}}/read",
              host: ["{{baseUrl}}"],
              path: [
                "api",
                "admin",
                "v1",
                "notifications",
                "{{notification_id}}",
                "read",
              ],
            },
          },
        },
        {
          name: "Mark All Admin Notifications Read",
          request: {
            method: "PATCH",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications/read-all",
              host: ["{{baseUrl}}"],
              path: ["api", "admin", "v1", "notifications", "read-all"],
            },
          },
        },
        {
          name: "Register / Update Admin FCM Device Token (POST)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  fcm_token: "fcm_device_token_from_admin_panel_browser_or_app",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications/fcm-token",
              host: ["{{baseUrl}}"],
              path: [
                "api",
                "admin",
                "v1",
                "notifications",
                "fcm-token",
              ],
            },
          },
        },
        {
          name: "Update Admin FCM Device Token (PATCH)",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  device_token: "fcm_device_token_from_admin_panel_browser_or_app",
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications/fcm-token",
              host: ["{{baseUrl}}"],
              path: [
                "api",
                "admin",
                "v1",
                "notifications",
                "fcm-token",
              ],
            },
          },
        },
        {
          name: "Trigger Booking Date Reminders (Manual Cron Trigger)",
          request: {
            method: "POST",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications/trigger-date-reminders",
              host: ["{{baseUrl}}"],
              path: [
                "api",
                "admin",
                "v1",
                "notifications",
                "trigger-date-reminders",
              ],
            },
            description: "Triggers check and dispatch of push reminders + bell notifications for all trips scheduled for today."
          },
        },
        {
          name: "Send Broadcast Push Notification (All Users)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  title: "Festival Offer 🪔",
                  body: "Get flat 20% off on all outstation cab bookings this weekend!",
                  data: {
                    promo_code: "FESTIVAL20",
                  },
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications/send-broadcast",
              host: ["{{baseUrl}}"],
              path: [
                "api",
                "admin",
                "v1",
                "notifications",
                "send-broadcast",
              ],
            },
            description: "Sends push notification to all active user device tokens and saves records in in-app bell notification center."
          },
        },
        {
          name: "Send Direct Push Notification to User",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              {
                key: "Authorization",
                value: "Bearer {{admin_token}}",
              },
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  user_id: 1,
                  title: "Documents Verified 🎉",
                  body: "Your driving license and government ID have been verified.",
                  data: {
                    type: "document_verified",
                  },
                },
                null,
                2
              ),
            },
            url: {
              raw: "{{baseUrl}}/api/admin/v1/notifications/send-user",
              host: ["{{baseUrl}}"],
              path: [
                "api",
                "admin",
                "v1",
                "notifications",
                "send-user",
              ],
            },
            description: "Sends targeted push notification and bell icon notification to a specific user."
          },
        },
      ],
    },
  ],
};

const outputDir = path.resolve(__dirname, "../../postman");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(
  outputDir,
  "INYATRI_Today_Updates.postman_collection.json"
);

fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), "utf8");
console.log(`✅ Collection generated successfully at: ${outputPath}`);
