'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
    fetch('/saypulse/v1/admin/master/organizations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrgsList(data);
      })
      .catch(() => {});
  }, [pathname]);

  const isSuperAdmin = user?.role === 'superadmin' || user?.phone?.includes('9013793020');

  const basePath = isMaster ? '/admin/master' : `/admin/${currentSlug}`;

  return (
    <div style={styles.container}>
      {/* ── Top Header ── */}
      <header style={styles.topHeader}>
        <div style={styles.headerLeft}>
          <Link href={isSuperAdmin ? '/admin/master' : `/admin/${currentSlug}`} style={styles.logoLink}>
            <div style={styles.logoOrb}>🎙️</div>
            <div>
              <span style={styles.brandTitle}>SayPulse</span>
              <span style={styles.brandBadge}>{isSuperAdmin ? 'SUPERADMIN' : 'BUSINESS'}</span>
            </div>
          </Link>

          <div style={styles.headerDivider} />

          {/* Org Switcher or Master Badge */}
          {isMaster ? (
            <div style={styles.masterBadge}>
              <span style={{ fontSize: 13 }}>👑</span>
              <span style={styles.masterBadgeText}>PLATFORM MASTER VIEW</span>
            </div>
          ) : (
            <div style={styles.orgDropdownWrapper}>
              <span style={styles.orgDot} />
              <select
                value={currentSlug}
                onChange={(e) => {
                  const targetSlug = e.target.value;
                  if (targetSlug === 'master') {
                    router.push('/admin/master');
                  } else {
                    router.push(`/admin/${targetSlug}`);
                  }
                }}
                style={styles.orgSelect}
              >
                {orgsList.length > 0 ? (
                  orgsList.map((o) => (
                    <option key={o.id} value={o.slug}>
                      {o.name} ({o.slug})
                    </option>
                  ))
                ) : (
                  <option value={currentSlug}>{currentSlug}</option>
                )}
                {isSuperAdmin && <option value="master">👑 Master Command Center</option>}
              </select>
            </div>
          )}
        </div>

        <div style={styles.headerRight}>
          {isSuperAdmin && !isMaster && (
            <Link href="/admin/master" style={styles.masterJumpBtn}>
              👑 Master Command Center
            </Link>
          )}

          <div style={styles.statusPill}>
            <span style={styles.statusPulse} />
            <span>AI Pipeline Active</span>
          </div>

          <Link href="/" style={styles.clientDemoBtn}>
            <span>↗ Client Demo</span>
          </Link>

          <div style={styles.userProfile}>
            <div style={styles.avatar}>
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'VM'}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name || 'Vivek Mandal'}</span>
              <span style={styles.userRole}>
                {isSuperAdmin ? 'Platform Owner' : 'Workspace Owner'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Body with Sidebar ── */}
      <div style={styles.bodyWrapper}>
        <aside style={styles.sidebar}>
          {/* Navigation for Superadmin Master */}
          {isMaster ? (
            <div style={styles.navSection}>
              <p style={styles.navSectionTitle}>GOVERNANCE</p>
              <nav style={styles.navList}>
                <Link
                  href="/admin/master"
                  style={{
                    ...styles.navItem,
                    background: 'rgba(6,182,212,0.12)',
                    color: '#06B6D4',
                  }}
                >
                  <span style={styles.navIcon}>👑</span>
                  <span>Master Overview</span>
                </Link>
              </nav>
            </div>
          ) : (
            <>
              <div style={styles.navSection}>
                <p style={styles.navSectionTitle}>INTELLIGENCE</p>
                <nav style={styles.navList}>
                  <Link
                    href={`/admin/${currentSlug}`}
                    style={{
                      ...styles.navItem,
                      background: pathname === `/admin/${currentSlug}` ? 'rgba(6,182,212,0.12)' : 'transparent',
                      color: pathname === `/admin/${currentSlug}` ? '#06B6D4' : '#94A3B8',
                    }}
                  >
                    <span style={styles.navIcon}>📊</span>
                    <span>Overview</span>
                  </Link>
                  <Link
                    href={`/admin/${currentSlug}/feedback`}
                    style={{
                      ...styles.navItem,
                      background: pathname.includes('/feedback') ? 'rgba(6,182,212,0.12)' : 'transparent',
                      color: pathname.includes('/feedback') ? '#06B6D4' : '#94A3B8',
                    }}
                  >
                    <span style={styles.navIcon}>📋</span>
                    <span>Live Inbox</span>
                  </Link>
                </nav>
              </div>

              <div style={styles.navSection}>
                <p style={styles.navSectionTitle}>CUSTOMIZATION</p>
                <nav style={styles.navList}>
                  <Link
                    href={`/admin/${currentSlug}/widget-studio`}
                    style={{
                      ...styles.navItem,
                      background: pathname.includes('/widget-studio') ? 'rgba(6,182,212,0.12)' : 'transparent',
                      color: pathname.includes('/widget-studio') ? '#06B6D4' : '#94A3B8',
                    }}
                  >
                    <span style={styles.navIcon}>🎨</span>
                    <span>Widget Studio</span>
                  </Link>
                </nav>
              </div>

              <div style={styles.navSection}>
                <p style={styles.navSectionTitle}>CONFIGURATION</p>
                <nav style={styles.navList}>
                  <Link
                    href={`/admin/${currentSlug}/settings`}
                    style={{
                      ...styles.navItem,
                      background: pathname.includes('/settings') ? 'rgba(6,182,212,0.12)' : 'transparent',
                      color: pathname.includes('/settings') ? '#06B6D4' : '#94A3B8',
                    }}
                  >
                    <span style={styles.navIcon}>⚙️</span>
                    <span>Settings & Keys</span>
                  </Link>
                </nav>
              </div>
            </>
          )}

          <div style={styles.sidebarFooter}>
            <div style={styles.geminiBadge}>
              <span style={styles.geminiIcon}>✨</span>
              <div>
                <p style={styles.geminiTitle}>Gemini 3.6 Flash</p>
                <p style={styles.geminiSub}>Structured Voice AI</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Content Area ── */}
        <main style={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0B1120',
    color: '#F1F5F9',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  topHeader: {
    height: 64,
    background: '#0F172A',
    borderBottom: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoOrb: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    boxShadow: '0 0 12px rgba(6,182,212,0.4)',
  },
  brandTitle: {
    color: '#F8FAFC',
    fontWeight: 800,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  brandBadge: {
    fontSize: 9,
    fontWeight: 700,
    color: '#06B6D4',
    background: 'rgba(6,182,212,0.12)',
    border: '1px solid rgba(6,182,212,0.3)',
    borderRadius: 4,
    padding: '1px 5px',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  headerDivider: {
    width: 1,
    height: 24,
    background: '#1E293B',
  },
  masterBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(245,158,11,0.15)',
    border: '1px solid rgba(245,158,11,0.4)',
    color: '#FBBF24',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  masterBadgeText: {
    color: '#FBBF24',
  },
  orgDropdownWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#1E293B',
    border: '1px solid #334155',
    padding: '4px 10px',
    borderRadius: 20,
  },
  orgDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 6px #10B981',
  },
  orgSelect: {
    background: 'none',
    border: 'none',
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  masterJumpBtn: {
    background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.2))',
    border: '1px solid rgba(245,158,11,0.4)',
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: 700,
    padding: '6px 12px',
    borderRadius: 8,
    textDecoration: 'none',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#34D399',
    fontSize: 12,
    fontWeight: 600,
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.2)',
    padding: '4px 10px',
    borderRadius: 20,
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10B981',
  },
  clientDemoBtn: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'none',
    background: '#1E293B',
    border: '1px solid #334155',
    padding: '6px 12px',
    borderRadius: 8,
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#F1F5F9',
  },
  userRole: {
    fontSize: 10,
    color: '#64748B',
  },

  bodyWrapper: {
    display: 'flex',
    flex: 1,
  },
  sidebar: {
    width: 240,
    background: '#0F172A',
    borderRight: '1px solid #1E293B',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  navSection: {
    marginBottom: 24,
  },
  navSectionTitle: {
    color: '#475569',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    margin: '0 0 10px 10px',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  navIcon: {
    fontSize: 15,
  },
  sidebarFooter: {
    paddingTop: 16,
    borderTop: '1px solid #1E293B',
  },
  geminiBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    padding: '10px 12px',
    borderRadius: 10,
  },
  geminiIcon: {
    fontSize: 18,
  },
  geminiTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#C084FC',
    margin: 0,
  },
  geminiSub: {
    fontSize: 10,
    color: '#64748B',
    margin: 0,
  },

  mainContent: {
    flex: 1,
    overflowY: 'auto',
  },
};
