'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  website_url?: string;
  plan: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  primary_api_key?: string;
  feedback_count: number;
  avg_rating: number;
  created_at: string;
}

interface PlatformOverview {
  totalOrganizations: number;
  totalVoiceFeedbacks: number;
  platformAverageCsat: number;
  totalPlatformUsers: number;
  totalCriticalIssues: number;
}

export default function SuperadminMasterPage() {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [organizations, setOrganizations] = useState<OrgSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Tenant Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgWebsite, setNewOrgWebsite] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, orgsRes] = await Promise.all([
        fetch('/saypulse/v1/admin/master/overview'),
        fetch('/saypulse/v1/admin/master/organizations'),
      ]);

      const overviewData = await overviewRes.json();
      const orgsData = await orgsRes.json();

      setOverview(overviewData);
      setOrganizations(Array.isArray(orgsData) ? orgsData : []);
    } catch (err) {
      console.error('Failed to load Superadmin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;

    setCreating(true);
    try {
      const res = await fetch('/saypulse/v1/auth/register-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: newOrgName,
          websiteUrl: newOrgWebsite,
          ownerName: newOwnerName,
          phone: newOwnerPhone,
          email: newOwnerEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewOrgName('');
        setNewOrgWebsite('');
        setNewOwnerName('');
        setNewOwnerPhone('');
        setNewOwnerEmail('');
        await fetchData();
      } else {
        alert(data.error || 'Failed to create organization');
      }
    } catch (err: any) {
      alert(err.message || 'Error provisioning tenant');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase()) ||
      (o.owner_phone && o.owner_phone.includes(search)) ||
      (o.owner_email && o.owner_email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={styles.container}>
      {/* ── Top Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.superadminBadge}>👑 PLATFORM SUPERADMIN</span>
            <span style={styles.livePulse}>● MASTER COMMAND CENTER</span>
          </div>
          <h1 style={styles.title}>Global Platform Governance</h1>
          <p style={styles.subtitle}>
            Holistic monitoring across all registered tenants, voice feedback pipelines, and client API keys.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button onClick={() => setShowCreateModal(true)} style={styles.primaryBtn}>
            + Provision New Tenant
          </button>
          <button onClick={fetchData} style={styles.refreshBtn}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── 4 Global Platform Scorecards ── */}
      {overview && (
        <div style={styles.scorecardsGrid}>
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>TOTAL REGISTERED COMPANIES</span>
              <span style={styles.cardIcon}>🏢</span>
            </div>
            <div style={styles.cardVal}>{overview.totalOrganizations}</div>
            <div style={styles.cardMeta}>Active multi-tenant organizations</div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>TOTAL VOICE FEEDBACK NOTES</span>
              <span style={styles.cardIcon}>🎙️</span>
            </div>
            <div style={styles.cardVal}>{overview.totalVoiceFeedbacks}</div>
            <div style={styles.cardMeta}>Processed via Gemini AI across all sites</div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>PLATFORM AVG CSAT</span>
              <span style={styles.cardIcon}>⭐</span>
            </div>
            <div style={{ ...styles.cardVal, color: '#38BDF8' }}>
              {overview.platformAverageCsat} <span style={{ fontSize: 16, color: '#64748B' }}>/ 5.0</span>
            </div>
            <div style={styles.cardMeta}>Global platform satisfaction index</div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardLabel}>OPEN CRITICAL ISSUES</span>
              <span style={styles.cardIcon}>🚨</span>
            </div>
            <div style={{ ...styles.cardVal, color: '#F87171' }}>{overview.totalCriticalIssues}</div>
            <div style={styles.cardMeta}>1-2★ ratings or critical bug tickets</div>
          </div>
        </div>
      )}

      {/* ── Tenants Directory Table ── */}
      <div style={styles.directorySection}>
        <div style={styles.directoryHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Registered Tenants Directory</h2>
            <p style={styles.sectionSub}>All customer workspaces with quick links to their isolated admin dashboards.</p>
          </div>
          <div style={styles.searchBox}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search company, slug, phone or email…"
              style={styles.searchInput}
            />
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading tenants directory…</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>COMPANY / WORKSPACE</th>
                  <th style={styles.th}>OWNER CONTACT</th>
                  <th style={styles.th}>PLAN</th>
                  <th style={styles.th}>VOICE NOTES</th>
                  <th style={styles.th}>AVG CSAT</th>
                  <th style={styles.th}>PRODUCTION API KEY</th>
                  <th style={styles.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org) => (
                  <tr key={org.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.orgName}>{org.name}</div>
                      <div style={styles.orgSlug}>
                        Slug: <code>{org.slug}</code>
                        {org.website_url && (
                          <a
                            href={org.website_url}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.websiteLink}
                          >
                            🌐 {org.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.ownerText}>{org.owner_name || 'Owner'}</div>
                      <div style={styles.contactMeta}>
                        {org.owner_phone && <span>📱 +{org.owner_phone}</span>}
                        {org.owner_email && <span>📧 {org.owner_email}</span>}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.planBadge,
                          background:
                            org.plan === 'enterprise' || org.plan === 'platform_owner'
                              ? 'rgba(168,85,247,0.15)'
                              : 'rgba(6,182,212,0.15)',
                          color:
                            org.plan === 'enterprise' || org.plan === 'platform_owner'
                              ? '#C084FC'
                              : '#22D3EE',
                        }}
                      >
                        {org.plan.toUpperCase()}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.numHighlight}>{org.feedback_count}</span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.csatHighlight}>★ {org.avg_rating}</span>
                    </td>

                    <td style={styles.td}>
                      {org.primary_api_key ? (
                        <div style={styles.apiKeyBox}>
                          <code style={styles.apiKeyText}>
                            {org.primary_api_key.substring(0, 16)}…
                          </code>
                          <button
                            onClick={() => copyToClipboard(org.primary_api_key!)}
                            style={styles.copyBtn}
                          >
                            {copiedKey === org.primary_api_key ? '✓' : '📋'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#64748B' }}>—</span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <Link
                        href={`/admin/${org.slug}`}
                        style={styles.openDashboardBtn}
                      >
                        ↗ Open Dashboard
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Provision Tenant Modal ── */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>✨ Provision New Customer Tenant</h3>
              <button onClick={() => setShowCreateModal(false)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Company / Workspace Name *</label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Swiggy, Stripe, Nike Shoes"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Website Domain URL (optional)</label>
                <input
                  type="url"
                  value={newOrgWebsite}
                  onChange={(e) => setNewOrgWebsite(e.target.value)}
                  placeholder="https://company.com"
                  style={styles.input}
                />
              </div>

              <div style={styles.formRowTwo}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Owner Full Name</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Owner Mobile Number</label>
                  <input
                    type="tel"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 9876543210"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Owner Work Email</label>
                <input
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  placeholder="owner@company.com"
                  style={styles.input}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={styles.submitBtn}>
                  {creating ? 'Provisioning…' : '✓ Create Tenant & Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  superadminBadge: {
    background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.2))',
    border: '1px solid rgba(245,158,11,0.4)',
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  livePulse: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 700,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    margin: '6px 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: 12,
  },
  primaryBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
  },
  refreshBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#94A3B8',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  scorecardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '20px 22px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardVal: {
    fontSize: 28,
    fontWeight: 800,
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  cardMeta: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },

  directorySection: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '24px',
  },
  directoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
    color: '#F8FAFC',
  },
  sectionSub: {
    color: '#64748B',
    fontSize: 13,
    margin: '4px 0 0',
  },
  searchBox: {
    width: 320,
  },
  searchInput: {
    width: '100%',
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#F8FAFC',
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '1px solid #1E293B',
  },
  th: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 700,
    padding: '12px 14px',
    letterSpacing: 0.5,
  },
  tableRow: {
    borderBottom: '1px solid rgba(30,41,59,0.6)',
    transition: 'background 0.15s ease',
  },
  td: {
    padding: '14px',
    fontSize: 13,
    verticalAlign: 'middle',
  },
  orgName: {
    fontWeight: 700,
    color: '#F8FAFC',
  },
  orgSlug: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  websiteLink: {
    color: '#06B6D4',
    textDecoration: 'none',
    fontSize: 11,
  },
  ownerText: {
    color: '#F1F5F9',
    fontWeight: 600,
  },
  contactMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  planBadge: {
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  numHighlight: {
    fontWeight: 700,
    color: '#F8FAFC',
    fontSize: 14,
  },
  csatHighlight: {
    fontWeight: 700,
    color: '#FBBF24',
    fontSize: 13,
  },
  apiKeyBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  apiKeyText: {
    background: '#1E293B',
    padding: '3px 6px',
    borderRadius: 4,
    color: '#94A3B8',
    fontSize: 11,
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#06B6D4',
    fontSize: 12,
  },
  openDashboardBtn: {
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid rgba(6,182,212,0.3)',
    color: '#06B6D4',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'none',
    display: 'inline-block',
  },

  loadingBox: {
    textAlign: 'center',
    padding: 40,
    color: '#64748B',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 20,
    padding: '28px',
    width: '100%',
    maxWidth: 500,
    boxShadow: '0 25px 80px rgba(0,0,0,0.9)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    color: '#F8FAFC',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    fontSize: 16,
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  formRowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 600,
  },
  input: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#F8FAFC',
    fontSize: 13,
    padding: '10px 12px',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#94A3B8',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
