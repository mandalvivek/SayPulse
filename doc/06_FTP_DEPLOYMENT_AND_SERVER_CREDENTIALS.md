# 🚀 NextGen Multiverse — FTP & Server Deployment Guide

**Version:** 1.0  
**Host Server:** `ftp.nextgenmultiverse.com`  
**Connection Type:** Passive FTP (Port 21)  
**Root Directory:** `/home/u459840062/domains/nextgenmultiverse.com/public_html`  

---

## 🔑 1. Connection Credentials

| Property | Value | Notes |
|---|---|---|
| **Host** | `ftp.nextgenmultiverse.com` | Primary FTP endpoint |
| **Port** | `21` | Standard FTP port |
| **Connection Type** | `FTP` | Standard FTP over IPv4 |
| **Username** | `u459840062.antigravity` | Dedicated deployment user |
| **Password** | `N7!qR4@vL9#xT2mK8pZ6` | Stored securely |
| **Transfer Mode** | **Passive Mode (PASV)** | Required by firewall/server |
| **Root Public Directory** | `/home/u459840062/domains/nextgenmultiverse.com/public_html` | Server public web root |

---

## 📁 2. Subdomain Directory Mapping

The subdomains and services are organized into distinct folders under the root directory:

```
/home/u459840062/domains/nextgenmultiverse.com/public_html/
├── services/
│   ├── saypulse/
│   │   ├── prod/        ➔ SayPulse AI Platform (Production CDN & Widget)
│   │   └── dev/         ➔ SayPulse AI Platform (Development / Staging)
│   ├── pay/
│   │   ├── prod/        ➔ Payment Gateway Microservice (Production)
│   │   └── dev/         ➔ Payment Gateway Microservice (Dev)
│   └── wa/
│       ├── prod/        ➔ WhatsApp Gateway / Baileys Connector (Production)
│       └── dev/         ➔ WhatsApp Gateway / Baileys Connector (Dev)
│
└── portals/
    ├── smartforms/
    │   ├── prod/        ➔ Smart Forms Portal (Production)
    │   └── dev/         ➔ Smart Forms Portal (Dev)
    └── samiti/
        ├── prod/        ➔ Samiti / Society Management (Production)
        └── dev/         ➔ Samiti / Society Management (Dev)
```

---

## 🛠️ 3. Node.js Automated Deployment Script Example

You can deploy builds (e.g. `@saypulse/cdn` or static portals) using `basic-ftp`:

```javascript
// deploy.js
const ftp = require('basic-ftp');
const path = require('path');

async function deploy(localDir, remoteSubdir) {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: 'ftp.nextgenmultiverse.com',
      port: 21,
      user: 'u459840062.antigravity',
      password: 'N7!qR4@vL9#xT2mK8pZ6',
      secure: false,
      pasv: true, // Passive mode
    });

    const targetDir = `/home/u459840062/domains/nextgenmultiverse.com/public_html/${remoteSubdir}`;
    console.log(`📁 Navigating to ${targetDir}...`);
    await client.ensureDir(targetDir);
    await client.clearWorkingDir();

    console.log(`🚀 Uploading ${localDir} ➔ ${targetDir}...`);
    await client.uploadFromDir(localDir);

    console.log('✅ Deployment successful!');
  } catch (err) {
    console.error('❌ Deployment failed:', err);
  } finally {
    client.close();
  }
}

// Deploy SayPulse Widget Bundle to Production:
// deploy(path.join(__dirname, 'packages/cdn/dist'), 'services/saypulse/prod');
```

---

## 🛡️ 4. Environment Variables (`.env.deploy`)

```env
FTP_HOST=ftp.nextgenmultiverse.com
FTP_PORT=21
FTP_USER=u459840062.antigravity
FTP_PASS=N7!qR4@vL9#xT2mK8pZ6
FTP_ROOT=/home/u459840062/domains/nextgenmultiverse.com/public_html
FTP_PASV=true
```
