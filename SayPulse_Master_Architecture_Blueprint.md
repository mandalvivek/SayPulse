# SayPulse — AI Voice Feedback SDK: Master Architecture & Product Documentation

> **Product Name:** SayPulse (`@saypulse/core`, `@saypulse/react`)  
> **Document Type:** Cumulative Master Specification & Engineering Blueprint  
> **Target Audience:** Engineering, Product, AI Agents (Antigravity), Security, and Operations  
> **Version:** 1.0.0-PROD  
> **Status:** Approved for Implementation  
> **Date:** August 2026  

---

## Table of Contents

1. [Section 1: Product Vision & Strategic Charter](#section-1-product-vision--strategic-charter)
2. [Section 2: Business Requirements Document (BRD) & PRD](#section-2-business-requirements-document-brd--prd)
3. [Section 3: Brand Guidelines & Design System](#section-3-brand-guidelines--design-system)
4. [Section 4: Engineering Constitution & Core Principles](#section-4-engineering-constitution--core-principles)
5. [Section 5: Modular Architecture & Technical Blueprint](#section-5-modular-architecture--technical-blueprint)
6. [Section 6: Security, Privacy & Compliance Framework](#section-6-security-privacy--compliance-framework)
7. [Section 7: Master Roadmap & Feature Matrix](#section-7-master-roadmap--feature-matrix)
8. [Section 8: Phased Implementation & Sprint Delivery Plan](#section-8-phased-implementation--sprint-delivery-plan)
9. [Section 9: Support Operations & Triage SOP](#section-9-support-operations--triage-sop)
10. [Section 10: Technical Knowledge Transfer (KT) & Developer Onboarding](#section-10-technical-knowledge-transfer-kt--developer-onboarding)

---

# Section 1: Product Vision & Strategic Charter

### 1.1 Executive Summary
Traditional web and mobile feedback loops suffer from an industry-wide response paradox: users experience friction in real-time but abandon feedback widgets because typing, categorizing, and articulating issues in static forms takes too much effort. **SayPulse** transforms user feedback from a high-friction survey into an ambient, multimodal voice-first experience.

Users can tap an intuitive visual mic, speak freely in natural language while continuing to navigate the application, and let an intelligent AI engine (powered by Gemini) auto-transcribe, summarize, categorize, and tone-refine their feedback before submission.

### 1.2 Core Value Propositions
* **Zero Friction Capture:** Sub-second voice recording with real-time waveform visualizers and push-to-talk simplicity.
* **Persistent Session Continuity:** Active audio recording and session context persist seamlessly across route changes and SPA navigation.
* **Intelligent Auto-Structuring:** AI automatically separates noise from signal, generating clear issue summaries, category tags (Bug, UX Friction, Feature Request, Billing), sentiment ratings, and technical diagnostics.
* **User-Empowered Refinement:** Instant one-click AI tone chips (`Shorten`, `Formalize`, `Elaborate`) and manual edit options before user consent.
* **Enterprise Integration:** Drop-in lightweight NPM package and vanilla `<script>` tag with zero heavy dependencies.

---

# Section 2: Business Requirements Document (BRD) & PRD

### 2.1 Problem Statement
1. **Low Completion Rates:** Traditional NPS and CSAT forms have a <2% completion rate on web and mobile.
2. **Poor Quality Data:** Text feedback is either single-word ("broken", "bad") or missing vital route and system context.
3. **High Admin Triage Cost:** Product managers and engineers spend hundreds of hours reading unstructured feedback and manually triaging tickets into Jira/Linear.

### 2.2 Functional Requirements

| ID | Feature | Description | Priority |
|:---|:---|:---|:---|
| **FR-01** | Rating Widget | 1 to 5 star rating popover triggered via floating badge. | P0 |
| **FR-02** | Conditional Sub-3 Flow | If rating ≤ 3, display quick tags (Bug, Slow, Confusing UI) & voice prompt. | P0 |
| **FR-03** | Ambient Voice Capture | Bottom floating pill with Web Audio API wave visualizer; speech-to-text streaming. | P0 |
| **FR-04** | Cross-Route Persistence | Audio recording & session state continue uninterrupted across client routes. | P0 |
| **FR-05** | AI Summarization | Gemini API generates structured summary, intent, sentiment, and category. | P0 |
| **FR-06** | Tone Modification Chips | Real-time re-write chips (`Shorten`, `Formalize`, `Elaborate`) for user review. | P1 |
| **FR-07** | Automated Context Harvest | Captures URL route, breadcrumb path, viewport, OS/browser, and DOM error state. | P0 |
| **FR-08** | Admin Analytics View | Centralized dashboard for auto-clustered feedback, sentiment metrics, and exports. | P1 |

### 2.3 Non-Functional Requirements (NFR)
* **SDK Bundle Size:** `< 28 KB` gzipped (tree-shakeable).
* **Latency:** Voice-to-summary preview render within `< 1.2s` of mic pause.
* **Browser Compatibility:** Chrome, Safari (Desktop/iOS), Edge, Firefox.
* **Accessibility:** Full WCAG 2.1 AA compliance with keyboard navigation (`Tab`, `Space`, `Esc`) and ARIA labels.

---

# Section 3: Brand Guidelines & Design System

### 3.1 Brand Identity: SayPulse
* **Tagline:** *"Capture the pulse of your users in their own voice."*
* **Design Philosophy:** Ambient, non-intrusive, fluid micro-interactions with 60fps dynamic equalizer feedback.

### 3.2 Color Palette

```
+------------------------------------------------------------------------+
| Color Name        | Hex Code  | Usage                                  |
+-------------------+-----------+----------------------------------------+
| Primary Slate     | #0F172A   | Text, primary containers, deep headers |
| Electric Cyan     | #06B6D4   | Mic active state, waveform accent      |
| Pulse Indigo      | #6366F1   | Primary action buttons, active stars   |
| Surface Light     | #F8FAFC   | Card backgrounds, popover canvas       |
| Warning Amber     | #F59E0B   | Low-rating highlight (1-3 stars)       |
| Success Emerald   | #10B981   | Positive confirmation, 4-5 stars       |
+------------------------------------------------------------------------+
```

### 3.3 Typography & Animation Specs
* **Primary Font:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
* **Waveform Animation:** Smooth 60fps canvas visualizer rendering 5-7 vertical frequency bars reacting to `AnalyserNode.getByteFrequencyData()`.
* **Motion Curves:** `cubic-bezier(0.16, 1, 0.3, 1)` for spring popovers and pill expansions.

---

# Section 4: Engineering Constitution & Core Principles

### 4.1 Golden Rules
1. **Zero Layout Shift (CLS):** Floating widgets must exist in isolated fixed portals (`id="saypulse-root"`) and never alter host DOM geometry.
2. **Privacy First (No Unannounced Recording):** Audio recording must only activate upon explicit user gesture (click/tap). The active recording state must be visually undeniable via glowing bottom indicators.
3. **Resilient Degradation:** If microphone permissions are denied or Web Audio API fails, the widget automatically falls back to structured quick-tags and an editable text box.
4. **Zero Main-Thread Blocking:** Audio chunk encoding and metadata packaging must run asynchronously or inside Web Workers.

### 4.2 Code Standards & Conventions
* Strict TypeScript (`strict: true`, `noImplicitAny: true`).
* Framework Agnostic Core: Core logic (`AudioEngine`, `PersistenceManager`, `ApiClient`) decoupled from UI wrappers (React, Vue, Web Components).
* Clean separation of concerns: Presentational components vs. Custom state hooks.

---

# Section 5: Modular Architecture & Technical Blueprint

### 5.1 System Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                            Host Web Application                               |
|                                                                               |
|   +-----------------------------------------------------------------------+   |
|   |                         SayPulse SDK Root                             |   |
|   |                                                                       |   |
|   |   +---------------------+  +--------------------+  +--------------+   |   |
|   |   | FloatingTriggerButton|  | StarRatingPopover  |  | AudioVisualizer|   |
|   |   +---------------------+  +--------------------+  +--------------+   |   |
|   |             |                        |                     |          |   |
|   |   +---------------------------------------------------------------+   |   |
|   |   |                      SayPulse Core State                      |   |   |
|   |   |  - useAudioRecorder     - useSessionPersistence               |   |   |
|   |   |  - useMetadataHarvester - useFeedbackStore                    |   |   |
|   |   +---------------------------------------------------------------+   |   |
|   +--------------------------------------|--------------------------------+   |
+------------------------------------------|------------------------------------+
                                           | HTTPS / WebSockets
                                           v
+-------------------------------------------------------------------------------+
|                         SayPulse Backend Service                              |
|                                                                               |
|   +-----------------------+   +-------------------+   +-------------------+   |
|   | Route: /api/summarize |   | Route: /api/submit|   | Route: /api/tone  |   |
|   +-----------------------+   +-------------------+   +-------------------+   |
|               |                         |                       |             |
|   +-----------------------------------------------------------------------+   |
|   |                           Gemini Processing Engine                    |   |
|   |  * Multimodal Audio / Speech-to-Text Pipeline                         |   |
|   |  * Structured JSON Extraction (Sentiment, Category, Action Item)      |   |
|   |  * Contextual Tone Rewriter (Shorten, Formalize, Elaborate)           |   |
|   +-----------------------------------------------------------------------+   |
|                                           |                                   |
|                                           v                                   |
|   +-----------------------------------------------------------------------+   |
|   |                PostgreSQL / Vector DB (Clustering)                    |   |
|   +-----------------------------------------------------------------------+   |
+-------------------------------------------------------------------------------+
```

### 5.2 Module Breakdown

1. **`packages/core`**:
   * `AudioRecorder.ts`: Handles `navigator.mediaDevices.getUserMedia`, `MediaRecorder`, and `AudioContext` analysis.
   * `StorageBridge.ts`: Serializes ongoing speech buffers and route history into `sessionStorage`.
   * `ContextHarvester.ts`: Collects route breadcrumbs, user agent, viewport, and client performance logs.

2. **`packages/react`**:
   * `<SayPulseWidget />`: Master container mounted at application root.
   * `<RatingBar />`: Interactive 1-5 star selector with hover feedback.
   * `<BottomMicPill />`: Floating bottom bar featuring live canvas equalizer.
   * `<SummaryReviewModal />`: AI summary review, editable markdown area, tone modifiers.

3. **`backend/api`**:
   * Gemini API integration utilizing Structured Outputs (`response_mime_type: "application/json"`).

### 5.3 Data Contracts & JSON Schemas

#### Gemini Structured Output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FeedbackAnalysisResponse",
  "type": "object",
  "properties": {
    "summary": {
      "type": "string",
      "description": "Crisp 1-2 sentence summary of what the user experienced."
    },
    "category": {
      "type": "string",
      "enum": ["Bug", "UX_Friction", "Feature_Request", "Performance", "Billing", "General_Praise"]
    },
    "sentiment": {
      "type": "string",
      "enum": ["Positive", "Neutral", "Frustrated", "Critical"]
    },
    "actionable_item": {
      "type": "string",
      "description": "Clear recommendation for product/engineering."
    },
    "tone_variations": {
      "type": "object",
      "properties": {
        "short": { "type": "string" },
        "formal": { "type": "string" },
        "elaborated": { "type": "string" }
      },
      "required": ["short", "formal", "elaborated"]
    }
  },
  "required": ["summary", "category", "sentiment", "actionable_item", "tone_variations"]
}
```

---

# Section 6: Security, Privacy & Compliance Framework

### 6.1 Data Governance & Healthcare Privacy (HIPAA Alignment)
* **Client-Side PII/PHI Redaction:** Regex and NER filter runs before audio/text payload dispatch to strip SSN, Credit Cards, Medical Record Numbers, and Phone Numbers.
* **Audio Ephemerality:** Audio stream chunks are converted to structured text and immediately purged from memory. Raw voice audio is **never** persisted to disk unless explicit user compliance opt-in is configured.
* **Transport Security:** TLS 1.3 encryption for all REST/WebSocket connections.
* **Zero Host App Pollution:** Host window cookies, local storage tokens, and auth secrets are isolated outside SDK scope.

---

# Section 7: Master Roadmap & Feature Matrix

```
+-------------------------------------------------------------------------------+
| Phase    | Timeline   | Deliverables                                          |
+----------+------------+-------------------------------------------------------+
| Phase 1  | Weeks 1-2  | Lightweight Web SDK (@saypulse/react), 1-5 Rating,    |
|          |            | Push-to-Talk Mic, Gemini Summarization & Tone Chips.  |
| Phase 2  | Weeks 3-4  | Cross-Route Session Memory, DOM context harvest,      |
|          |            | PHI/PII Redaction engine, Vue/Vanilla Wrappers.       |
| Phase 3  | Weeks 5-6  | SayPulse Admin Dashboard, Semantic Clustering,        |
|          |            | Jira/Linear Auto-Sync, React Native / iOS / Android.  |
+-------------------------------------------------------------------------------+
```

---

# Section 8: Phased Implementation & Sprint Delivery Plan

### Sprint 1: SDK Core & Audio Pipeline (Days 1–5)
* Initialize Turborepo / NPM workspace (`@saypulse/core`, `@saypulse/react`).
* Build `useAudioRecorder` with canvas waveform integration.
* Implement 1-5 star popover with sub-3 star conditional trigger.

### Sprint 2: Gemini API Integration & Tone Refinement (Days 6–10)
* Build Next.js / Node.js backend routes (`/api/feedback/summarize`, `/api/feedback/submit`).
* Implement Gemini prompt with structured JSON output enforcement.
* Build `<SummaryReviewModal />` with interactive `[Shorten]`, `[Formalize]`, `[Elaborate]` chips.

### Sprint 3: Route Persistence & Hardening (Days 11–15)
* Implement `sessionStorage` route tracking & audio buffer persistence across route changes.
* Add accessibility keyboard navigation and screen reader tags.
* Unit & end-to-end integration tests (Playwright + Vitest).

---

# Section 9: Support Operations & Triage SOP

### 9.1 Feedback Triage Workflow
1. **Intake:** Feedback lands via `/api/feedback/submit` with auto-assigned category and sentiment.
2. **Auto-Routing:**
   * `Category == Bug` AND `Sentiment == Critical` -> Immediate notification to On-Call Slack channel + Linear ticket creation.
   * `Category == Feature_Request` -> Grouped into Weekly Product Review backlog.
3. **Escalation SLA:** Critical bugs flagged by ≥ 3 unique sessions within 1 hour trigger P1 Alert.

---

# Section 10: Technical Knowledge Transfer (KT) & Developer Onboarding

### 10.1 Quick Start Integration Guide

#### Option A: React / Next.js
```tsx
import { SayPulseProvider, SayPulseWidget } from '@saypulse/react';
import '@saypulse/react/dist/index.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SayPulseProvider
          apiKey={process.env.NEXT_PUBLIC_SAYPULSE_KEY!}
          apiEndpoint="/api/feedback"
          options={{
            allowVoice: true,
            persistAcrossRoutes: true,
            theme: 'dark'
          }}
        >
          {children}
          <SayPulseWidget />
        </SayPulseProvider>
      </body>
    </html>
  );
}
```

#### Option B: Vanilla JavaScript / HTML Script Tag
```html
<script 
  src="https://cdn.saypulse.dev/sdk/v1/saypulse.min.js" 
  data-api-key="YOUR_API_KEY" 
  data-persist-routes="true" 
  defer>
</script>
```

---
*End of Master Blueprint Document.*
