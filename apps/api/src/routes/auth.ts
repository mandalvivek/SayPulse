import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const authRouter = Router();

// ── POST /send-otp — Dispatch 6-digit OTP via MHC WhatsApp Gateway or Email ────
authRouter.post('/send-otp', AuthController.sendOtp);

// ── POST /verify-otp — Verify OTP, check Superadmin / tenant existence ─────────
authRouter.post('/verify-otp', AuthController.verifyOtp);

// ── POST /register-org — Onboarding: Register new company & issue workspace slug
authRouter.post('/register-org', AuthController.registerOrg);

// ── GET /session — Get active authenticated session profile ───────────────────
authRouter.get('/session', AuthController.getSession);

export default authRouter;
