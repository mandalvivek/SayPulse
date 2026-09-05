import { Router, Request, Response } from 'express';
import {
  getFeedbackList,
  getFeedbackById,
  updateFeedbackStatus,
  getOrganizationAnalytics,
  getWidgetConfig,
  updateWidgetConfig,
  getApiKeys,
  getAllOrganizationsWithStats,
  getGlobalPlatformAnalytics,
  getOrganizationBySlug,
} from '../db/sqlite';

const adminRouter = Router();

// ── SUPERADMIN: GET /master/overview — Platform-wide global metrics ───────────
adminRouter.get('/master/overview', (_req: Request, res: Response) => {
  try {
    const stats = getGlobalPlatformAnalytics();
    return res.json(stats);
  } catch (err: any) {
    console.error('[Superadmin API] Master overview error:', err.message);
    return res.status(500).json({ error: 'Failed fetching platform overview' });
  }
});

// ── SUPERADMIN: GET /master/organizations — All registered tenants directory ──
adminRouter.get('/master/organizations', (_req: Request, res: Response) => {
  try {
    const orgs = getAllOrganizationsWithStats();
    return res.json(orgs);
  } catch (err: any) {
    console.error('[Superadmin API] Organizations directory error:', err.message);
    return res.status(500).json({ error: 'Failed fetching organizations directory' });
  }
});

// ── GET /analytics — Executive metrics & KPIs (tenant-scoped) ─────────────────
adminRouter.get('/analytics', (req: Request, res: Response) => {
  try {
    const orgSlug = (req.query.slug as string) || (req.query.orgId as string) || 'demo';
    const analytics = getOrganizationAnalytics(orgSlug);
    return res.json(analytics);
  } catch (err: any) {
    console.error('[Admin API] Analytics error:', err.message);
    return res.status(500).json({ error: 'Failed fetching analytics' });
  }
});

// ── GET /feedback — Filterable & Paginated Feedback Feed (tenant-scoped) ──────
adminRouter.get('/feedback', (req: Request, res: Response) => {
  try {
    const {
      slug,
      orgId,
      sentiment,
      category,
      rating,
      status,
      search,
      limit,
      offset,
    } = req.query;

    const data = getFeedbackList({
      orgSlug: slug ? String(slug) : undefined,
      organizationId: orgId ? String(orgId) : undefined,
      sentiment: sentiment ? String(sentiment) : undefined,
      category: category ? String(category) : undefined,
      rating: rating ? Number(rating) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });

    return res.json(data);
  } catch (err: any) {
    console.error('[Admin API] Feedback list error:', err.message);
    return res.status(500).json({ error: 'Failed fetching feedback items' });
  }
});

// ── GET /feedback/:id — Single Feedback Detail Drill-Down ─────────────────────
adminRouter.get('/feedback/:id', (req: Request, res: Response) => {
  try {
    const orgSlug = (req.query.slug as string) || (req.query.orgId as string) || undefined;
    const item = getFeedbackById(req.params.id, orgSlug);
    if (!item) {
      return res.status(404).json({ error: 'Feedback record not found' });
    }
    return res.json(item);
  } catch (err: any) {
    console.error('[Admin API] Feedback detail error:', err.message);
    return res.status(500).json({ error: 'Failed fetching feedback detail' });
  }
});

// ── PATCH /feedback/:id/status — Update Feedback Status ───────────────────────
adminRouter.patch('/feedback/:id/status', (req: Request, res: Response) => {
  try {
    const { status, slug, orgId } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    const targetScope = slug || orgId;
    const result = updateFeedbackStatus(req.params.id, String(status), targetScope);
    return res.json({ success: true, updated: result.changes > 0 });
  } catch (err: any) {
    console.error('[Admin API] Status update error:', err.message);
    return res.status(500).json({ error: 'Failed updating feedback status' });
  }
});

// ── GET & PUT /widget-config — Customizer Settings (tenant-scoped) ───────────
adminRouter.get('/widget-config', (req: Request, res: Response) => {
  try {
    const orgSlug = (req.query.slug as string) || (req.query.orgId as string) || 'demo';
    const config = getWidgetConfig(orgSlug);
    return res.json(config);
  } catch (err: any) {
    console.error('[Admin API] Widget config error:', err.message);
    return res.status(500).json({ error: 'Failed fetching widget config' });
  }
});

adminRouter.put('/widget-config', (req: Request, res: Response) => {
  try {
    const { slug, orgId, ...configData } = req.body;
    const targetScope = slug || orgId || 'demo';
    updateWidgetConfig(targetScope, configData);
    return res.json({ success: true, config: configData });
  } catch (err: any) {
    console.error('[Admin API] Widget config update error:', err.message);
    return res.status(500).json({ error: 'Failed updating widget config' });
  }
});

// ── GET /api-keys — Organization API Keys (tenant-scoped) ─────────────────────
adminRouter.get('/api-keys', (req: Request, res: Response) => {
  try {
    const orgSlug = (req.query.slug as string) || (req.query.orgId as string) || 'demo';
    const keys = getApiKeys(orgSlug);
    return res.json(keys);
  } catch (err: any) {
    console.error('[Admin API] Api keys error:', err.message);
    return res.status(500).json({ error: 'Failed fetching api keys' });
  }
});

// ── GET /org-info — Single Organization Profile by Slug ───────────────────────
adminRouter.get('/org-info', (req: Request, res: Response) => {
  try {
    const slug = req.query.slug as string;
    if (!slug) return res.status(400).json({ error: 'slug is required' });

    const org = getOrganizationBySlug(slug);
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    return res.json(org);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed fetching organization info' });
  }
});

export default adminRouter;
