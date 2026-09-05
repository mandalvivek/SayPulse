'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Dashboard',   href: '/',           icon: '⊞' },
  { label: 'Analytics',   href: '/analytics',  icon: '📈' },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>A</div>
        <div>
          <p style={styles.logoName}>Acme Analytics</p>
          <p style={styles.logoPlan}>Client Demo Website</p>
        </div>
      </div>

      <hr style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...styles.navItem,
                background: active ? 'rgba(6,182,212,0.12)' : 'transparent',
                color: active ? '#06B6D4' : '#64748B',
                borderLeft: active ? '3px solid #06B6D4' : '3px solid transparent',
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin Portal Switcher */}
      <div style={styles.adminBanner}>
        <div style={styles.adminBannerHeader}>
          <span style={styles.adminOrb}>👑</span>
          <div>
            <p style={styles.adminTitle}>Admin Portal</p>
            <p style={styles.adminSub}>View Voice Analytics</p>
          </div>
        </div>
        <Link href="/admin" style={styles.adminBtn}>
          Open Admin Panel ➔
        </Link>
      </div>

      {/* SayPulse promo banner at bottom */}
      <div style={styles.banner}>
        <p style={styles.bannerTitle}>🎙️ Voice Feedback</p>
        <p style={styles.bannerSub}>
          Click the glowing mic button at the bottom right to record live feedback!
        </p>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 230,
    minHeight: '100vh',
    background: '#0B1120',
    borderRight: '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    padding: '24px 0 20px',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px 20px',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: 18,
    flexShrink: 0,
  },
  logoName: {
    color: '#F1F5F9',
    fontWeight: 700,
    fontSize: 14,
    margin: 0,
  },
  logoPlan: {
    color: '#475569',
    fontSize: 11,
    margin: 0,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #1E293B',
    margin: '0 0 16px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '0 12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  navIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },

  adminBanner: {
    margin: 'auto 12px 14px',
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  adminBannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  adminOrb: {
    fontSize: 16,
  },
  adminTitle: {
    color: '#C084FC',
    fontSize: 12,
    fontWeight: 700,
    margin: 0,
  },
  adminSub: {
    color: '#64748B',
    fontSize: 10,
    margin: 0,
  },
  adminBtn: {
    background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '6px 10px',
    borderRadius: 6,
    textDecoration: 'none',
    textAlign: 'center',
  },

  banner: {
    margin: '0 12px',
    background: 'rgba(6,182,212,0.08)',
    border: '1px solid rgba(6,182,212,0.2)',
    borderRadius: 10,
    padding: '12px 14px',
  },
  bannerTitle: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: 600,
    margin: '0 0 4px',
  },
  bannerSub: {
    color: '#475569',
    fontSize: 11,
    margin: 0,
    lineHeight: 1.4,
  },
};
