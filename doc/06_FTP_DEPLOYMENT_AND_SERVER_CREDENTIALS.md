# 🚀 NextGen Multiverse — FTP & Server Deployment Guide

**Version:** 2.0 (Production Live Edition)  
**Main Domain:** `https://saypulse.nextgenmultiverse.com`  
**Host Server:** `ftp.nextgenmultiverse.com` (Port 21, Passive Mode / PASV)  

---

## 🔑 1. Environment Connection Credentials

### 🟢 Production Deployment
| Property | Value |
|---|---|
| **Host** | `ftp.nextgenmultiverse.com` |
| **Port** | `21` (Passive Mode / PASV) |
| **Username** | `u459840062.antigravity` |
| **Password** | `N7!qR4@vL9#xT2mK8pZ6` |
| **Remote Directory** | `/home/u459840062/domains/nextgenmultiverse.com/public_html/services/saypulse/prod` |
| **Live URL / Subdomain** | **`https://saypulse.nextgenmultiverse.com`** |

### 🟡 Development Deployment
| Property | Value |
|---|---|
| **Host** | `ftp.nextgenmultiverse.com` |
| **Port** | `21` (Passive Mode / PASV) |
| **Username** | `u459840062.ag_dev_saypulse` |
| **Password** | `D3v!S6@pL8#qW1mZ` |
| **Remote Directory** | `services/saypulse/dev` (Chrooted to root `/`) |
| **Dev URL** | `https://services.nextgenmultiverse.com/saypulse/dev` |

---

## 📁 2. Subdomain Directory Mapping

```
ftp.nextgenmultiverse.com (Root: public_html)
├── services/
│   ├── saypulse/
│   │   ├── prod/        ➔ https://saypulse.nextgenmultiverse.com
│   │   └── dev/         ➔ https://services.nextgenmultiverse.com/saypulse/dev
│   ├── pay/
│   │   ├── prod/        ➔ Payment Gateway (Prod)
│   │   └── dev/         ➔ Payment Gateway (Dev)
│   └── wa/
│       ├── prod/        ➔ https://wa.nextgenmultiverse.com
│       └── dev/         ➔ https://dev-wa.nextgenmultiverse.com
│
└── portals/
    ├── smartforms/
    │   ├── prod/        ➔ Smart Forms Portal (Prod)
    │   └── dev/         ➔ Smart Forms Portal (Dev)
    └── samiti/
        ├── prod/        ➔ Samiti Management (Prod)
        └── dev/         ➔ Samiti Management (Dev)
```

---

## ⚡ 3. Universal 1-Line Embed Script (Production CDN)

```html
<!-- SayPulse AI Voice Feedback Widget -->
<script 
  src="https://saypulse.nextgenmultiverse.com/saypulse.min.js" 
  data-key="sp_live_your_project_key" 
  data-position="bottom-right" 
  data-color="#06B6D4" 
  data-animation="siri-wave" 
  defer>
</script>
```

---

## 🛠️ 4. One-Command Automated Deployers

- **Deploy to Production:**
  ```bash
  python3 deploy_prod_ftp.py
  ```
- **Deploy to Development:**
  ```bash
  python3 deploy_dev_ftp.py
  ```
