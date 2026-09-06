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
// Validates X-SayPulse-Key header AND enforces domain origin whitelisting.
// Prevents unauthorized websites from copying and using tenant script tags.
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

  // ── Strict Domain / Origin Whitelist Enforcer ──
  const requestOrigin = (req.headers['origin'] as string) || (req.headers['referer'] as string) || '';
  const allowed = partner.allowedOrigins || ['*'];

  // If key is configured with specific domains (not open wildcard):
  if (!allowed.includes('*') && allowed.length > 0) {
    if (!requestOrigin) {
      res.status(403).json({ error: 'Domain verification failed: Missing request Origin' });
      return;
    }

    const isMatch = allowed.some((domain) => {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      const cleanReq = requestOrigin.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      return cleanReq === cleanDomain || cleanReq.endsWith('.' + cleanDomain) || cleanReq.includes('localhost');
    });

    if (!isMatch) {
      res.status(403).json({ 
        error: `Security Policy Violation: API Key is restricted to authorized domains [${allowed.join(', ')}]. Access from '${requestOrigin}' was blocked.` 
      });
      return;
    }
  }

  req.saypulse = { apiKey: key, ...partner };
  next();
}
