/**
 * TODO (Automated Testing):
 * Critical application flows including authentication, OTP verification, pet/parent matching, and chat
 * should be covered by comprehensive automated test suites (integration/unit tests) in the future.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import configurations and middleware
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { ALLOWED_ORIGINS } from './utils/constants/serverConfig.js';

// Import routes
import mainRouter from './routes/index.js';

const app = express();

// Security middleware (skip for dev PayU redirect — needs relaxed CSP for form POST to PayU)
const helmetMiddleware = helmet();
const payuPath = (req) => req.originalUrl.split("?")[0];

const isPayuRedirectPage = (req) =>
  req.method === "GET" && /\/payments\/payu\/redirect\/\d+/.test(payuPath(req));

/** PayU browser POSTbacks include Origin: https://test.payu.in — not a frontend API call */
const isPayuCallbackRequest = (req) =>
  req.method === "POST" &&
  /\/payments\/payu\/(success|failure)$/.test(payuPath(req));

app.use((req, res, next) => {
  if (isPayuRedirectPage(req)) {
    return next();
  }
  return helmetMiddleware(req, res, next);
});

const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  maxAge: 600,
});

app.use((req, res, next) => {
  if (isPayuCallbackRequest(req)) {
    return next();
  }
  return corsMiddleware(req, res, next);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per windowMs for demo testing latter we will revert this to 100
  message: {
    error: 'Too many requests from this IP, please try after sometime.'
  }
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'localhost') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// main route
app.use('/', mainRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

//export app
export default app;