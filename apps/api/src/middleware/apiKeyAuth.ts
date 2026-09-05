import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../db/sqlite';

// Augment Express request type
declare global {
  namespace Express {
    interface Request {
      saypulse?: {
        apiKey: string;
        partner: string;
        allowedOrigins: string[];
      };
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// apiKeyAuth middleware
// Validates X-SayPulse-Key header. Attaches partner info to req.saypulse.
// ──────────────────────────────────────────────────────────────────────────────
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const key =
    (req.headers['x-saypulse-key'] as string) ||
    (req.query['sp_key'] as string);

  if (!key) {
    res.status(401).json({ error: 'Missing X-SayPulse-Key header' });
    return;
  }

  const partner = validateApiKey(key);
  if (!partner) {
    res.status(403).json({ error: 'Invalid or inactive API key' });
    return;
  }

  req.saypulse = { apiKey: key, ...partner };
  next();
}
