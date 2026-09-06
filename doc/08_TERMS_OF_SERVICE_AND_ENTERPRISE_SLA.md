# 📜 SayPulse — Terms of Service & Enterprise Service Level Agreement (SLA)

**Platform:** SayPulse AI Voice Intelligence  
**Operating Entity:** NextGen Multiverse Enterprises Pvt Ltd (`nextgenmultiverse.com`)  
**Effective Date:** September 2026  

---

## 1. Terms of Service Agreement

By integrating the SayPulse 1-line script (`saypulse.min.js`) or using the SayPulse Admin Dashboard, business tenants agree to:

1. **Fair Use & Rate Limits:** Tenants must not exceed their tier quotas (500 notes/mo for Starter, 3,000 notes/mo for Growth, unlimited for Enterprise).
2. **Acceptable Content:** SayPulse must not be used to capture non-consensual surveillance, harassment, or illegal material.
3. **Data Ownership:** All customer feedback data, sentiment scores, and telemetry captured through a tenant's API key belong 100% to that tenant. NextGen Multiverse will never sell, lease, or use tenant feedback data to train public foundation models.

---

## 2. Enterprise Service Level Agreement (SLA)

NextGen Multiverse guarantees the following uptime and operational metrics for SayPulse Production Services (`saypulse.nextgenmultiverse.com`):

### A. Uptime Commitments
| Service Layer | Target Uptime SLA | Monthly Maximum Allowed Downtime |
|---|:---:|:---:|
| **Universal CDN Embed (`saypulse.min.js`)** | **99.99%** | < 4.3 minutes / month |
| **Synthesis API Gateway (`/feedback/*`)** | **99.95%** | < 21.6 minutes / month |
| **WhatsApp Web Gateway OTP (`/auth/*`)** | **99.90%** | < 43.2 minutes / month |
| **Admin Dashboard & Reporting** | **99.90%** | < 43.2 minutes / month |

### B. Latency Invariants
- **Gemini 3.6 Flash Voice Synthesis:** < 1.5 seconds median response time (P95 < 2.8s).
- **CDN Script Delivery:** < 35ms edge latency via Hostinger / Cloudflare CDN edge caching.

---

## 3. Incident Severity & Support Tiers

| Severity Level | Definition | Enterprise Plan Response Time | Standard Plan Response Time |
|---|---|:---:|:---:|
| **P1 — Critical Outage** | CDN widget or feedback synthesis completely down across all users | **< 15 minutes** | < 2 hours |
| **P2 — Major Degradation** | High latency (>5s) or WhatsApp OTP delayed | **< 1 hour** | < 6 hours |
| **P3 — Minor Inconvenience** | Dashboard UI visual glitch or non-critical filter issue | **< 6 hours** | < 24 hours |
| **P4 — General Inquiry** | Configuration assistance, custom domain setup | **< 12 hours** | < 48 hours |

---

## 4. Legal Jurisdiction & Dispute Resolution

These terms are governed by the laws of the **Republic of India**. Any disputes arising under this agreement shall be subject to the exclusive jurisdiction of the courts in **New Delhi, India**.
