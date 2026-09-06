import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'saypulse.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Check and migrate tables if upgrading from legacy schema ─────────────────
const usersInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const hasPhone = usersInfo.some((col: any) => col.name === 'phone');
if (usersInfo.length > 0 && !hasPhone) {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN phone TEXT;`);
  } catch (e) {
    // Column might already exist
  }
}

const hasPasswordHash = usersInfo.some((col: any) => col.name === 'password_hash');
if (usersInfo.length > 0 && !hasPasswordHash) {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT;`);
  } catch (e) {
    // Column might already exist
  }
}

const orgsInfo = db.prepare("PRAGMA table_info(organizations)").all() as any[];
const hasWebsiteUrl = orgsInfo.some((col: any) => col.name === 'website_url');
if (orgsInfo.length > 0 && !hasWebsiteUrl) {
  try {
    db.exec(`ALTER TABLE organizations ADD COLUMN website_url TEXT;`);
  } catch (e) {
    // Column might already exist
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema Initialization
// ──────────────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS organizations (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    website_url     TEXT,
    plan            TEXT NOT NULL DEFAULT 'pro',
    data_residency  TEXT NOT NULL DEFAULT 'us-east',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           TEXT,
    phone           TEXT,
    password_hash   TEXT,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'admin', -- 'superadmin', 'owner', 'admin', 'member'
    avatar_url      TEXT,
    last_login_at   TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id              TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    api_key         TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL DEFAULT 'Production Key',
    environment     TEXT NOT NULL DEFAULT 'production',
    allowed_origins TEXT NOT NULL DEFAULT '["*"]',
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id              TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    api_key_id      TEXT,
    session_id      TEXT,
    rating          INTEGER,
    quick_tags      TEXT DEFAULT '[]',
    raw_transcript  TEXT NOT NULL,
    summary         TEXT NOT NULL,
    category        TEXT, -- 'Bug', 'UX_Friction', 'Feature_Request', 'Performance', 'Billing', 'General_Praise'
    sentiment       TEXT, -- 'Positive', 'Neutral', 'Frustrated', 'Critical'
    actionable_item TEXT,
    tone_variations TEXT DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_review', 'resolved', 'ignored'
    client_context  TEXT,
    page_url        TEXT,
    page_pathname   TEXT,
    browser         TEXT,
    os              TEXT,
    device_type     TEXT DEFAULT 'desktop',
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS widget_configurations (
    id                  TEXT PRIMARY KEY,
    organization_id     TEXT UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    layout_mode         TEXT NOT NULL DEFAULT 'card', -- 'card', 'bottom-pill'
    default_animation   TEXT NOT NULL DEFAULT 'siri-wave',
    primary_color       TEXT NOT NULL DEFAULT '#06B6D4',
    position            TEXT NOT NULL DEFAULT 'bottom-right',
    header_title        TEXT NOT NULL DEFAULT "How's your experience? 🎯",
    header_subtitle     TEXT NOT NULL DEFAULT 'Tap a star to rate',
    enable_voice        INTEGER NOT NULL DEFAULT 1,
    enable_star_rating  INTEGER NOT NULL DEFAULT 1,
    trigger_style       TEXT NOT NULL DEFAULT 'pill-wave-voice',
    auto_collapse       INTEGER NOT NULL DEFAULT 1,
    quick_tag_presets   TEXT DEFAULT '["Bug / Error", "Slow / Laggy", "Confusing UI", "Missing Feature"]',
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS whatsapp_integrations (
    id                  TEXT PRIMARY KEY,
    organization_id     TEXT UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    phone_number        TEXT NOT NULL DEFAULT '+919013793020',
    recipient_name      TEXT NOT NULL DEFAULT 'Product Team',
    alert_critical_bugs INTEGER NOT NULL DEFAULT 1,
    alert_low_ratings   INTEGER NOT NULL DEFAULT 1,
    daily_digest_enabled INTEGER NOT NULL DEFAULT 1,
    daily_digest_time   TEXT DEFAULT '09:00',
    is_active           INTEGER NOT NULL DEFAULT 1,
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notification_logs (
    id              TEXT PRIMARY KEY,
    feedback_id     TEXT REFERENCES feedback(id) ON DELETE CASCADE,
    channel         TEXT NOT NULL, -- 'whatsapp', 'email'
    recipient       TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'sent',
    message_id      TEXT,
    sent_at         TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Safe column migrations for existing databases
try { db.exec("ALTER TABLE widget_configurations ADD COLUMN trigger_style TEXT DEFAULT 'pill-wave-voice'"); } catch (_) {}
try { db.exec("ALTER TABLE widget_configurations ADD COLUMN auto_collapse INTEGER DEFAULT 1"); } catch (_) {}

// ──────────────────────────────────────────────────────────────────────────────
// Seed Default Master & Demo Organizations
// ──────────────────────────────────────────────────────────────────────────────
export const MASTER_ORG_ID = 'org_master';
export const DEMO_ORG_ID = 'org_demo_sandbox';

// Clean up any legacy test / placeholder artifacts from initial development
try {
  db.prepare(`DELETE FROM organizations WHERE id = 'org_acme_analytics_master' OR slug = 'acme-analytics'`).run();
  db.prepare(`DELETE FROM organizations WHERE slug LIKE 'swiggy-foods%'`).run();
  db.prepare(`DELETE FROM users WHERE id = 'user_admin_01'`).run();
} catch (e) {}

// 1. Ensure Master Platform Organization for Vivek Mandal (Superadmin)
db.prepare(`
  INSERT OR REPLACE INTO organizations (id, name, slug, website_url, plan, data_residency)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  MASTER_ORG_ID,
  'SayPulse Master (NextGen Multiverse)',
  'master',
  'https://saypulse.nextgenmultiverse.com',
  'platform_owner',
  'us-east'
);

// 2. Ensure Superadmin User Vivek Mandal is bound to Master Org
db.prepare(`
  INSERT OR REPLACE INTO users (id, organization_id, email, phone, full_name, role)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  'user_superadmin_vivek',
  MASTER_ORG_ID,
  'vivek@nextgenmultiverse.com',
  '919013793020',
  'Vivek Mandal',
  'superadmin'
);

// 3. Ensure Master API Key
db.prepare(`
  INSERT OR REPLACE INTO api_keys (id, organization_id, api_key, name, environment, allowed_origins)
  VALUES (?, ?, ?, ?, ?, ?)
`).run('key_master_live', MASTER_ORG_ID, 'sp_live_master_9013793020', 'Master Platform Key', 'production', '["*"]');

// 4. Ensure Master Widget Configuration
db.prepare(`
  INSERT OR REPLACE INTO widget_configurations (id, organization_id, default_animation, primary_color, position)
  VALUES (?, ?, ?, ?, ?)
`).run('widget_cfg_master', MASTER_ORG_ID, 'siri-wave', '#06B6D4', 'bottom-right');

// 5. Ensure Isolated Demo Sandbox Organization for Public Testing (/admin/demo)
db.prepare(`
  INSERT OR REPLACE INTO organizations (id, name, slug, website_url, plan, data_residency)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  DEMO_ORG_ID,
  'Demo Sandbox',
  'demo',
  'https://saypulse.nextgenmultiverse.com/admin/demo',
  'sandbox',
  'us-east'
);

// 6. Ensure Demo Sandbox Member User
db.prepare(`
  INSERT OR REPLACE INTO users (id, organization_id, email, phone, full_name, role)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  'user_demo_guest',
  DEMO_ORG_ID,
  'demo@saypulse.ai',
  null,
  'Demo Visitor',
  'member'
);

// 7. Ensure Demo Sandbox API Key
db.prepare(`
  INSERT OR REPLACE INTO api_keys (id, organization_id, api_key, name, environment, allowed_origins)
  VALUES (?, ?, ?, ?, ?, ?)
`).run('key_demo_sandbox', DEMO_ORG_ID, 'sp_live_demo_sandbox', 'Demo Sandbox Key', 'development', '["*"]');

// 8. Ensure Demo Sandbox Widget Config
db.prepare(`
  INSERT OR REPLACE INTO widget_configurations (id, organization_id, default_animation, primary_color, position)
  VALUES (?, ?, ?, ?, ?)
`).run('widget_cfg_demo', DEMO_ORG_ID, 'siri-wave', '#06B6D4', 'bottom-right');

// 9. Seed Realistic Multi-Category Voice Feedback Records strictly for the Demo Org
const existingDemoFeedback = db.prepare('SELECT COUNT(*) as count FROM feedback WHERE organization_id = ?').get(DEMO_ORG_ID) as { count: number };

if (existingDemoFeedback.count === 0) {
  const SEED_FEEDBACK = [
    {
      id: 'fb_demo_001',
      rating: 1,
      quick_tags: ['Bug / Error', 'Slow / Laggy'],
      raw_transcript: "the export button is completely non-responsive on mobile safari and settings page won't load properly",
      summary: "User unable to export reports on mobile Safari due to unresponsive export button and slow settings loading.",
      category: 'Bug',
      sentiment: 'Critical',
      actionable_item: "Fix mobile Safari tap listener on Export button and optimize settings route bundle size.",
      tone_variations: {
        short: "Export button broken on mobile Safari.",
        formal: "The user reported functional issues with export and settings modules on mobile Safari.",
        elaborated: "A 1-star review was submitted highlighting that the export trigger on mobile browsers fails to respond to touch events and the settings page exhibits loading latency."
      },
      status: 'new',
      page_url: 'https://saypulse.nextgenmultiverse.com/admin/demo',
      page_pathname: '/admin/demo',
      browser: 'Mobile Safari',
      os: 'iOS 17.5',
      device_type: 'mobile',
      client_context: {
        routeHistory: ['/', '/demo'],
        consoleErrors: ["TypeError: Cannot read properties of undefined (reading 'exportBlob')"],
        viewport: { width: 393, height: 852 },
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)"
      },
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 'fb_demo_002',
      rating: 2,
      quick_tags: ['Confusing UI'],
      raw_transcript: "the cohort retention graph is really confusing to read on smaller screens because legends overlap",
      summary: "Cohort retention graph legends overlap and become illegible on smaller screen viewports.",
      category: 'UX_Friction',
      sentiment: 'Frustrated',
      actionable_item: "Implement responsive SVG legend wrapping or collapsible legend drawers for screens under 768px.",
      tone_variations: {
        short: "Cohort graph legends overlap on small screens.",
        formal: "The user noted usability friction with graph visualizations overlapping on restricted viewports.",
        elaborated: "The user expressed frustration with the cohort retention chart formatting on tablet/mobile screens where text overlapping degrades readability."
      },
      status: 'in_review',
      page_url: 'https://saypulse.nextgenmultiverse.com/admin/demo',
      page_pathname: '/admin/demo',
      browser: 'Chrome 128',
      os: 'macOS 15',
      device_type: 'desktop',
      client_context: {
        routeHistory: ['/demo'],
        consoleErrors: [],
        viewport: { width: 1280, height: 800 },
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      },
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'fb_demo_003',
      rating: 5,
      quick_tags: ['Loved the UX', 'Fast & Smooth', 'Helpful AI'],
      raw_transcript: "the voice feedback widget with the glowing siri wave is insane! it feels so natural and futuristic to use",
      summary: "User expressed strong praise for the voice widget interface and Siri-style holographic wave visualizer.",
      category: 'General_Praise',
      sentiment: 'Positive',
      actionable_item: "Share praise with the design and frontend engineering teams.",
      tone_variations: {
        short: "User loved the voice feedback widget and animations.",
        formal: "The user provided enthusiastic positive feedback regarding the futuristic design and fluidity of the voice interface.",
        elaborated: "The user submitted a 5-star rating specifically commending the futuristic aesthetic of the fluid waveform visualizer and natural voice interactions."
      },
      status: 'resolved',
      page_url: 'https://saypulse.nextgenmultiverse.com/admin/demo',
      page_pathname: '/admin/demo',
      browser: 'Chrome 128',
      os: 'macOS 15',
      device_type: 'desktop',
      client_context: {
        routeHistory: ['/'],
        consoleErrors: [],
        viewport: { width: 1440, height: 900 },
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      },
      created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
  ];

  const insertFb = db.prepare(`
    INSERT OR REPLACE INTO feedback (
      id, organization_id, api_key_id, rating, quick_tags, raw_transcript,
      summary, category, sentiment, actionable_item, tone_variations, status,
      page_url, page_pathname, browser, os, device_type, client_context, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  SEED_FEEDBACK.forEach((f) => {
    insertFb.run(
      f.id,
      DEMO_ORG_ID,
      'key_demo_sandbox',
      f.rating,
      JSON.stringify(f.quick_tags),
      f.raw_transcript,
      f.summary,
      f.category,
      f.sentiment,
      f.actionable_item,
      JSON.stringify(f.tone_variations),
      f.status,
      f.page_url,
      f.page_pathname,
      f.browser,
      f.os,
      f.device_type,
      JSON.stringify(f.client_context),
      f.created_at,
    );
  });
}

console.log('[SayPulse DB] Master platform organization and isolated Demo Sandbox initialized.');

// ──────────────────────────────────────────────────────────────────────────────
// Organization & Tenant Helpers
// ──────────────────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function getOrganizationBySlug(slug: string) {
  const cleanSlug = slugify(slug);
  return db.prepare('SELECT * FROM organizations WHERE slug = ?').get(cleanSlug) as any;
}

export function getOrganizationById(id: string) {
  return db.prepare('SELECT * FROM organizations WHERE id = ?').get(id) as any;
}

export function getOrganizationByPhone(phone: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const user = db
    .prepare('SELECT organization_id, role, full_name, email, phone FROM users WHERE phone LIKE ? LIMIT 1')
    .get(`%${cleanPhone.slice(-10)}%`) as any;

  if (!user) return null;
  const org = getOrganizationById(user.organization_id);
  return { ...org, user };
}

export function getOrganizationByEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const user = db
    .prepare('SELECT organization_id, role, full_name, email, phone FROM users WHERE email = ? LIMIT 1')
    .get(cleanEmail) as any;

  if (!user) return null;
  const org = getOrganizationById(user.organization_id);
  return { ...org, user };
}

export function getOrganizationAlertEmail(organizationIdOrSlug: string): string | null {
  const orgId = resolveOrgId(organizationIdOrSlug);
  const row = db
    .prepare(`
      SELECT email FROM users 
      WHERE organization_id = ? 
        AND email IS NOT NULL 
        AND email != '' 
        AND email NOT LIKE '%@workspace.saypulse' 
        AND email NOT LIKE '%@saypulse.ai'
      ORDER BY CASE WHEN role IN ('owner', 'superadmin') THEN 0 ELSE 1 END
      LIMIT 1
    `)
    .get(orgId) as { email: string } | undefined;

  return row?.email || null;
}

export function getUserWithCredentials(identifier: string) {
  const clean = identifier.trim();
  const cleanPhone = clean.replace(/[^0-9]/g, '');
  let user: any = null;

  if (clean.includes('@')) {
    user = db
      .prepare('SELECT id, organization_id, role, full_name, email, phone, password_hash FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1')
      .get(clean) as any;
  } else if (cleanPhone.length >= 7) {
    user = db
      .prepare('SELECT id, organization_id, role, full_name, email, phone, password_hash FROM users WHERE phone LIKE ? LIMIT 1')
      .get(`%${cleanPhone.slice(-10)}%`) as any;
  }

  if (!user) return null;
  const org = getOrganizationById(user.organization_id);
  return { ...user, organization: org };
}

export function createOrganization(data: {
  name: string;
  slug?: string;
  websiteUrl?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  passwordHash?: string;
  plan?: string;
}) {
  let baseSlug = slugify(data.slug || data.name);
  if (!baseSlug) baseSlug = `tenant-${Math.random().toString(36).substring(7)}`;

  // Ensure unique slug
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (getOrganizationBySlug(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter++}`;
  }

  const orgId = `org_${uuidv4().substring(0, 8)}`;
  const userId = `user_${uuidv4().substring(0, 8)}`;
  const apiKeyId = `key_${uuidv4().substring(0, 8)}`;
  const apiKeySecret = `sp_live_${uniqueSlug}_${Math.random().toString(36).substring(2, 10)}`;

  // 1. Create Organization Record
  db.prepare(`
    INSERT INTO organizations (id, name, slug, website_url, plan, data_residency)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(orgId, data.name, uniqueSlug, data.websiteUrl || null, data.plan || 'pro', 'us-east');

  // 2. Create Owner User Record
  db.prepare(`
    INSERT INTO users (id, organization_id, email, phone, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    orgId,
    data.ownerEmail || `${uniqueSlug}@workspace.saypulse`,
    data.ownerPhone || null,
    data.passwordHash || null,
    data.ownerName || 'Workspace Owner',
    'owner'
  );

  // 3. Create Dedicated Production API Key
  db.prepare(`
    INSERT INTO api_keys (id, organization_id, api_key, name, environment, allowed_origins)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(apiKeyId, orgId, apiKeySecret, 'Production API Key', 'production', '["*"]');

  // 4. Create Default Widget Configuration
  db.prepare(`
    INSERT INTO widget_configurations (id, organization_id, default_animation, primary_color, position)
    VALUES (?, ?, ?, ?, ?)
  `).run(`widget_cfg_${orgId}`, orgId, 'siri-wave', '#06B6D4', 'bottom-right');

  console.log(`[SayPulse Multi-Tenant] Provisioned new tenant: ${data.name} (/admin/${uniqueSlug})`);

  return {
    id: orgId,
    name: data.name,
    slug: uniqueSlug,
    apiKey: apiKeySecret,
    user: {
      id: userId,
      name: data.ownerName || 'Workspace Owner',
      role: 'owner',
      phone: data.ownerPhone,
      email: data.ownerEmail,
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Superadmin Master Helpers
// ──────────────────────────────────────────────────────────────────────────────

export function getAllOrganizationsWithStats() {
  const orgs = db
    .prepare(`
      SELECT 
        o.id, o.name, o.slug, o.website_url, o.plan, o.created_at,
        u.full_name as owner_name, u.phone as owner_phone, u.email as owner_email,
        k.api_key as primary_api_key,
        (SELECT COUNT(*) FROM feedback f WHERE f.organization_id = o.id) as feedback_count,
        (SELECT AVG(f.rating) FROM feedback f WHERE f.organization_id = o.id) as avg_rating
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.role IN ('owner', 'superadmin', 'member')
      LEFT JOIN api_keys k ON k.organization_id = o.id AND k.is_active = 1
      GROUP BY o.id
      ORDER BY CASE WHEN o.slug = 'master' THEN 0 WHEN o.slug = 'demo' THEN 2 ELSE 1 END, o.created_at DESC
    `)
    .all() as any[];

  return orgs.map((o) => ({
    ...o,
    feedback_count: o.feedback_count || 0,
    avg_rating: o.avg_rating ? Number(Number(o.avg_rating).toFixed(1)) : 5.0,
  }));
}

export function getGlobalPlatformAnalytics() {
  // Real platform metrics (excluding demo sandbox and master system org)
  const totalOrgs = db.prepare("SELECT COUNT(*) as count FROM organizations WHERE slug NOT IN ('demo', 'master')").get() as { count: number };
  const totalFeedback = db.prepare("SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM feedback WHERE organization_id NOT IN (SELECT id FROM organizations WHERE slug = 'demo')").get() as { count: number; avg_rating: number | null };
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE organization_id NOT IN (SELECT id FROM organizations WHERE slug = 'demo')").get() as { count: number };
  const criticalCount = db.prepare("SELECT COUNT(*) as count FROM feedback WHERE (sentiment = 'Critical' OR rating <= 2) AND organization_id NOT IN (SELECT id FROM organizations WHERE slug = 'demo')").get() as { count: number };

  return {
    totalOrganizations: totalOrgs.count || 0,
    totalVoiceFeedbacks: totalFeedback.count || 0,
    platformAverageCsat: totalFeedback.avg_rating ? Number(totalFeedback.avg_rating.toFixed(1)) : 5.0,
    totalPlatformUsers: totalUsers.count || 0,
    totalCriticalIssues: criticalCount.count || 0,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Multi-Tenant Repository Helpers (Scoped by OrgId or Slug)
// ──────────────────────────────────────────────────────────────────────────────

export function resolveOrgId(orgIdOrSlug?: string): string {
  if (!orgIdOrSlug) return MASTER_ORG_ID;
  if (orgIdOrSlug === 'demo') return DEMO_ORG_ID;
  if (orgIdOrSlug === 'master') return MASTER_ORG_ID;
  if (orgIdOrSlug.startsWith('org_')) return orgIdOrSlug;

  const org = getOrganizationBySlug(orgIdOrSlug);
  return org ? org.id : MASTER_ORG_ID;
}

export function validateApiKey(key: string): { partner: string; allowedOrigins: string[]; organizationId: string; apiKeyId: string } | null {
  const row = db
    .prepare(`
      SELECT k.id as api_key_id, k.organization_id, k.allowed_origins, o.name as partner
      FROM api_keys k
      JOIN organizations o ON k.organization_id = o.id
      WHERE k.api_key = ? AND k.is_active = 1
    `)
    .get(key) as any;

  if (!row) {
    if (key === 'sp_dev_local_master' || key === 'sp_live_master_9013793020') {
      return {
        partner: 'SayPulse Master',
        allowedOrigins: ['*'],
        organizationId: MASTER_ORG_ID,
        apiKeyId: 'key_master_live',
      };
    }
    return null;
  }

  return {
    partner: row.partner,
    allowedOrigins: JSON.parse(row.allowed_origins || '["*"]'),
    organizationId: row.organization_id,
    apiKeyId: row.api_key_id,
  };
}

export function saveFeedback(data: {
  apiKey: string;
  organizationId?: string;
  apiKeyId?: string;
  partner?: string;
  sessionId?: string;
  rating?: number;
  quickTags?: string[];
  rawTranscript?: string;
  summary: string;
  category?: string;
  sentiment?: string;
  actionableItem?: string;
  toneVariations?: Record<string, string>;
  context?: Record<string, unknown>;
}): string {
  const id = uuidv4();
  const orgId = data.organizationId || DEMO_ORG_ID;

  db.prepare(`
    INSERT INTO feedback (
      id, organization_id, api_key_id, session_id, rating, quick_tags,
      raw_transcript, summary, category, sentiment, actionable_item,
      tone_variations, client_context, page_url, page_pathname, browser, os, device_type, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    id,
    orgId,
    data.apiKeyId || 'key_local_master',
    data.sessionId ?? null,
    data.rating ?? null,
    JSON.stringify(data.quickTags ?? []),
    data.rawTranscript || data.summary,
    data.summary,
    data.category ?? 'General_Praise',
    data.sentiment ?? 'Neutral',
    data.actionableItem ?? null,
    JSON.stringify(data.toneVariations ?? {}),
    data.context ? JSON.stringify(data.context) : null,
    (data.context as any)?.url ?? null,
    (data.context as any)?.pathname ?? null,
    (data.context as any)?.browser ?? null,
    (data.context as any)?.os ?? null,
    (data.context as any)?.viewport?.width && (data.context as any)?.viewport?.width < 768 ? 'mobile' : 'desktop',
    new Date().toISOString(),
  );

  return id;
}

export function getFeedbackList(params: {
  organizationId?: string;
  orgSlug?: string;
  sentiment?: string;
  category?: string;
  rating?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const orgId = resolveOrgId(params.orgSlug || params.organizationId);
  const conditions: string[] = ['organization_id = ?'];
  const values: any[] = [orgId];

  if (params.sentiment && params.sentiment !== 'all') {
    conditions.push('sentiment = ?');
    values.push(params.sentiment);
  }

  if (params.category && params.category !== 'all') {
    conditions.push('category = ?');
    values.push(params.category);
  }

  if (params.status && params.status !== 'all') {
    conditions.push('status = ?');
    values.push(params.status);
  }

  if (params.rating) {
    conditions.push('rating = ?');
    values.push(params.rating);
  }

  if (params.search) {
    conditions.push('(summary LIKE ? OR raw_transcript LIKE ? OR page_pathname LIKE ?)');
    const term = `%${params.search}%`;
    values.push(term, term, term);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = params.limit || 50;
  const offset = params.offset || 0;

  const totalCount = db
    .prepare(`SELECT COUNT(*) as count FROM feedback ${whereClause}`)
    .get(...values) as { count: number };

  const rows = db
    .prepare(`
      SELECT * FROM feedback
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(...values, limit, offset) as any[];

  return {
    total: totalCount.count,
    items: rows.map((r) => ({
      ...r,
      quick_tags: JSON.parse(r.quick_tags || '[]'),
      tone_variations: JSON.parse(r.tone_variations || '{}'),
      client_context: JSON.parse(r.client_context || '{}'),
    })),
  };
}

export function getFeedbackById(id: string, organizationId?: string) {
  const orgId = resolveOrgId(organizationId);
  const row = db
    .prepare('SELECT * FROM feedback WHERE id = ? AND organization_id = ?')
    .get(id, orgId) as any;

  if (!row) return null;

  return {
    ...row,
    quick_tags: JSON.parse(row.quick_tags || '[]'),
    tone_variations: JSON.parse(row.tone_variations || '{}'),
    client_context: JSON.parse(row.client_context || '{}'),
  };
}

export function updateFeedbackStatus(id: string, status: string, organizationId?: string) {
  const orgId = resolveOrgId(organizationId);
  return db
    .prepare('UPDATE feedback SET status = ? WHERE id = ? AND organization_id = ?')
    .run(status, id, orgId);
}

export function getOrganizationAnalytics(organizationIdOrSlug?: string) {
  const orgId = resolveOrgId(organizationIdOrSlug);

  const org = getOrganizationById(orgId) || { name: 'Workspace', slug: 'workspace' };

  const totalRows = db
    .prepare('SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM feedback WHERE organization_id = ?')
    .get(orgId) as { total: number; avg_rating: number | null };

  const sentimentRows = db
    .prepare(`
      SELECT sentiment, COUNT(*) as count
      FROM feedback
      WHERE organization_id = ?
      GROUP BY sentiment
    `)
    .all(orgId) as { sentiment: string; count: number }[];

  const categoryRows = db
    .prepare(`
      SELECT category, COUNT(*) as count
      FROM feedback
      WHERE organization_id = ?
      GROUP BY category
    `)
    .all(orgId) as { category: string; count: number }[];

  const frictionPages = db
    .prepare(`
      SELECT page_pathname as path, COUNT(*) as count, AVG(rating) as avg_rating
      FROM feedback
      WHERE organization_id = ? AND (sentiment = 'Critical' OR sentiment = 'Frustrated' OR rating <= 2)
      GROUP BY page_pathname
      ORDER BY count DESC
      LIMIT 5
    `)
    .all(orgId) as { path: string; count: number; avg_rating: number }[];

  const openCriticalCount = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM feedback
      WHERE organization_id = ? AND (sentiment = 'Critical' OR category = 'Bug') AND status != 'resolved'
    `)
    .get(orgId) as { count: number };

  const sentimentMap: Record<string, number> = { Positive: 0, Neutral: 0, Frustrated: 0, Critical: 0 };
  sentimentRows.forEach((r) => {
    if (r.sentiment) sentimentMap[r.sentiment] = r.count;
  });

  const categoryMap: Record<string, number> = {};
  categoryRows.forEach((r) => {
    if (r.category) categoryMap[r.category] = r.count;
  });

  return {
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
    },
    totalFeedback: totalRows.total || 0,
    averageCsat: totalRows.avg_rating ? Number(totalRows.avg_rating.toFixed(1)) : 5.0,
    openCriticalIssues: openCriticalCount.count || 0,
    sentimentBreakdown: sentimentMap,
    categoryBreakdown: categoryMap,
    topFrictionPages: frictionPages.map((p) => ({
      path: p.path || '/',
      count: p.count,
      avgRating: Number((p.avg_rating || 1).toFixed(1)),
    })),
  };
}

export function getWidgetConfig(organizationIdOrSlug?: string) {
  const orgId = resolveOrgId(organizationIdOrSlug);
  const row = db
    .prepare('SELECT * FROM widget_configurations WHERE organization_id = ?')
    .get(orgId) as any;

  if (!row) {
    return {
      layout_mode: 'card',
      default_animation: 'siri-wave',
      trigger_style: 'pill-wave-voice',
      auto_collapse: true,
      primary_color: '#06B6D4',
      position: 'bottom-right',
      header_title: "How's your experience? 🎯",
      header_subtitle: 'Tap a star to rate',
      enable_voice: true,
      enable_star_rating: true,
      quick_tag_presets: ['Bug / Error', 'Slow / Laggy', 'Confusing UI', 'Missing Feature'],
    };
  }

  return {
    ...row,
    layout_mode: row.layout_mode || 'card',
    trigger_style: row.trigger_style || 'pill-wave-voice',
    auto_collapse: row.auto_collapse !== undefined ? Boolean(row.auto_collapse) : true,
    enable_voice: Boolean(row.enable_voice),
    enable_star_rating: Boolean(row.enable_star_rating),
    quick_tag_presets: JSON.parse(row.quick_tag_presets || '[]'),
  };
}

export function updateWidgetConfig(organizationIdOrSlug: string, data: any) {
  const orgId = resolveOrgId(organizationIdOrSlug);
  return db.prepare(`
    INSERT INTO widget_configurations (
      id, organization_id, layout_mode, default_animation, trigger_style, auto_collapse,
      primary_color, position, header_title, header_subtitle, enable_voice, enable_star_rating,
      quick_tag_presets, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(organization_id) DO UPDATE SET
      layout_mode = excluded.layout_mode,
      default_animation = excluded.default_animation,
      trigger_style = excluded.trigger_style,
      auto_collapse = excluded.auto_collapse,
      primary_color = excluded.primary_color,
      position = excluded.position,
      header_title = excluded.header_title,
      header_subtitle = excluded.header_subtitle,
      enable_voice = excluded.enable_voice,
      enable_star_rating = excluded.enable_star_rating,
      quick_tag_presets = excluded.quick_tag_presets,
      updated_at = datetime('now')
  `).run(
    uuidv4(),
    orgId,
    data.layout_mode || 'card',
    data.default_animation || 'siri-wave',
    data.trigger_style || 'pill-wave-voice',
    data.auto_collapse === false ? 0 : 1,
    data.primary_color || '#06B6D4',
    data.position || 'bottom-right',
    data.header_title || "How's your experience? 🎯",
    data.header_subtitle || 'Tap a star to rate',
    data.enable_voice ? 1 : 0,
    data.enable_star_rating ? 1 : 0,
    JSON.stringify(data.quick_tag_presets || []),
  );
}

export function getApiKeys(organizationIdOrSlug?: string) {
  const orgId = resolveOrgId(organizationIdOrSlug);
  return db
    .prepare('SELECT id, api_key, name, environment, allowed_origins, is_active, created_at FROM api_keys WHERE organization_id = ?')
    .all(orgId) as any[];
}
