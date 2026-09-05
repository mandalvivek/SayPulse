# SayPulse — Business Admin Panel Specification

## 1. Product Vision & Goals

The **SayPulse Business Admin Panel** (`app.saypulse.ai`) is the central intelligence workspace where business owners, product managers, designers, and engineering leads log in (via **Email OTP** or **WhatsApp Web Gateway OTP**) to monitor user sentiment, inspect AI-structured feedback, track friction clusters, configure embed widgets, and manage transactional email alert pipelines.

---

## 2. Core Navigation Structure

```
SayPulse Business Admin Portal
├── 🔐 0. Authentication Shell (/login — Email OTP [Default] & WhatsApp Web Gateway OTP)
├── 📊 1. Executive Dashboard (KPIs, CSAT, Sentiment Trends, Issue Hubs)
├── 📋 2. Live Feedback Inbox (Real-time Filterable Feed & Detail Modal)
├── 🧠 3. AI Insights & Clusters (Auto-Grouped Friction Patterns)
├── 🎨 4. Widget Studio (Live Customizer, Animation Selector, Embed Code)
├── 📧 5. Email Alerts & Notifications (Critical Bug Rules, Daily Digests)
├── 🔑 6. API Keys & Developers (Token Provisioning, Domain Restrictions)
└── ⚙️ 7. Organization Settings (Team Members, Billing, Data Retention)
```

---

## 3. Page-by-Page Specifications

### 3.1. Authentication Shell (`/login`)
A passwordless, frictionless sign-in gateway:
- **Primary Method (Default):** Business Email ➔ 6-digit Email OTP with 10-minute expiry.
- **Alternative Method (Mobile):** Phone Number ➔ 6-digit WhatsApp Web Gateway OTP with 1-tap copy link.
- **Security:** Anti-brute force throttling (5 max attempts), encrypted session tokens, zero password storage.

---

### 3.2. Executive Dashboard (`/dashboard` or `/admin`)
The command center providing executive visibility into product health:

- **Top KPI Scorecards:**
  - **Overall CSAT:** (e.g. `4.2 ★ / 5.0` with +/- trend vs last 7 days).
  - **Net Sentiment Score:** `% Positive` vs `% Critical`.
  - **Total Feedback Volume:** Total voice recordings captured this week/month.
  - **Critical Issues Open:** Count of unresolved `Bug` / `Critical` feedback items.
- **Visual Charts:**
  - **Sentiment Over Time:** Stacked area chart showing Positive, Neutral, Frustrated, and Critical streams.
  - **Category Breakdown:** Donut chart (`🐛 Bugs: 35%`, `😤 UX Issues: 40%`, `💡 Feature Requests: 25%`).
  - **Top Friction Pages:** Bar chart ranking the URLs with highest negative sentiment (e.g., `/checkout`, `/pricing`, `/onboarding`).

---

### 3.3. Live Feedback Inbox (`/admin/feedback`)
A high-efficiency inbox for triaging and reviewing feedback in real-time:

- **Filter & Search Toolbar:**
  - **Sentiment Filter:** `All`, `Critical`, `Frustrated`, `Neutral`, `Positive`.
  - **Category Filter:** `Bugs`, `UX Friction`, `Feature Requests`, `Performance`, `Billing`, `Praise`.
  - **Star Rating:** `1 Star` through `5 Stars`.
  - **Status Tabs:** `All`, `New`, `In Review`, `Resolved`.
  - **Keyword Search:** Instant full-text search across raw transcripts and Gemini summaries.
- **Table / Card Columns:**
  - **User Sentiment Badge** (`Critical`, `Positive`, etc. with distinct color accents).
  - **Star Rating & Tags** (`★★☆☆☆` • `Slow / Laggy`, `Confusing UI`).
  - **AI Structured Summary** (1–2 line core summary).
  - **Category & Page Route** (`🐛 Bug` on `/analytics`).
  - **Date & Device** (`2 hours ago` • `iOS Safari Mobile`).
  - **Status Workflow:** `New` ➔ `In Review` ➔ `Resolved` ➔ `Ignored`.

---

### 3.4. Feedback Detail Drill-Down Modal
Clicking any feedback item opens a slide-over modal containing full multi-dimensional intelligence:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎙️ Spoken Transcript (What the User Said)                                   │
│ "The checkout button doesn't respond when I tap it on my iPhone..."         │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✨ Gemini AI Structured Summary                                             │
│ "User unable to trigger checkout submission on iOS mobile Safari."          │
│ • Tone Variants: [Short] [Formal] [Elaborated]                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💡 Actionable Recommendation                                                │
│ "Inspect touch-event handlers and tap-target bounds on /checkout for iOS."  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🗺️ User Route Journey                                                       │
│ /pricing (2m 14s) ➔ /signup (45s) ➔ /checkout (Friction Point)              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💻 Client Technical Context                                                 │
│ • Device: iPhone 15 Pro • OS: iOS 17.5 • Browser: Mobile Safari             │
│ • Viewport: 393 x 852px • Screen DPR: 3.0                                   │
│ • Console Errors: [TypeError: Cannot read properties of null (reading 'tap')]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 🚀 Quick Actions                                                            │
│ [📋 Copy Summary] • [📧 Forward to Team] • [✓ Mark Resolved]                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.5. Widget Studio (`/admin/widget-studio`)
A live visualizer sandbox allowing businesses to style their feedback widget and copy the 1-line script tag:

- **Live Split-Screen:** Left side = customization controls; Right side = interactive live preview.
- **Controls:**
  - **Active Animation Selector:** Choose default animation style (*Siri Wave, Neural Sphere, Particle Ring, Nebula Plasma, Solar Ribbon, Laser Horizon*).
  - **Brand Colors:** Primary accent picker (Hex / Tailwind palette).
  - **Positioning:** Bottom-Right vs Bottom-Left (with custom offset margins).
  - **Copy Customization:** Custom header title, subtitle, and quick-tag chips.
  - **Embedding Snippet Generator:** One-click copy for **1-Line `<script>` Embed**, **React Component**, and **Next.js Integration**.

---

### 3.6. Email Alerts & Settings (`/admin/settings`)
Configure transactional email alert pipelines and developer tokens:

- **Email Alert Notifications:**
  - Alert recipient email address (e.g. `alerts@company.com`).
  - Alert triggers: `🚨 Alert immediately on Critical Bugs`, `⭐ Alert on 1-2 Star Ratings`.
  - Scheduled Daily Digest: 09:00 AM morning executive summary email.
  - Test Button: `[📧 Send Test Email Alert]`.
- **WhatsApp Web Gateway (Login OTP):**
  - Phone number configuration and test verification code dispatch.
- **Developer API Keys:**
  - Generate **Production** and **Staging** API Keys.
  - Restrict keys to specific allowed origins (`https://yourdomain.com`).
