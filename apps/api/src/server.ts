import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import './db/sqlite'; // Initialize DB on startup

import { saypulseCors } from './middleware/dynamicCors';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import summarizeRouter from './routes/summarize';
import toneRouter from './routes/tone';
import submitRouter from './routes/submit';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import cdnRouter from './routes/cdn';

const app = express();
const PORT = Number(process.env.PORT ?? 8000);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── SayPulse SDK CORS ─────────────────────────────────────────────────────────
app.use('/saypulse', saypulseCors);

// ── Rate limiting: 100 feedback requests per minute per IP ───────────────────
const sdkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Max 100 requests per minute.' },
});

app.use(express.json({ limit: '2mb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get(['/health', '/saypulse/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SayPulse API',
    version: '0.1.0-local',
    timestamp: new Date().toISOString(),
    gemini: process.env.GEMINI_API_KEY ? '✅ configured' : '❌ missing key',
  });
});

// ── Authentication & OTP routes ───────────────────────────────────────────────
app.use('/saypulse/v1/auth', authRouter);

// ── SayPulse SDK routes ───────────────────────────────────────────────────────
app.use('/saypulse/v1/feedback/summarize', sdkLimiter, apiKeyAuth, summarizeRouter);
app.use('/saypulse/v1/feedback/tone',      sdkLimiter, apiKeyAuth, toneRouter);
app.use('/saypulse/v1/feedback/submit',    sdkLimiter, apiKeyAuth, submitRouter);

// ── Universal 1-Line CDN Script Bundle ───────────────────────────────────────
app.use('/saypulse/v1/cdn', cdnRouter);
app.use('/cdn', cdnRouter);

// ── SayPulse Business Admin Portal routes ─────────────────────────────────────
app.use('/saypulse/v1/admin', adminRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const ref = `err-${Date.now()}`;
  console.error(`[SayPulse API Error ${ref}]:`, err.message);
  res.status(500).json({ error: 'Internal server error', ref });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🎙️  SayPulse API v0.1.0 — Local Dev');
  console.log(`   ▸ Running on   http://localhost:${PORT}`);
  console.log(`   ▸ Health check http://localhost:${PORT}/saypulse/health`);
  console.log(`   ▸ Auth OTP     POST http://localhost:${PORT}/saypulse/v1/auth/send-otp`);
  console.log(`   ▸ Summarize    POST http://localhost:${PORT}/saypulse/v1/feedback/summarize`);
  console.log(`   ▸ Tone         POST http://localhost:${PORT}/saypulse/v1/feedback/tone`);
  console.log(`   ▸ Submit       POST http://localhost:${PORT}/saypulse/v1/feedback/submit`);
  console.log(`   ▸ Admin API    GET  http://localhost:${PORT}/saypulse/v1/admin/analytics`);
  console.log(`   ▸ Gemini key   ${process.env.GEMINI_API_KEY ? '✅ loaded' : '❌ MISSING — add to apps/api/.env'}\n`);
});
