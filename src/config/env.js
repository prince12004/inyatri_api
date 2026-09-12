/**
 * Environment Configuration
 * Centralized configuration for all environment variables
 * Validates required keys and provides defaults where appropriate
 */

// Required environment variables (will throw error if missing or empty)
const requiredEnvVars = {
    // Database Configuration
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,

    // // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_SECRET_ADMIN: process.env.JWT_SECRET_ADMIN,
    JWT_SECRET_ADVERTISER: process.env.JWT_SECRET_ADVERTISER,
    JWT_SECRET_USER: process.env.JWT_SECRET_USER,
    JWT_SECRET_GUEST: process.env.JWT_SECRET_GUEST,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

    // // AWS S3 Configuration
    // ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    // SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    // REGION: process.env.REGION,
    // BUCKET_NAME: process.env.BUCKET_NAME,
};

// Optional environment variables initialized explicitly from process.env with defaults where appropriate
const optionalEnvVars = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3000',
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '60000',
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '1000',
    AUTH_RATE_LIMIT_WINDOW_MS: process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000',
    AUTH_RATE_LIMIT_MAX_REQUESTS: process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '10',
    OTP_RATE_LIMIT_WINDOW_MS: process.env.OTP_RATE_LIMIT_WINDOW_MS || '60000',
    OTP_RATE_LIMIT_MAX_REQUESTS: process.env.OTP_RATE_LIMIT_MAX_REQUESTS || '5',

    // AWS S3 Optional
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    REGION: process.env.REGION,
    BUCKET_NAME: process.env.BUCKET_NAME,
    ACL: process.env.ACL || 'public-read',
    S3_ENDPOINT: process.env.S3_ENDPOINT,

    // Agora Configuration
    AGORA_APP_ID: process.env.AGORA_APP_ID,
    AGORA_APP_CERTIFICATE: process.env.AGORA_APP_CERTIFICATE,
    AGORA_CHAT_TOKEN: process.env.AGORA_CHAT_TOKEN,

    // Email / SMTP Configuration
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    MAIL_FROM: process.env.MAIL_FROM,

    // Encryption Configuration
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    ENCRYPTION_ALGORITHM: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc',
    ENCRYPTION_IV_LENGTH: process.env.ENCRYPTION_IV_LENGTH || '16',

    // SSL Configuration
    SSL_KEY_PATH: process.env.SSL_KEY_PATH,
    SSL_CERT_PATH: process.env.SSL_CERT_PATH,
    SSL_REQUIRED: process.env.SSL_REQUIRED,

    // Application URLs
    BASE_URL: process.env.BASE_URL,
    SELLER_BASE_URL: process.env.SELLER_BASE_URL,
    INVITE_SIGNUP_URL: process.env.INVITE_SIGNUP_URL,
    INVITE_LINK_BASE: process.env.INVITE_LINK_BASE,
    SHARE_BASE_URL: process.env.SHARE_BASE_URL,
    FRONTEND_RESET_PASSWORD_URL: process.env.FRONTEND_RESET_PASSWORD_URL,
    LOGO_URL: process.env.LOGO_URL,

    // Redis Configuration
    REDIS_URL: process.env.REDIS_URL,

    // Firebase Configuration
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,

    // Twilio Configuration
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    // PayU Configuration
    PAYU_MERCHANT_KEY: process.env.PAYU_MERCHANT_KEY,
    PAYU_MERCHANT_SALT: process.env.PAYU_MERCHANT_SALT,
    PAYU_ENV: process.env.PAYU_ENV || "test",
    PAYU_SUCCESS_URL: process.env.PAYU_SUCCESS_URL,
    PAYU_FAILURE_URL: process.env.PAYU_FAILURE_URL,
};

/**
 * Validate required environment variables
 * @throws {Error} If any required environment variable is missing or empty
 */
function validateEnvironment() {
    const missingVars = [];

    for (const [key, value] of Object.entries(requiredEnvVars)) {
        if (!value || value.trim() === '') {
            missingVars.push(key);
        }
    }

    if (missingVars.length > 0) {
        throw new Error(
            `❌ Missing or empty required environment variables: ${missingVars.join(', ')}\n` +
            'Please check your .env file and ensure all required variables are set.'
        );
    }

    // SSL key/certificate validation is only performed when running in production and SSL is required/configured
    const isSslRequired = optionalEnvVars.SSL_REQUIRED === 'true' || 
                          (optionalEnvVars.NODE_ENV === 'production' && (optionalEnvVars.SSL_KEY_PATH || optionalEnvVars.SSL_CERT_PATH));

    if (optionalEnvVars.NODE_ENV === 'production' && isSslRequired) {
        if (!optionalEnvVars.SSL_KEY_PATH || !optionalEnvVars.SSL_CERT_PATH) {
            throw new Error('❌ Both SSL_KEY_PATH and SSL_CERT_PATH are required when SSL is enabled in production environment');
        }
    }

    if (!['localhost', 'development', 'production'].includes(optionalEnvVars.NODE_ENV)) {
        throw new Error(`❌ Invalid NODE_ENV: ${optionalEnvVars.NODE_ENV}. Must be one of: localhost, development, production`);
    }

    console.log('✅ Environment validation passed');
}

// Validate environment on module load
validateEnvironment();

