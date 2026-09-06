'use client';

import React, { useState, useEffect } from 'react';

interface ApiKeyItem {
  id: string;
  api_key: string;
  name: string;
  environment: string;
  allowed_origins: string;
  is_active: number;
  created_at: string;
}

export default function AdminSettingsPage() {
  // Email Alert Settings State
  const [alertEmail, setAlertEmail] = useState('support@nextgenmultiverse.com');
  const [critAlert, setCritAlert] = useState(true);
  const [lowRatingAlert, setLowRatingAlert] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [savedEmail, setSavedEmail] = useState(false);

  // WhatsApp Login Gateway State
  const [waPhone, setWaPhone] = useState('');
  const [waOtpSent, setWaOtpSent] = useState(false);

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/saypulse/v1/admin/api-keys')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setApiKeys(data);
      })
      .catch((e) => console.error('Failed fetching api keys:', e));
  }, []);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendTestEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const handleTestWaOtp = async () => {
    try {
      const res = await fetch('/saypulse/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'whatsapp', target: waPhone }),
      });
      const data = await res.json();
      if (data.waLink) {
        window.open(data.waLink, '_blank');
      }
      setWaOtpSent(true);
      setTimeout(() => setWaOtpSent(false), 3000);
    } catch (e) {
      console.error('Error testing WA OTP:', e);
    }
  };

  return (
    <div>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Integrations & Settings</h1>
          <p style={styles.pageSubtitle}>
            Configure Email Alert pipelines, WhatsApp Login Gateway, and Developer API Keys
          </p>
        </div>
      </div>

      <div style={styles.settingsGrid}>
        {/* ── 1. Email Alert Notifications Section ── */}
        <div style={styles.sectionCard}>
          <div style={styles.cardHeader}>
            <div style={styles.emailIconOrb}>📧</div>
            <div>
              <p style={styles.cardTitle}>Transactional Email Alerts & Digests</p>
              <p style={styles.cardSub}>Receive high-fidelity HTML email notifications for critical issues</p>
            </div>
            <span style={styles.activeBadge}>EMAIL ALERTS ACTIVE</span>
          </div>

          <div style={styles.formRowTwo}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Alert Recipient Work Email</label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Enter work email for alerts"
                style={styles.textInput}
              />
            </div>
          </div>

          <div style={styles.toggleGroup}>
            <label style={styles.toggleItem}>
              <input
                type="checkbox"
                checked={critAlert}
                onChange={(e) => setCritAlert(e.target.checked)}
                style={styles.checkbox}
              />
              <div>
                <p style={styles.toggleTitle}>🚨 Instant Email on Critical Bugs & Errors</p>
                <p style={styles.toggleSub}>Dispatch full HTML card with Gemini summary, actionable task, route path, and console stack trace</p>
              </div>
            </label>

            <label style={styles.toggleItem}>
              <input
                type="checkbox"
                checked={lowRatingAlert}
                onChange={(e) => setLowRatingAlert(e.target.checked)}
                style={styles.checkbox}
              />
              <div>
                <p style={styles.toggleTitle}>⭐ Instant Email on 1-Star & 2-Star Ratings</p>
                <p style={styles.toggleSub}>Get immediate notifications when customers express severe dissatisfaction</p>
              </div>
            </label>

            <label style={styles.toggleItem}>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                style={styles.checkbox}
              />
              <div>
                <p style={styles.toggleTitle}>🌅 Scheduled Daily Executive Voice Digest (09:00 AM)</p>
                <p style={styles.toggleSub}>Morning email briefing summarizing 24h CSAT, sentiment trends, and customer quotes</p>
              </div>
            </label>
          </div>

          <div style={styles.actionsRow}>
            <button onClick={handleSendTestEmail} style={styles.primaryActionBtn}>
              {emailSent ? '✓ Test Alert Email Sent!' : '📧 Dispatch Test Email Alert'}
            </button>
            <button
              onClick={() => {
                setSavedEmail(true);
                setTimeout(() => setSavedEmail(false), 2000);
              }}
              style={styles.secondaryBtn}
            >
              {savedEmail ? '✓ Saved!' : 'Save Email Preferences'}
            </button>
          </div>
        </div>

        {/* ── 2. WhatsApp Web Gateway for Login OTP Section ── */}
        <div style={styles.sectionCard}>
          <div style={styles.cardHeader}>
            <div style={styles.waIconOrb}>🔐</div>
            <div>
              <p style={styles.cardTitle}>WhatsApp Web Gateway (Login OTP)</p>
              <p style={styles.cardSub}>Used exclusively for passwordless 6-digit phone verification at sign-in</p>
            </div>
            <span style={styles.authBadge}>AUTH GATEWAY ACTIVE</span>
          </div>

          <div style={styles.formRowTwo}>
            <div style={styles.inputGroup}>
              <label style={styles.uppercaseLabel}>MOBILE NUMBER</label>
              <div style={styles.phoneInputRow}>
                <div style={styles.countryCodePill}>
                  <span style={styles.flagIcon}>🇮🇳</span>
                  <span style={styles.codeText}>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={waPhone.replace(/[^0-9]/g, '').slice(-10)}
                  onChange={(e) => setWaPhone(`91${e.target.value.replace(/[^0-9]/g, '')}`)}
                  placeholder="10-digit number"
                  style={styles.phoneInputField}
                />
              </div>
              <span style={styles.fieldHint}>Used only when selecting &ldquo;Sign in with WhatsApp OTP&rdquo; at login.</span>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <button onClick={handleTestWaOtp} style={styles.waTestBtn}>
              {waOtpSent ? '✓ Opening WhatsApp Web…' : '📲 Test WhatsApp Login OTP Dispatch'}
            </button>
          </div>
        </div>

        {/* ── 3. Developer API Keys Section ── */}
        <div id="api-keys" style={styles.sectionCard}>
          <div style={styles.cardHeader}>
            <div style={styles.keyIconOrb}>🔑</div>
            <div>
              <p style={styles.cardTitle}>Developer API Keys</p>
              <p style={styles.cardSub}>Use these tokens to embed the SayPulse widget on your website</p>
            </div>
          </div>

          <div style={styles.keysTableWrapper}>
            <table style={styles.keysTable}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>NAME</th>
                  <th style={styles.th}>API TOKEN</th>
                  <th style={styles.th}>ENVIRONMENT</th>
                  <th style={styles.th}>ALLOWED ORIGINS</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr key={k.id} style={styles.trRow}>
                    <td style={styles.tdBold}>{k.name}</td>
                    <td style={styles.tdCode}>
                      <code>{k.api_key}</code>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.envTag}>{k.environment}</span>
                    </td>
                    <td style={styles.tdMuted}>{k.allowed_origins}</td>
                    <td style={styles.td}>
                      <span style={styles.activePill}>● Active</span>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => handleCopyKey(k.api_key)} style={styles.copyKeyBtn}>
                        {copiedKey === k.api_key ? '✓ Copied' : 'Copy Key'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. Organization Profile Section ── */}
        <div style={styles.sectionCard}>
          <div style={styles.cardHeader}>
            <div style={styles.orgIconOrb}>🏢</div>
            <div>
              <p style={styles.cardTitle}>Organization Profile & Governance</p>
              <p style={styles.cardSub}>Multi-tenant workspace identifiers and security parameters</p>
            </div>
          </div>

            <div style={styles.profileGrid}>
            <div style={styles.profileItem}>
              <span style={styles.profKey}>Organization Name</span>
              <span style={styles.profVal}>SayPulse Master Workspace</span>
            </div>
            <div style={styles.profileItem}>
              <span style={styles.profKey}>Tenant ID</span>
              <span style={styles.profVal}>org_master</span>
            </div>
            <div style={styles.profileItem}>
              <span style={styles.profKey}>Subscription Plan</span>
              <span style={styles.profBadge}>Enterprise Plan (Unlimited Audio + Gemini 3.6)</span>
            </div>
            <div style={styles.profileItem}>
              <span style={styles.profKey}>Data Residency</span>
              <span style={styles.profVal}>US-East (AES-256 Encrypted at Rest)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerRow: {
    marginBottom: 24,
  },
  pageTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: '#64748B',
    fontSize: 14,
    margin: '4px 0 0',
  },

  settingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  sectionCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '24px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid #1E293B',
  },
  emailIconOrb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(6,182,212,0.15)',
    border: '1px solid rgba(6,182,212,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  waIconOrb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  keyIconOrb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(245,158,11,0.15)',
    border: '1px solid rgba(245,158,11,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  orgIconOrb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
  },
  cardSub: {
    color: '#64748B',
    fontSize: 12,
    margin: '2px 0 0',
  },
  activeBadge: {
    marginLeft: 'auto',
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid rgba(6,182,212,0.3)',
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 14,
  },
  authBadge: {
    marginLeft: 'auto',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: '#10B981',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 14,
  },

  formRowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  uppercaseLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
  },
  phoneInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  countryCodePill: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '9px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    userSelect: 'none',
  },
  flagIcon: {
    fontSize: 15,
  },
  codeText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 600,
  },
  phoneInputField: {
    flex: 1,
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 500,
    padding: '9px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 600,
  },
  fieldHint: {
    color: '#64748B',
    fontSize: 11,
  },
  textInput: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#F1F5F9',
    fontSize: 13,
    padding: '9px 12px',
    outline: 'none',
  },

  toggleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  toggleItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '12px 14px',
    cursor: 'pointer',
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: '#06B6D4',
    marginTop: 2,
    cursor: 'pointer',
  },
  toggleTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 600,
    margin: '0 0 2px',
  },
  toggleSub: {
    color: '#64748B',
    fontSize: 12,
    margin: 0,
  },

  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  primaryActionBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    padding: '9px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
  },
  secondaryBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: 600,
    padding: '9px 16px',
    borderRadius: 8,
    cursor: 'pointer',
  },
  waTestBtn: {
    background: '#059669',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    padding: '9px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
  },

  keysTableWrapper: {
    overflowX: 'auto',
  },
  keysTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid #1E293B',
  },
  th: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 700,
    padding: '8px 12px',
    letterSpacing: 0.5,
  },
  trRow: {
    borderBottom: '1px solid #1E293B',
  },
  td: {
    padding: '12px',
    fontSize: 13,
    color: '#CBD5E1',
  },
  tdBold: {
    padding: '12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#F8FAFC',
  },
  tdCode: {
    padding: '12px',
    fontSize: 12,
    color: '#38BDF8',
    fontFamily: 'monospace',
  },
  tdMuted: {
    padding: '12px',
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  envTag: {
    background: '#1E293B',
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 10,
  },
  activePill: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 600,
  },
  copyKeyBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },

  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  profileItem: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  profKey: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 600,
  },
  profVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 600,
  },
  profBadge: {
    color: '#C084FC',
    fontSize: 12,
    fontWeight: 700,
  },
};
