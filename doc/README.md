# SayPulse — Technical Documentation Index

Welcome to the **SayPulse** technical documentation suite. This folder contains the architectural blueprints, database schemas, Admin Portal specifications, WhatsApp Web Gateway OTP integration guides, FTP server deployment specifications, and master implementation roadmap.

---

## 📚 Documentation Index

| Document | Description | Key Topics Covered |
|---|---|---|
| **[01. Architecture & System Design](./01_ARCHITECTURE_AND_SYSTEM_DESIGN.md)** | End-to-end platform architecture & enterprise design | • Client Module (Widget & 1-line `<script>`)<br>• Gemini 3.6 Flash AI pipeline<br>• Business Admin Panel<br>• Email Alert Engine & WhatsApp Login OTP |
| **[02. Database Schema & Multi-Tenancy](./02_DATABASE_SCHEMA_AND_MULTI_TENANCY.md)** | Relational data model & multi-tenant isolation | • Organizations, Users, API Keys<br>• Feedback & Client Context models<br>• Widget Configurations & Email Alert settings<br>• Indexing & aggregation query optimization |
| **[03. Admin Panel Specification](./03_ADMIN_PANEL_SPECIFICATION.md)** | Complete UI/UX & feature specs for the Admin Portal | • Authentication (/login with Email & WhatsApp OTP)<br>• Executive KPIs & Sentiment charts<br>• Live Feedback Inbox & Filter toolbar<br>• Detail Drill-Down Modal & Widget Studio |
| **[04. WhatsApp Web Gateway & OTP](./04_WHATSAPP_GATEWAY_INTEGRATION.md)** | Passwordless Authentication OTP via WhatsApp | • WhatsApp Web Gateway 6-digit Login OTP<br>• Email OTP Verification flow<br>• 1-Tap Copy Code template<br>• Anti-brute force and session security |
| **[05. Master Roadmap & Implementation Plan](./05_ROADMAP_AND_IMPLEMENTATION_PLAN.md)** | Step-by-step milestone execution strategy | • 6-Phase implementation roadmap<br>• Monorepo directory structure (`apps/`, `packages/`)<br>• Verification & production deployment plan |
| **[06. FTP Deployment & Server Config](./06_FTP_DEPLOYMENT_AND_SERVER_CREDENTIALS.md)** | FTP server configuration & directory routing | • Host `ftp.nextgenmultiverse.com` (Port 21, PASV)<br>• Subdomain mappings (`services/saypulse/prod`, etc.)<br>• Automated deployment scripts & `.env.deploy` |

---

## 📄 Business Pitch Deck (PDF)
- **PDF Location:** `SayPulse_Business_Pitch_Deck.pdf` (Ready for executive presentations & client pitches)
- **HTML Template:** `saypulse/SayPulse_Pitch_Deck.html`