// Export all environment variables as constants
const ENV = {
    // Required variables
    DB: {
        HOST: requiredEnvVars.DB_HOST,
        PORT: requiredEnvVars.DB_PORT,
        NAME: requiredEnvVars.DB_NAME,
        USER: requiredEnvVars.DB_USER,
        PASSWORD: requiredEnvVars.DB_PASSWORD,
    },

    JWT: {
        SECRET: requiredEnvVars.JWT_SECRET,
        SECRET_ADMIN: requiredEnvVars.JWT_SECRET_ADMIN,
        SECRET_ADVERTISER: requiredEnvVars.JWT_SECRET_ADVERTISER,
        SECRET_USER: requiredEnvVars.JWT_SECRET_USER,
        SECRET_GUEST: requiredEnvVars.JWT_SECRET_GUEST,
        EXPIRES_IN: requiredEnvVars.JWT_EXPIRES_IN,
    },

    AWS: {
        ACCESS_KEY_ID: optionalEnvVars.ACCESS_KEY_ID || process.env.ACCESS_KEY_ID,
        SECRET_ACCESS_KEY: optionalEnvVars.SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY,
        REGION: optionalEnvVars.REGION || process.env.REGION,
        BUCKET_NAME: optionalEnvVars.BUCKET_NAME || process.env.BUCKET_NAME,
        ACL: optionalEnvVars.ACL,
        S3_ENDPOINT: optionalEnvVars.S3_ENDPOINT,
    },

    EMAIL: {
        SMTP_HOST: optionalEnvVars.SMTP_HOST,
        SMTP_PORT: optionalEnvVars.SMTP_PORT,
        SMTP_SECURE: optionalEnvVars.SMTP_SECURE === 'true',
        SMTP_USER: optionalEnvVars.SMTP_USER,
        SMTP_PASS: optionalEnvVars.SMTP_PASS,
        MAIL_FROM: optionalEnvVars.MAIL_FROM,
    },

    ENCRYPTION: {
        KEY: optionalEnvVars.ENCRYPTION_KEY,
        ALGORITHM: optionalEnvVars.ENCRYPTION_ALGORITHM,
        IV_LENGTH: optionalEnvVars.ENCRYPTION_IV_LENGTH,
    },

    SSL: {
        KEY_PATH: optionalEnvVars.SSL_KEY_PATH,
        CERT_PATH: optionalEnvVars.SSL_CERT_PATH,
    },

    URLS: {
        BASE_URL: optionalEnvVars.BASE_URL,
        SELLER_BASE_URL: optionalEnvVars.SELLER_BASE_URL,
        INVITE_SIGNUP_URL: optionalEnvVars.INVITE_SIGNUP_URL,
        INVITE_LINK_BASE: optionalEnvVars.INVITE_LINK_BASE,
        SHARE_BASE_URL: optionalEnvVars.SHARE_BASE_URL,
        FRONTEND_RESET_PASSWORD_URL: optionalEnvVars.FRONTEND_RESET_PASSWORD_URL,
        LOGO_URL: optionalEnvVars.LOGO_URL,
    },

    AGORA: {
        APP_ID: optionalEnvVars.AGORA_APP_ID,
        APP_CERTIFICATE: optionalEnvVars.AGORA_APP_CERTIFICATE,
        CHAT_TOKEN: optionalEnvVars.AGORA_CHAT_TOKEN,
    },

    REDIS: {
        URL: optionalEnvVars.REDIS_URL,
    },

    FIREBASE: {
        PROJECT_ID: optionalEnvVars.FIREBASE_PROJECT_ID,
        CLIENT_EMAIL: optionalEnvVars.FIREBASE_CLIENT_EMAIL,
        PRIVATE_KEY: optionalEnvVars.FIREBASE_PRIVATE_KEY,
    },

    TWILIO: {
        ACCOUNT_SID: optionalEnvVars.TWILIO_ACCOUNT_SID,
        AUTH_TOKEN: optionalEnvVars.TWILIO_AUTH_TOKEN,
        PHONE_NUMBER: optionalEnvVars.TWILIO_PHONE_NUMBER,
    },

    CLOUDINARY: {
        CLOUD_NAME: optionalEnvVars.CLOUDINARY_CLOUD_NAME,
        API_KEY: optionalEnvVars.CLOUDINARY_API_KEY,
        API_SECRET: optionalEnvVars.CLOUDINARY_API_SECRET,
    },

    PAYU: {
        MERCHANT_KEY: optionalEnvVars.PAYU_MERCHANT_KEY,
        MERCHANT_SALT: optionalEnvVars.PAYU_MERCHANT_SALT,
        ENV: optionalEnvVars.PAYU_ENV,
        SUCCESS_URL: optionalEnvVars.PAYU_SUCCESS_URL,
        FAILURE_URL: optionalEnvVars.PAYU_FAILURE_URL,
    },

    // Optional variables with defaults
    NODE_ENV: optionalEnvVars.NODE_ENV,
    PORT: optionalEnvVars.PORT,
    RATE_LIMIT: {
        WINDOW_MS: parseInt(optionalEnvVars.RATE_LIMIT_WINDOW_MS, 10),
        MAX_REQUESTS: parseInt(optionalEnvVars.RATE_LIMIT_MAX_REQUESTS, 10),
        AUTH_WINDOW_MS: parseInt(optionalEnvVars.AUTH_RATE_LIMIT_WINDOW_MS, 10),
        AUTH_MAX_REQUESTS: parseInt(optionalEnvVars.AUTH_RATE_LIMIT_MAX_REQUESTS, 10),
        OTP_WINDOW_MS: parseInt(optionalEnvVars.OTP_RATE_LIMIT_WINDOW_MS, 10),
        OTP_MAX_REQUESTS: parseInt(optionalEnvVars.OTP_RATE_LIMIT_MAX_REQUESTS, 10),
    },

    // Helper methods
    isDevelopment: () => optionalEnvVars.NODE_ENV === 'development',
    isLocalhost: () => optionalEnvVars.NODE_ENV === 'localhost',
    isProduction: () => optionalEnvVars.NODE_ENV === 'production',
};

export default ENV;