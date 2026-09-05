'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  // Auth State
  const [method, setMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [email, setEmail] = useState('alex@acmeanalytics.com');
  const [phoneTenDigit, setPhoneTenDigit] = useState('9013793020');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [waLink, setWaLink] = useState<string | null>(null);

  // Onboarding Registration State (for new phone numbers)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [registering, setRegistering] = useState(false);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const target = method === 'email' ? email : `${countryCode.replace('+', '')}${phoneTenDigit}`;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    if (method === 'whatsapp' && phoneTenDigit.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/saypulse/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, target }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed sending OTP');
      }

      setOtpSent(true);
      setCountdown(60);
      if (data.waLink) setWaLink(data.waLink);
    } catch (err: any) {
      setError(err.message || 'Error sending code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/saypulse/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Check if user is NEW and needs to register their company workspace
      if (data.isNewUser) {
        setShowRegisterModal(true);
        setLoading(false);
        return;
      }

      // Store auth session
      localStorage.setItem('saypulse_auth_token', data.token);
      localStorage.setItem('saypulse_user', JSON.stringify(data.user));

      // Route to destination
      if (data.isSuperAdmin) {
        router.push('/admin/master');
      } else if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push('/admin/demo');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setRegistering(true);
    setError(null);

    try {
      const res = await fetch('/saypulse/v1/auth/register-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          websiteUrl: websiteUrl.trim(),
          ownerName: ownerName.trim() || companyName.trim(),
          phone: method === 'whatsapp' ? target : undefined,
          email: method === 'email' ? target : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create workspace');
      }

      // Store auth session
      localStorage.setItem('saypulse_auth_token', data.token);
      localStorage.setItem('saypulse_user', JSON.stringify(data.user));

      // Redirect to newly created tenant dashboard (/admin/[slug])
      router.push(data.redirectUrl || `/admin/${data.organization.slug}`);
    } catch (err: any) {
      setError(err.message || 'Error creating workspace');
    } finally {
      setRegistering(false);
    }
  };

  const handleDemoBypass = () => {
    localStorage.setItem('saypulse_auth_token', 'sp_jwt_demo_session');
    localStorage.setItem(
      'saypulse_user',
      JSON.stringify({
        id: 'user_demo_guest',
        name: 'Demo Visitor',
        role: 'admin',
        organization: { id: 'org_demo_acme_analytics', name: 'Acme Analytics', slug: 'demo' },
      })
    );
    router.push('/admin/demo');
  };

  return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        {/* ── Brand Header ── */}
        <div style={styles.header}>
          <div style={styles.logoOrb}>🎙️</div>
          <h1 style={styles.brandTitle}>SayPulse</h1>
          <p style={styles.subTitle}>Business Intelligence & Admin Portal</p>
        </div>

        {/* ── Method Selector Tabs ── */}
        {!otpSent && (
          <div style={styles.tabsWrapper}>
            <button
              onClick={() => {
                setMethod('whatsapp');
                setError(null);
              }}
              style={{
                ...styles.tabBtn,
                background: method === 'whatsapp' ? 'rgba(16,185,129,0.12)' : 'transparent',
                color: method === 'whatsapp' ? '#10B981' : '#64748B',
                borderColor: method === 'whatsapp' ? '#10B981' : 'transparent',
              }}
            >
              📲 WhatsApp OTP
            </button>
            <button
              onClick={() => {
                setMethod('email');
                setError(null);
              }}
              style={{
                ...styles.tabBtn,
                background: method === 'email' ? 'rgba(6,182,212,0.12)' : 'transparent',
                color: method === 'email' ? '#06B6D4' : '#64748B',
                borderColor: method === 'email' ? '#06B6D4' : 'transparent',
              }}
            >
              📧 Email OTP
            </button>
          </div>
        )}

        {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

        {/* ── Step 1: Request Code ── */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} style={styles.form}>
            {method === 'whatsapp' ? (
              <div style={styles.inputGroup}>
                <label style={styles.uppercaseLabel}>MOBILE NUMBER</label>

                {/* ── Country Code + 10-Digit Split Input ── */}
                <div style={styles.phoneInputRow}>
                  <div style={styles.countryCodePill}>
                    <span style={styles.flagIcon}>🇮🇳</span>
                    <span style={styles.codeText}>{countryCode}</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneTenDigit}
                    onChange={(e) => setPhoneTenDigit(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="10-digit number"
                    style={styles.phoneInputField}
                  />
                </div>
                <span style={styles.hint}>We will dispatch a 6-digit login code via MHC WhatsApp Gateway.</span>
              </div>
            ) : (
              <div style={styles.inputGroup}>
                <label style={styles.uppercaseLabel}>WORK EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@acmeanalytics.com"
                  style={styles.textInput}
                />
                <span style={styles.hint}>We will send a 6-digit login verification code to your email.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryBtn,
                background:
                  method === 'whatsapp'
                    ? 'linear-gradient(135deg,#059669,#10B981)'
                    : 'linear-gradient(135deg,#06B6D4,#6366F1)',
              }}
            >
              {loading ? 'Sending Code…' : method === 'whatsapp' ? '📲 Send WhatsApp Code' : '📧 Send Email Code'}
            </button>
          </form>
        ) : (
          /* ── Step 2: Enter 6-Digit Code ── */
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={styles.otpSentHeader}>
              <span style={styles.otpTargetBadge}>
                Code sent to {method === 'whatsapp' ? `+91 ${phoneTenDigit}` : email}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode('');
                }}
                style={styles.changeTargetBtn}
              >
                Change
              </button>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.uppercaseLabel}>ENTER 6-DIGIT VERIFICATION CODE</label>
              <input
                type="text"
                autoFocus
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                style={styles.otpInput}
              />
            </div>

            {waLink && method === 'whatsapp' && (
              <a href={waLink} target="_blank" rel="noreferrer" style={styles.waHelperLink}>
                💬 Open WhatsApp to see code ➔
              </a>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              style={{
                ...styles.primaryBtn,
                opacity: otpCode.length < 6 ? 0.6 : 1,
              }}
            >
              {loading ? 'Verifying…' : '✓ Verify & Sign In'}
            </button>

            <div style={styles.resendRow}>
              {countdown > 0 ? (
                <span style={styles.resendCountText}>Resend code in {countdown}s</span>
              ) : (
                <button type="button" onClick={() => handleSendOtp()} style={styles.resendBtn}>
                  ↻ Resend Code
                </button>
              )}
            </div>
          </form>
        )}

        <hr style={styles.divider} />

        {/* ── Demo 1-Click Sandbox Bypass ── */}
        <div style={styles.demoBypassBox}>
          <button onClick={handleDemoBypass} style={styles.demoBypassBtn}>
            🧪 Open Demo Sandbox (/admin/demo) ➔
          </button>
        </div>

        <p style={styles.footerNote}>
          SayPulse AI Voice Feedback • Multi-Tenant Enterprise Isolation
        </p>
      </div>

      {/* ── Onboarding Registration Modal for New Phone/Email ── */}
      {showRegisterModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalTopIcon}>🚀</div>
            <h2 style={styles.modalTitle}>Set Up Your SayPulse Workspace</h2>
            <p style={styles.modalSub}>
              Your phone is verified! Enter your company or product name to create your dedicated feedback dashboard.
            </p>

            <form onSubmit={handleCompleteRegistration} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.uppercaseLabel}>COMPANY / PRODUCT NAME *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Swiggy Foods, Stripe Shop, Clinic AI"
                  style={styles.textInput}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.uppercaseLabel}>YOUR FULL NAME</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  style={styles.textInput}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.uppercaseLabel}>WEBSITE DOMAIN (OPTIONAL)</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://myshop.com"
                  style={styles.textInput}
                />
              </div>

              <button
                type="submit"
                disabled={registering || !companyName.trim()}
                style={{
                  ...styles.primaryBtn,
                  marginTop: 10,
                  background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
                }}
              >
                {registering ? 'Creating Workspace…' : '🚀 Launch My Workspace ➔'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, #0F172A 0%, #060913 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  authCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 24,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  logoOrb: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    boxShadow: '0 0 20px rgba(6,182,212,0.4)',
    marginBottom: 12,
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 800,
    margin: '0 0 4px',
    letterSpacing: -0.5,
  },
  subTitle: {
    color: '#64748B',
    fontSize: 13,
    margin: 0,
  },

  tabsWrapper: {
    display: 'flex',
    gap: 8,
    background: '#0B1120',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    border: '1px solid transparent',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
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
    borderRadius: 12,
    padding: '11px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    userSelect: 'none',
  },
  flagIcon: {
    fontSize: 16,
  },
  codeText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 600,
  },
  phoneInputField: {
    flex: 1,
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 12,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 500,
    padding: '11px 16px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    letterSpacing: 0.5,
  },

  textInput: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 12,
    color: '#F8FAFC',
    fontSize: 14,
    padding: '11px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  otpInput: {
    background: '#1E293B',
    border: '2px solid #06B6D4',
    borderRadius: 12,
    color: '#38BDF8',
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: 8,
    textAlign: 'center',
    padding: '12px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: 'monospace',
  },
  hint: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },

  primaryBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
    transition: 'all 0.15s ease',
  },

  errorAlert: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#F87171',
    fontSize: 12,
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 14,
  },

  otpSentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpTargetBadge: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: 600,
  },
  changeTargetBtn: {
    background: 'none',
    border: 'none',
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  waHelperLink: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'none',
    textAlign: 'center',
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 8,
    padding: '8px',
  },

  resendRow: {
    textAlign: 'center',
  },
  resendCountText: {
    color: '#475569',
    fontSize: 12,
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },

  divider: {
    border: 'none',
    borderTop: '1px solid #1E293B',
    margin: '20px 0 16px',
  },

  demoBypassBox: {
    textAlign: 'center',
    marginBottom: 16,
  },
  demoBypassBtn: {
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#C084FC',
    fontSize: 12,
    fontWeight: 700,
    padding: '9px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
  },

  footerNote: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
    margin: 0,
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  modalCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 24,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 460,
    boxShadow: '0 25px 80px rgba(0,0,0,0.9)',
    textAlign: 'center',
  },
  modalTopIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#F8FAFC',
    margin: '0 0 6px',
  },
  modalSub: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 1.5,
    margin: '0 0 20px',
  },
};
