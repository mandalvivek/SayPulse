import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const cdnRouter = Router();

const CDN_FILE_PATH = path.join(__dirname, '../cdn/saypulse.js');

// ── GET /cdn/saypulse.min.js & GET /cdn/saypulse.js ────────────────────────────
cdnRouter.get(['/saypulse.min.js', '/saypulse.js'], (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(CDN_FILE_PATH)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      return res.sendFile(CDN_FILE_PATH);
    } else {
      return res.status(404).send('// SayPulse CDN bundle not found');
    }
  } catch (err: any) {
    return res.status(500).send(`// Error loading SayPulse CDN bundle: ${err.message}`);
  }
});

export default cdnRouter;
