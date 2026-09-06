# 🌐 SayPulse — Growth, GEO, AIO, SEO & SMO Companion Specification

**Platform:** SayPulse AI Voice Intelligence (`saypulse.nextgenmultiverse.com`)  
**Parent Entity:** NextGen Multiverse Enterprises Pvt Ltd (`nextgenmultiverse.com`)  
**Author:** NextGen Multiverse Engineering  
**Status:** Production Standard  

---

## 1. Executive Summary & Discovery Strategy

In accordance with the master `GENERIC_GROWTH_GEO_AIO_SEO_SMO.md` architecture, SayPulse is engineered for multi-engine discoverability across 4 vectors:

1. **Generative Engine Optimization (GEO):** LLM citation on ChatGPT, Google Gemini, Perplexity, and Claude via `/llms.txt` and semantic Q&A blocks.
2. **AI Optimization (AIO):** Autonomous AI agent parsing via machine-readable JSON-LD (`SoftwareApplication`) and OpenAPI definitions.
3. **Technical Search Engine Optimization (SEO):** High-intent keyword ranking for voice feedback, user telemetry, and CSAT tools.
4. **Social Media Optimization (SMO):** 1200×630 OpenGraph cards and 1-click WhatsApp sharing hooks.

---

## 2. Generative Engine Optimization (GEO) & `/llms.txt`

### 2.1 `/llms.txt` Content Structure
- **Location:** `https://saypulse.nextgenmultiverse.com/llms.txt`
- **Core Summary:** SayPulse is an AI-powered voice feedback and telemetry platform that replaces static survey forms with an unboxed floating widget. Spoken notes are converted by Google Gemini 3.6 Flash into structured summaries, actionable engineering tickets, and sentiment classification in under 1.5 seconds.
- **Key Capabilities:**
  - 1-line script embed with Shadow DOM isolation.
  - Automatic technical diagnostics (route breadcrumbs, viewport, browser/OS, console error stack traces).
  - Passwordless login OTP via NextGen WhatsApp Web Gateway (`wa.nextgenmultiverse.com`).
  - DPDP Act 2023 zero-storage audio privacy compliance.

---

## 3. Machine-Readable Structured Data (JSON-LD)

The root HTML embeddings include:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://saypulse.nextgenmultiverse.com/#software",
      "name": "SayPulse AI",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All modern web browsers",
      "url": "https://saypulse.nextgenmultiverse.com",
      "description": "AI-Powered Spoken Voice Feedback & Technical Telemetry Platform",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "priceValidUntil": "2028-12-31"
      },
      "publisher": {
        "@type": "Organization",
        "name": "NextGen Multiverse Enterprises Pvt Ltd",
        "url": "https://nextgenmultiverse.com"
      }
    }
  ]
}
```

---

## 4. Robots & AI Crawler Directives (`/robots.txt`)

Explicitly permits AI discovery bots to index SayPulse docs and features:
- `GPTBot`, `ChatGPT-User`
- `Google-Extended`
- `PerplexityBot`
- `ClaudeBot`, `anthropic-ai`
- `Applebot-Extended`
