import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// ──────────────────────────────────────────────────────────────────────────────
// dynamicCors
// For SayPulse SDK routes, any origin is allowed when a valid X-SayPulse-Key
// is present (partner websites install the SDK on their own domains).
// Falls back to standard strict CORS for non-SDK routes.
// ──────────────────────────────────────────────────────────────────────────────
export const saypulseCors = cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (mobile native, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // SayPulse SDK is embedded in partner websites — any origin is valid
    // (API key validation in apiKeyAuth handles authorization)
    return callback(null, true);
  },
  allowedHeaders: [
    'Content-Type',
    'X-SayPulse-Key',
    'Authorization',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false, // SDK uses header-based auth, not cookies
});
