'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract slug from URL /admin/[slug]/...
  const parts = pathname.split('/').filter(Boolean);
  // If path is /admin/master -> slug is 'master'
  // If path is /admin/swiggy -> slug is 'swiggy'
  // If path is /admin/swiggy/feedback -> slug is 'swiggy'
  // If path is /admin -> slug is 'demo'
  const isMaster = pathname.startsWith('/admin/master');
  const currentSlug = parts[1] && parts[1] !== 'feedback' && parts[1] !== 'widget-studio' && parts[1] !== 'settings'
    ? parts[1]
    : 'demo';

  const [user, setUser] = useState<any>(null);
  const [orgsList, setOrgsList] = useState<any[]>([]);

  useEffect(() => {
    // Read local auth session
    try {
      const stored = localStorage.getItem('saypulse_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {}

    // Load available organizations for switcher
    apiFetch('/saypulse/v1/admin/master/organizations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrgsList(data);
      })
      .catch(() => {});
  }, [pathname]);

  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedKey, setEmbedKey] = useState('sp_live_saypulse_master_key');
  const [embedColor, setEmbedColor] = useState('#06B6D4');
  const [embedLang, setEmbedLang] = useState('auto');
  const [copiedTag, setCopiedTag] = useState(false);

  const isSuperAdmin = user?.role === 'superadmin' || user?.phone?.includes('9013793020');
  const basePath = isMaster ? '/admin/master' : `/admin/${currentSlug}`;

  const generatedScript = `<!-- SayPulse Universal AI Voice Feedback Widget -->\n<script \n  src="https://saypulse.nextgenmultiverse.com/saypulse.js" \n  data-key="${embedKey}" \n  data-color="${embedColor}" \n  data-position="bottom-right" \n  data-lang="${embedLang}" \n  defer>\n</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
  };

  return (
    <div style={styles.container}>
      {/* ── Left Sidebar (Matching NextGen Enterprise Studio) ── */}
      <aside style={styles.sidebar}>
        <div>
          {/* Brand Header */}
          <div style={styles.brandHeader}>
            <div style={styles.logoOrb}>🎙️</div>
            <div>
              <div style={styles.brandTitleRow}>
                <span style={styles.brandTitle}>SayPulse</span>
                <span style={styles.proBadge}>PRO</span>
              </div>
              <div style={styles.brandSubtitle}>ENTERPRISE VOICE STUDIO</div>
            </div>
          </div>

          {/* Gateway Connection Card */}
          <div style={styles.deviceCard}>
            <div style={styles.deviceCardHeader}>
              <span style={styles.deviceCardTitle}>GATEWAY CONNECTION</span>
              <span style={styles.onlineBadge}>● ONLINE</span>
            </div>
            <div style={styles.devicePhone}>
              <span style={styles.greenDot} />
              <span>+91 9013793020</span>
            </div>
            <div style={styles.deviceBtnRow}>
              <button
                onClick={() => setShowEmbedModal(true)}
                style={styles.deviceActionBtn}
              >
                📋 Embed Tag
              </button>
              <Link href={`/admin/${currentSlug}/feedback`} style={styles.deviceLiveBtn}>
                🔄 Live Feed
              </Link>
            </div>
          </div>

          {/* Navigation Menu Groups */}
          <div style={styles.navScrollArea}>
            {/* Group 1: OVERVIEW & STUDIO */}
            <div style={styles.navGroup}>
              <p style={styles.navGroupTitle}>OVERVIEW & STUDIO</p>
              <nav style={styles.navList}>
                <Link
                  href={isMaster ? '/admin/master' : `/admin/${currentSlug}`}
                  style={{
                    ...styles.navItem,
                    ...(pathname === '/admin/master' || pathname === `/admin/${currentSlug}`
                      ? styles.navItemActive
                      : {}),
                  }}
                >
                  <span style={styles.navIcon}>🚀</span>
                  <span>Overview & QuickStart</span>
                </Link>

                <Link
                  href={`/admin/${currentSlug}/feedback`}
                  style={{
                    ...styles.navItem,
                    ...(pathname.includes('/feedback') ? styles.navItemActive : {}),
                  }}
                >
                  <span style={styles.navIcon}>🎙️</span>
                  <span>Voice Feedback Stream</span>
                  <span style={styles.liveTag}>LIVE</span>
                </Link>

                <Link
                  href={`/admin/${currentSlug}/feedback`}
                  style={styles.navItem}
                >
                  <span style={styles.navIcon}>📋</span>
                  <span>Feedback Inbox</span>
                  <span style={styles.countBadge}>12</span>
                </Link>

                <button
                  onClick={() => setShowEmbedModal(true)}
                  style={{ ...styles.navItem, width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span style={styles.navIcon}>🎨</span>
                  <span>Widget Studio & Tag</span>
                </button>

                <Link
                  href={`/admin/${currentSlug}/settings`}
                  style={{
                    ...styles.navItem,
                    ...(pathname.includes('/settings') ? styles.navItemActive : {}),
                  }}
                >
                  <span style={styles.navIcon}>🌐</span>
                  <span>Multilingual Speech AI</span>
                  <span style={styles.multiTag}>10+</span>
                </Link>

                <Link
                  href={`/admin/${currentSlug}/settings`}
                  style={styles.navItem}
                >
                  <span style={styles.navIcon}>🛡️</span>
                  <span>Account & DPDP Privacy</span>
                </Link>
              </nav>
            </div>

            {/* Group 2: SUPERADMIN HUB */}
            <div style={styles.navGroup}>
              <p style={styles.navGroupTitle}>SUPERADMIN HUB</p>
              <nav style={styles.navList}>
                <Link
                  href="/admin/master"
                  style={{
                    ...styles.navItem,
                    ...(pathname === '/admin/master' ? styles.navItemActive : {}),
                  }}
                >
                  <span style={styles.navIcon}>👑</span>
                  <span>API Keys & Tenants</span>
                </Link>

                <Link
                  href={`/admin/${currentSlug}/settings`}
                  style={styles.navItem}
                >
                  <span style={styles.navIcon}>🔌</span>
                  <span>Client Webhooks</span>
                </Link>

                <Link
                  href={`/admin/${currentSlug}/settings`}
                  style={styles.navItem}
                >
                  <span style={styles.navIcon}>🤖</span>
                  <span>AI Synthesis Rules</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* User Profile Footer Card */}
        <div style={styles.userFooterCard}>
          <div style={styles.userProfileRow}>
            <div style={styles.avatar}>V</div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name || 'Vivek Mandal'}</span>
              <span style={styles.userRole}>👑 Master Admin</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('saypulse_auth_token');
                localStorage.removeItem('saypulse_user');
                window.location.href = '/';
              }}
              title="Sign Out"
              style={styles.logoutBtn}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace Body ── */}
      <div style={styles.mainWrapper}>
        {/* Top Header */}
        <header style={styles.topHeader}>
          <div style={styles.headerLeft}>
            <div style={styles.breadcrumbBadge}>🏠 Home</div>
            <span style={{ color: '#475569' }}>/</span>
            <div>
              <span style={styles.pageTitleText}>
                {pathname === '/admin/master'
                  ? 'SayPulse Master Command Center'
                  : pathname.includes('/feedback')
                  ? 'Voice Feedback Inbox & Telemetry'
                  : pathname.includes('/widget-studio')
                  ? 'Widget Customization Studio'
                  : pathname.includes('/settings')
                  ? 'Settings, Keys & Multilingual Hub'
                  : `Workspace Overview — ${currentSlug}`}
              </span>
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.dpdpPill}>
              <span>🛡️</span>
              <span>Zero-Storage (DPDP 🔒)</span>
            </div>

            <div style={styles.onlinePill}>
              <span style={styles.greenDot} />
              <span>GATEWAY ONLINE</span>
            </div>

            <button
              onClick={() => setShowEmbedModal(true)}
              style={styles.embedTagTopBtn}
            >
              📋 Embed Tag
            </button>

            <Link href="/demo" target="_blank" style={styles.clientDemoBtn}>
              🎓 Demo
            </Link>
          </div>
        </header>

        {/* Content Children */}
        <main style={styles.mainContent}>{children}</main>
      </div>

      {/* ── Universal Embed Tag Studio Modal ── */}
      {showEmbedModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalBadge}>⚡ UNIVERSAL 1-LINE EMBED SCRIPT</div>
                <h3 style={styles.modalTitle}>SayPulse Embed Tag & Integration Studio</h3>
                <p style={styles.modalSub}>
                  Configure and copy your script tag to embed inside any web application.
                </p>
              </div>
              <button onClick={() => setShowEmbedModal(false)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div style={styles.configGrid}>
              <div style={styles.configCol}>
                <label style={styles.configLabel}>Workspace API Key</label>
                <select
                  value={embedKey}
                  onChange={(e) => setEmbedKey(e.target.value)}
                  style={styles.configSelect}
                >
                  <option value="sp_live_saypulse_master_key">SayPulse Global (sp_live_saypulse...)</option>
                  <option value="sp_live_examdesk_prod_778a">NextGen ExamDesk (sp_live_examdesk...)</option>
                  <option value="sp_live_tecton_ent_9921">Tecton Enterprise (sp_live_tecton...)</option>
                  <option value="sp_dev_local_master">Demo Sandbox (sp_dev_local...)</option>
                </select>
              </div>

              <div style={styles.configCol}>
                <label style={styles.configLabel}>Theme Accent Color</label>
                <select
                  value={embedColor}
                  onChange={(e) => setEmbedColor(e.target.value)}
                  style={styles.configSelect}
                >
                  <option value="#06B6D4">Cyan Glow (#06B6D4)</option>
                  <option value="#6366F1">Indigo Pulse (#6366F1)</option>
                  <option value="#10B981">Emerald (#10B981)</option>
                  <option value="#F59E0B">Amber Gold (#F59E0B)</option>
                  <option value="#EC4899">Neon Pink (#EC4899)</option>
                </select>
              </div>

              <div style={styles.configCol}>
                <label style={styles.configLabel}>Default Language</label>
                <select
                  value={embedLang}
                  onChange={(e) => setEmbedLang(e.target.value)}
                  style={styles.configSelect}
                >
                  <option value="auto">🌐 Auto / Multi-dialect</option>
                  <option value="hi-IN">हिन्दी (Hindi / Hinglish)</option>
                  <option value="en-IN">English (India)</option>
                  <option value="en-US">English (US)</option>
                  <option value="bn-IN">বাংলা (Bengali)</option>
                  <option value="mr-IN">मराठी (Marathi)</option>
                  <option value="fr-FR">Français (French)</option>
                  <option value="nl-NL">Nederlands (Dutch)</option>
                  <option value="zh-CN">中文 (Chinese)</option>
                </select>
              </div>
            </div>

            <div style={styles.snippetSection}>
              <div style={styles.snippetHeader}>
                <span style={styles.snippetTitle}>Generated HTML Script Tag:</span>
                <button onClick={copyEmbedCode} style={styles.copySnippetBtn}>
                  {copiedTag ? '✓ Copied to Clipboard!' : '📋 Copy Script Tag'}
                </button>
              </div>
              <pre style={styles.snippetBox}>{generatedScript}</pre>
            </div>

            <div style={styles.instructionsBox}>
              <strong style={{ color: '#F1F5F9' }}>💡 Integration Note:</strong> Paste this script tag just before the closing <code>&lt;/body&gt;</code> tag of your website. Voice notes will immediately appear in your SayPulse dashboard!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#070C18',
    color: '#F1F5F9',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    background: '#050914',
    borderRight: '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 0,
    height: '100vh',
    position: 'sticky',
    top: 0,
  },
  brandHeader: {
    padding: '20px 16px',
    borderBottom: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoOrb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #06B6D4, #6366F1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    boxShadow: '0 0 15px rgba(6,182,212,0.3)',
  },
  brandTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: '#F8FAFC',
    fontWeight: 800,
    fontSize: 15,
  },
  proBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#06B6D4',
    background: 'rgba(6,182,212,0.15)',
    border: '1px solid rgba(6,182,212,0.3)',
    borderRadius: 4,
    padding: '1px 5px',
    fontFamily: 'monospace',
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace',
    letterSpacing: 0.8,
    marginTop: 2,
  },

  deviceCard: {
    margin: '12px 12px 16px',
    padding: 12,
    borderRadius: 14,
    background: '#091122',
    border: '1px solid #1E293B',
  },
  deviceCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceCardTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  onlineBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#10B981',
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.3)',
    padding: '1px 6px',
    borderRadius: 10,
    fontFamily: 'monospace',
  },
  devicePhone: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 6px #10B981',
  },
  deviceBtnRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
  },
  deviceActionBtn: {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid #334155',
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 700,
    padding: '6px 4px',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'center',
  },
  deviceLiveBtn: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#F87171',
    fontSize: 10,
    fontWeight: 700,
    padding: '6px 4px',
    borderRadius: 8,
    textDecoration: 'none',
    textAlign: 'center',
  },

  navScrollArea: {
    padding: '0 8px',
    maxHeight: 'calc(100vh - 280px)',
    overflowY: 'auto',
  },
  navGroup: {
    marginBottom: 20,
  },
  navGroupTitle: {
    color: '#475569',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 1,
    margin: '0 0 8px 8px',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 12,
    fontWeight: 500,
    color: '#94A3B8',
    padding: '8px 10px',
    borderRadius: 8,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15))',
    borderLeft: '3px solid #06B6D4',
    color: '#38BDF8',
    fontWeight: 700,
  },
  navIcon: {
    fontSize: 14,
  },
  liveTag: {
    marginLeft: 'auto',
    fontSize: 9,
    fontWeight: 800,
    background: 'rgba(6,182,212,0.15)',
    color: '#22D3EE',
    padding: '1px 5px',
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  countBadge: {
    marginLeft: 'auto',
    fontSize: 9,
    fontWeight: 700,
    background: '#0B1120',
    color: '#94A3B8',
    padding: '1px 6px',
    borderRadius: 10,
    fontFamily: 'monospace',
  },
  multiTag: {
    marginLeft: 'auto',
    fontSize: 9,
    fontWeight: 800,
    background: 'rgba(16,185,129,0.15)',
    color: '#34D399',
    padding: '1px 5px',
    borderRadius: 4,
    fontFamily: 'monospace',
  },

  userFooterCard: {
    padding: 12,
    borderTop: '1px solid #1E293B',
    background: '#040711',
  },
  userProfileRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.02)',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #06B6D4, #6366F1)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginLeft: 8,
  },
  userName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#F1F5F9',
  },
  userRole: {
    fontSize: 9,
    color: '#FBBF24',
    fontWeight: 600,
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    color: '#94A3B8',
    padding: '4px 8px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
  },

  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topHeader: {
    height: 56,
    background: 'rgba(7,12,24,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  breadcrumbBadge: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #1E293B',
    padding: '3px 8px',
    borderRadius: 6,
    fontSize: 11,
    color: '#94A3B8',
  },
  pageTitleText: {
    color: '#F8FAFC',
    fontWeight: 700,
    fontSize: 13,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  dpdpPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
    color: '#34D399',
    fontSize: 11,
    fontFamily: 'monospace',
    padding: '3px 10px',
    borderRadius: 20,
  },
  onlinePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
    color: '#34D399',
    fontSize: 11,
    fontFamily: 'monospace',
    padding: '3px 10px',
    borderRadius: 20,
  },
  embedTagTopBtn: {
    background: 'linear-gradient(135deg, #06B6D4, #6366F1)',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(6,182,212,0.3)',
  },
  clientDemoBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #1E293B',
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 8,
    textDecoration: 'none',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 16,
  },
  modalCard: {
    background: '#0B1325',
    border: '1px solid rgba(6,182,212,0.3)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 640,
    boxShadow: '0 0 50px rgba(6,182,212,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalBadge: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 800,
    color: '#06B6D4',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    color: '#F8FAFC',
  },
  modalSub: {
    fontSize: 12,
    color: '#94A3B8',
    margin: '4px 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: 16,
    cursor: 'pointer',
    padding: 4,
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    background: '#050914',
    padding: 12,
    borderRadius: 12,
    border: '1px solid #1E293B',
    marginBottom: 16,
  },
  configCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  configLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: '#64748B',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  configSelect: {
    background: '#091122',
    border: '1px solid #1E293B',
    color: '#F8FAFC',
    fontSize: 11,
    padding: '6px 8px',
    borderRadius: 8,
    outline: 'none',
  },
  snippetSection: {
    marginBottom: 16,
  },
  snippetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  snippetTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  copySnippetBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
  snippetBox: {
    background: '#040711',
    border: '1px solid rgba(6,182,212,0.3)',
    color: '#38BDF8',
    padding: 12,
    borderRadius: 12,
    fontFamily: 'monospace',
    fontSize: 11,
    overflowX: 'auto',
    margin: 0,
    lineHeight: 1.5,
  },
  instructionsBox: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #1E293B',
    padding: 12,
    borderRadius: 10,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 1.5,
  },
};
