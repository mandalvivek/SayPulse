# SayPulse — NextGen WhatsApp Gateway & Login OTP Specification

## 1. Overview & Architectural Role

In the SayPulse enterprise ecosystem, **NextGen WhatsApp Communication Gateway** is dedicated exclusively to **Authentication & Passwordless Login OTP**. 

All operational notifications, critical bug alerts, and executive digests are strictly dispatched via **Email**, ensuring complete work-life separation and zero spam compliance risk.

---

## 2. Gateway Endpoints & Network Topology

| Environment | Base Gateway URL | Admin Management Portal |
|---|---|---|
| **Development / Staging** | `https://dev-wa.nextgenmultiverse.com` | `https://dev-wa.nextgenmultiverse.com/admin` |
| **Production** | `https://wa.nextgenmultiverse.com` | `https://wa.nextgenmultiverse.com/admin` |

- **HTTP Method:** `POST`
- **Path:** `/api/v1/send-message`
- **Headers:**
  - `x-api-key: <YOUR_MHC_API_KEY>`
  - `Content-Type: application/json`

---

## 3. Authentication Flow Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as Business User / Admin
    actor Superadmin as Platform Superadmin (9013793020)
    participant LoginUI as SayPulse Login Screen (/login)
    participant AuthAPI as Auth Service (apps/api)
    participant WAGateway as NextGen WhatsApp Gateway (dev-wa.nextgenmultiverse.com)
    participant EmailGateway as Transactional Email Engine
    participant DB as Multi-Tenant Database

    alt Login Method: Email OTP (Default)
        User->>LoginUI: Enters business email (alex@acmeanalytics.com)
        LoginUI->>AuthAPI: POST /saypulse/v1/auth/send-otp { method: "email" }
        AuthAPI->>DB: Store 6-digit OTP with 10-minute expiry
        AuthAPI->>EmailGateway: Dispatch Email with 6-digit OTP
        EmailGateway->>User: 📧 Email received with OTP
    else Login Method: WhatsApp OTP (Mobile Login)
        User->>LoginUI: Enters phone number (9013793020)
        LoginUI->>AuthAPI: POST /saypulse/v1/auth/send-otp { method: "whatsapp", phone: "9013793020" }
        AuthAPI->>DB: Store 6-digit OTP with 10-minute expiry
        AuthAPI->>WAGateway: POST https://dev-wa.nextgenmultiverse.com/api/v1/send-message
        WAGateway->>User: 📲 WhatsApp message with 1-tap Copy Code
    end

    User->>LoginUI: Enters 6-digit OTP
    LoginUI->>AuthAPI: POST /saypulse/v1/auth/verify-otp { target, otp }
    AuthAPI->>DB: Validate OTP & invalidate code (prevent replay)
    
    alt User is Superadmin (9013793020)
        AuthAPI-->>LoginUI: { success: true, isSuperAdmin: true, redirectUrl: "/admin/master" }
        LoginUI->>Superadmin: Redirects to Master Command Center
    else Existing Business Tenant
        AuthAPI-->>LoginUI: { success: true, isNewUser: false, redirectUrl: "/admin/[slug]" }
        LoginUI->>User: Redirects to Tenant Dashboard
    else New User
        AuthAPI-->>LoginUI: { success: true, isNewUser: true }
        LoginUI->>User: Shows 1-Step Onboarding Modal
    end
```

---

## 4. WhatsApp OTP Message Format

```
🔐 *SayPulse Login Verification*

Your One-Time Password (OTP) is: *{{OTP}}*

⏰ _Valid for 10 minutes. Do not share this code with anyone for security._
```

---

## 5. Security & Rate Limiting Controls

1. **Anti-Replay Invalidation:** Once verified, the OTP is instantly purged from memory.
2. **Anti-Brute Force:** Max 5 incorrect OTP verification attempts allowed before automatic invalidation.
3. **Anti-Spam Dispatch Throttling:** 30-second cooldown between OTP requests per phone number.
4. **Phone Sanitization:** Automatic international prefixing (`91` for Indian numbers) ensuring correct Baileys routing.
