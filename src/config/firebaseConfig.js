import admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import logger from "../utils/logger.js";

let firebaseApp = null;
let messaging = null;
let auth = null;

if (!admin.getApps().length) {
  try {
    let credential = null;
    const serviceAccountPath = path.resolve("src/config/firebaseServiceAccount.json");

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
      credential = admin.cert(serviceAccount);
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      credential = admin.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
    }

    if (credential) {
      firebaseApp = admin.initializeApp({ credential });
      messaging = getMessaging(firebaseApp);
      auth = getAuth(firebaseApp);
      logger.info("🔥 Firebase Admin SDK initialized successfully");
    } else {
      logger.warn("⚠️ Firebase Admin credentials not provided");
    }
  } catch (error) {
    logger.error("❌ Firebase Admin initialization failed:", error);
  }
} else {
  firebaseApp = admin.getApp();
  messaging = getMessaging(firebaseApp);
  auth = getAuth(firebaseApp);
}

if (firebaseApp) {
  admin.messaging = () => messaging;
  admin.auth = () => auth;
}

export { admin, firebaseApp, messaging, auth };
export default admin;
