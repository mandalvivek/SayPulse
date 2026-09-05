# SayPulse — Master Roadmap & Implementation Plan

## 1. Project Phasing Overview

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                               SAYPULSE ROADMAP PHASING                                │
├─────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ PHASE 1: Data & API     │ PHASE 2: Admin Portal UI    │ PHASE 3: WhatsApp Gateway     │
│ Multi-Tenant DB Schema  │ Executive Dashboard         │ Real-time Critical Alerts     │
│ Auth & Tenant Isolation │ Live Feedback Inbox         │ Daily Voice Digest            │
│ Organization CRUD       │ Detail Drill-down Modal     │ Interactive Action Buttons    │
├─────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ PHASE 4: Widget Studio  │ PHASE 5: Universal CDN      │ PHASE 6: Enterprise Sync      │
│ Animation Selector      │ Standalone saypulse.min.js  │ Linear / Jira 1-Click Sync    │
│ Brand Colors Customizer │ Shadow DOM Encapsulation    │ Slack / Discord Webhooks      │
│ Live Embedded Preview   │ 1-Line <script> Integration │ Production Hardening          │
└─────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

---

## 2. Detailed Milestone Breakdown

### 🎯 Phase 1: Multi-Tenant Database & Core API Extension
- [ ] Migrate database schema to support `organizations`, `users`, `api_keys`, `feedback`, `widget_configurations`, and `whatsapp_integrations`.
- [ ] Implement secure organization-scoped API queries (`GET /saypulse/v1/feedback`, `GET /saypulse/v1/analytics`).
- [ ] Seed initial multi-tenant test organizations (e.g. Acme Analytics, Local Dev).

### 🎯 Phase 2: Business Admin Portal UI (`apps/admin`)
- [ ] Build Next.js 14 Admin Portal layout with modern dark-mode aesthetics, responsive navigation, and authentication shell.
- [ ] **Executive Dashboard:** Live CSAT scorecard, Net Sentiment charts (Area chart), Category breakdown (Donut chart), and Top Friction Pages ranking.
- [ ] **Live Feedback Inbox:** Full-featured data table with filters (Sentiment, Category, Rating, Date Range), instant full-text search, and status badges (`New`, `In Review`, `Resolved`).

### 🎯 Phase 3: AI Detail Drill-Down Modal
- [ ] Build the slide-over / modal inspection panel displaying:
  - Exact Spoken Audio Transcript.
  - Gemini 3.6 Flash structured summary + tone variants.
  - Actionable product recommendations.
  - User Journey route breadcrumbs (`/pricing ➔ /signup ➔ /checkout`).
  - Technical metadata (device, browser, OS, viewport, console error stack trace).

### 🎯 Phase 4: WhatsApp API Gateway & Notifications
- [ ] Implement WhatsApp Gateway client module (`WhatsAppService`) supporting Meta Cloud API / MSC Gateway.
- [ ] Implement rule engine for instant alert triggers (`1-2 Star Rating` or `Critical Bug`).
- [ ] Build interactive WhatsApp message template generator with action buttons (`[View Details]`, `[Mark Resolved]`).
- [ ] Build webhook ingress endpoint (`POST /saypulse/v1/webhooks/whatsapp`) to update feedback status upon button clicks.

### 🎯 Phase 5: Widget Studio & Universal 1-Line `<script>` CDN Bundle
- [ ] Build `/widget-studio` page in Admin Portal with live visualizer preview and color/animation customizer.
- [ ] Compile `@saypulse/react` + `@saypulse/core` into a standalone, zero-dependency bundle **`saypulse.min.js`** using Shadow DOM.
- [ ] Verify 1-line script embedding across vanilla HTML, WordPress, and Shopify templates.

### 🎯 Phase 6: Enterprise Integrations & Production Hardening
- [ ] Slack & Discord webhook dispatcher for real-time channel alerts.
- [ ] 1-Click Linear & Jira ticket generation.
- [ ] End-to-end automated testing and cloud container deployment setup (Cloud Run / Railway / Docker).

---

## 3. Project Directory Architecture

```
saypulse/
├── apps/
│   ├── api/                     # Multi-tenant Express API & AI Pipeline
│   │   ├── src/
│   │   │   ├── db/              # Multi-tenant SQLite / Postgres schema & models
│   │   │   ├── middleware/      # Auth, Rate-limit, CORS, Tenant isolation
│   │   │   ├── routes/          # /summarize, /tone, /submit, /feedback, /analytics
│   │   │   ├── services/        # GeminiService, WhatsAppService, WebhookService
│   │   │   └── server.ts
│   │   └── package.json
│   ├── demo/                    # Partner website demo (Acme Analytics SaaS)
│   │   └── ...
│   └── admin/                   # Business Admin Portal (Next.js 14 Dashboard)
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/   # Executive Analytics & Charts
│       │   │   ├── feedback/    # Live Feedback Inbox & Drill-Down Modal
│       │   │   ├── widget/      # Widget Studio & Live Customizer
│       │   │   ├── settings/    # API Keys, Team, WhatsApp Gateway Setup
│       │   │   └── login/       # Authentication Shell
│       │   └── components/      # UI Charts, Modals, Cards, Filters
│       └── package.json
├── packages/
│   ├── core/                    # Headless AudioRecorder, PII, ApiClient, Context
│   ├── react/                   # React Components, Unboxed Visualizers (6 variants)
│   └── cdn/                     # Standalone saypulse.min.js (Shadow DOM embed bundle)
└── doc/                         # Master Architecture & Technical Specifications
    ├── 01_ARCHITECTURE_AND_SYSTEM_DESIGN.md
    ├── 02_DATABASE_SCHEMA_AND_MULTI_TENANCY.md
    ├── 03_ADMIN_PANEL_SPECIFICATION.md
    ├── 04_WHATSAPP_GATEWAY_INTEGRATION.md
    └── 05_ROADMAP_AND_IMPLEMENTATION_PLAN.md
```
