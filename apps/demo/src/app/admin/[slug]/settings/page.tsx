'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function TenantSettingsPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'demo';

  // Email Alert State
  const [alertEmail, setAlertEmail] = useState('support@nextgenmultiverse.com');
  const [critAlert, setCritAlert] = useState(true);
  const [lowRatingAlert, setLowRatingAlert] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [savedEmail, setSavedEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState('sp_live_...');
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch(`/saypulse/v1/admin/api-keys?slug=${slug}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setApiKey(data[0].api_key);
        }
      } catch (e) {
        console.error('Failed fetching API keys', e);
      }
    };
    fetchKeys();
  }, [slug]);

  const handleSendTestEmail = async () => {
    try {
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.workspacePill}>
            <span>🏢 /admin/{slug}</span>
          </div>
          <h1 style={styles.title}>Workspace Settings & Integrations</h1>
          <p style={styles.subtitle}>
            Manage transactional email alerts, team recipients, and production API access tokens.
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
              <p style={styles.cardSub}>Receive high-fidelity HTML email notifications for critical customer feedback</p>
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
                placeholder="name@organization.com"
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

        {/* ── 2. API Key & Security Section ── */}
        <div style={styles.sectionCard}>
          <div style={styles.cardHeader}>
            <div style={styles.keyIconOrb}>🔑</div>
            <div>
              <p style={styles.cardTitle}>Production API Credentials</p>
              <p style={styles.cardSub}>Unique client token for widget authorization and backend SDK integration</p>
            </div>
            <span style={styles.keyBadge}>LIVE TOKEN</span>
          </div>

          <div style={styles.apiKeyBox}>
            <div style={styles.apiKeyTop}>
              <span style={styles.apiKeyLabel}>WORKSPACE DEDICATED API KEY</span>
              <button onClick={copyKey} style={styles.copyKeyBtn}>
                {copiedKey ? '✓ Copied' : '📋 Copy Token'}
              </button>
            </div>
            <pre style={styles.apiKeyCode}>{apiKey}</pre>
          </div>

          <p style={styles.securityHint}>
            🔒 Pass this token via <code>data-key</code> attribute in the 1-line script tag, or in HTTP header <code>X-SayPulse-Key</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px 40px',
    maxWidth: 1400,
    margin: '0 auto',
    color: '#F8FAFC',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    marginBottom: 28,
  },
  workspacePill: {
    display: 'inline-block',
    background: '#1E293B',
    color: '#06B6D4',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    margin: '6px 0 0',
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
    padding: '28px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    borderBottom: '1px solid #1E293B',
    paddingBottom: 20,
  },
  emailIconOrb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'rgba(6,182,212,0.15)',
    border: '1px solid rgba(6,182,212,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  keyIconOrb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'rgba(245,158,11,0.15)',
    border: '1px solid rgba(245,158,11,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  cardSub: {
    color: '#64748B',
    fontSize: 13,
    margin: '3px 0 0',
  },
  activeBadge: {
    marginLeft: 'auto',
    background: 'rgba(6,182,212,0.15)',
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: 800,
    padding: '4px 10px',
    borderRadius: 12,
  },
  keyBadge: {
    marginLeft: 'auto',
    background: 'rgba(16,185,129,0.15)',
    color: '#10B981',
    fontSize: 11,
    fontWeight: 800,
    padding: '4px 10px',
    borderRadius: 12,
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
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 600,
  },
  textInput: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#F8FAFC',
    fontSize: 13,
    padding: '10px 14px',
    outline: 'none',
  },

  toggleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  toggleItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '14px',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: 3,
    width: 16,
    height: 16,
    accentColor: '#06B6D4',
  },
  toggleTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
  },
  toggleSub: {
    color: '#64748B',
    fontSize: 12,
    margin: '3px 0 0',
  },

  actionsRow: {
    display: 'flex',
    gap: 12,
  },
  primaryActionBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#94A3B8',
    padding: '10px 16px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  apiKeyBox: {
    background: '#060913',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: '16px',
    marginBottom: 12,
  },
  apiKeyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiKeyLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 700,
  },
  copyKeyBtn: {
    background: 'rgba(6,182,212,0.15)',
    border: '1px solid rgba(6,182,212,0.3)',
    color: '#06B6D4',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
  apiKeyCode: {
    margin: 0,
    color: '#38BDF8',
    fontSize: 13,
    fontFamily: 'monospace',
    overflowX: 'auto',
  },
  securityHint: {
    color: '#64748B',
    fontSize: 12,
    margin: 0,
  },
};
