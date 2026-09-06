# 🛡️ SayPulse — DPDP Act 2023, HIPAA & Audio Privacy Compliance Specification

**Platform:** SayPulse AI Voice Intelligence  
**Entity:** NextGen Multiverse Enterprises Pvt Ltd (`nextgenmultiverse.com`)  
**Status:** Production Standard | Zero-Storage Raw Audio Invariant  

---

## 1. Executive Summary & Privacy Principles

In modern enterprise voice feedback systems, user speech often contains inadvertent personally identifiable information (names, email addresses, phone numbers, or account references).

SayPulse enforces a strict **Zero-Trust Audio Pipeline**:

```
[ User Microphone Input ]
           │
[ 1. Web Speech / In-Memory Audio Buffer ]
           │
[ 2. Client-Side Regex PII Redactor ] ➔ (Scrubs credit cards, emails, phone numbers)
           │
[ 3. TLS 1.3 Transport to Gemini 3.6 Flash ]
           │
[ 4. Structured Synthesis (Summary, Category, Tasks) ]
           │
[ 5. Ephemeral Audio Purge ] ➔ (Raw audio is permanently discarded; ZERO raw voice files stored)
```

---

## 2. DPDP Act 2023 (Digital Personal Data Protection) Compliance

SayPulse strictly adheres to the provisions of the **Digital Personal Data Protection Act, 2023 (India)**:

1. **Lawful Processing & Explicit Consent:** Voice capture is only initiated upon explicit user interaction (tapping the floating microphone trigger).
2. **Purpose Limitation:** Spoken audio is exclusively used for generating structured user feedback tickets and CSAT analytics.
3. **Data Minimization:** No biometric voiceprints, acoustic signatures, or voice identifiers are extracted or stored.
4. **Zero Raw Audio Storage:** Raw audio chunks are processed in ephemeral server memory and wiped immediately upon completion of LLM synthesis.
5. **Right to Erasure & Correction:** Organization administrators can delete any feedback item, sentiment record, or user profile at any time with 1-click permanent database purging.

---

## 3. Client-Side PII Scrubbing Rules

Before transcripts or audio metadata leave the user's browser, the `@saypulse/core` PII Redactor automatically sanitizes strings against sensitive regex patterns:

| Sensitive Data Type | Pattern Sanitized | Replacement Token |
|---|---|---|
| **Credit / Debit Cards** | 13–19 digit Visa/Mastercard/Amex/RuPay | `[REDACTED_CARD]` |
| **Indian Phone Numbers** | 10-digit mobile & `+91` variations | `[REDACTED_PHONE]` |
| **Email Addresses** | Standard RFC 5322 email patterns | `[REDACTED_EMAIL]` |
| **Aadhaar / National ID** | 12-digit Indian national identity numbers | `[REDACTED_GOV_ID]` |

---

## 4. Encryption & Infrastructure Hardening

1. **In-Transit Encryption:** All API calls enforce **TLS 1.3** and `Strict-Transport-Security` (HSTS) with a 2-year preload directive (`max-age=63072000`).
2. **At-Rest Protection:** API tokens and session credentials are encrypted with salted **SHA-256** digests.
3. **Cross-Origin Protection:** Shadow DOM isolation in `saypulse.min.js` ensures third-party scripts on client websites cannot access SayPulse widget state.
