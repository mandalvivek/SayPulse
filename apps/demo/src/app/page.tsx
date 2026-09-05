// Dashboard — Main page of the Acme Analytics demo
// This is the primary SayPulse test harness page.
// The floating mic widget is already mounted via the root layout.

const KPI_CARDS = [
  { label: 'Total Revenue',    value: '₹48.2L',   change: '+12.4%', up: true,  color: '#06B6D4' },
  { label: 'Active Users',     value: '12,847',   change: '+8.1%',  up: true,  color: '#6366F1' },
  { label: 'Conversion Rate',  value: '3.82%',    change: '-0.3%',  up: false, color: '#F59E0B' },
  { label: 'Avg Session Time', value: '4m 12s',   change: '+22s',   up: true,  color: '#10B981' },
];

const RECENT_USERS = [
  { name: 'Priya Sharma',    email: 'priya@startup.in',   plan: 'Pro',      date: '2 min ago',  status: 'Active'  },
  { name: 'Arjun Mehta',    email: 'arjun@corp.com',     plan: 'Enterprise',date: '14 min ago', status: 'Active'  },
  { name: 'Kavitha Nair',   email: 'k.nair@healthco.in', plan: 'Starter',  date: '1 hr ago',   status: 'Churned' },
  { name: 'Rohan Desai',    email: 'rohan@saas.io',      plan: 'Pro',      date: '3 hr ago',   status: 'Active'  },
  { name: 'Sneha Kulkarni', email: 'sneha@fintech.in',   plan: 'Pro',      date: 'Yesterday',  status: 'Trial'   },
];

const STATUS_COLOR: Record<string, string> = {
  Active:  '#10B981',
  Churned: '#EF4444',
  Trial:   '#F59E0B',
};

// Fake bar chart data (CSS bars)
const CHART_DATA = [
  { label: 'Jan', value: 62 },  { label: 'Feb', value: 75 },
  { label: 'Mar', value: 58 },  { label: 'Apr', value: 88 },
  { label: 'May', value: 70 },  { label: 'Jun', value: 95 },
  { label: 'Jul', value: 82 },  { label: 'Aug', value: 100 },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Page header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Good morning, Vivek 👋</h1>
          <p style={styles.pageSub}>Here&apos;s what&apos;s happening with Acme Analytics today.</p>
        </div>
        <div style={styles.headerActions}>
          <span style={styles.dateBadge}>📅 Aug 23, 2026</span>
          <button style={styles.exportBtn}>↓ Export Report</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {KPI_CARDS.map((card) => (
          <div key={card.label} style={styles.kpiCard}>
            <div style={{ ...styles.kpiDot, background: card.color }} />
            <p style={styles.kpiLabel}>{card.label}</p>
            <p style={styles.kpiValue}>{card.value}</p>
            <span style={{ ...styles.kpiChange, color: card.up ? '#10B981' : '#EF4444' }}>
              {card.up ? '▲' : '▼'} {card.change}
            </span>
          </div>
        ))}
      </div>

      {/* Chart + Info row */}
      <div style={styles.row}>
        {/* Bar chart */}
        <div style={{ ...styles.card, flex: 2 }}>
          <div style={styles.cardHeader}>
            <p style={styles.cardTitle}>Monthly Revenue</p>
            <span style={styles.cardBadge}>Last 8 months</span>
          </div>
          <div style={styles.chartArea}>
            {CHART_DATA.map((d) => (
              <div key={d.label} style={styles.barGroup}>
                <div
                  style={{
                    ...styles.bar,
                    height: `${d.value}%`,
                    background:
                      d.value === 100
                        ? 'linear-gradient(180deg,#06B6D4,#6366F1)'
                        : 'rgba(6,182,212,0.45)',
                  }}
                />
                <span style={styles.barLabel}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ ...styles.card, flex: 1 }}>
          <p style={styles.cardTitle}>Quick Stats</p>
          {[
            { label: 'New signups today',  value: '84' },
            { label: 'Tickets open',       value: '12' },
            { label: 'Uptime (30d)',        value: '99.97%' },
            { label: 'API calls today',    value: '2.4M' },
            { label: 'Avg Gemini latency', value: '1.1s' },
          ].map((s) => (
            <div key={s.label} style={styles.statRow}>
              <span style={styles.statLabel}>{s.label}</span>
              <span style={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent users table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <p style={styles.cardTitle}>Recent Signups</p>
          <button style={styles.viewAllBtn}>View all →</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Name', 'Email', 'Plan', 'Joined', 'Status'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_USERS.map((u, i) => (
              <tr key={i} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.avatar}>
                    {u.name.charAt(0)}
                  </div>
                  <span style={styles.tdName}>{u.name}</span>
                </td>
                <td style={{ ...styles.td, color: '#64748B' }}>{u.email}</td>
                <td style={styles.td}>
                  <span style={styles.planBadge}>{u.plan}</span>
                </td>
                <td style={{ ...styles.td, color: '#64748B' }}>{u.date}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusDot,
                      background: `${STATUS_COLOR[u.status] ?? '#64748B'}22`,
                      color: STATUS_COLOR[u.status] ?? '#64748B',
                      border: `1px solid ${STATUS_COLOR[u.status] ?? '#64748B'}44`,
                    }}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SayPulse hint */}
      <div style={styles.hint}>
        💡 <strong>Try SayPulse:</strong> Click the mic button in the bottom-right corner to submit voice feedback about this dashboard!
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle:  { color: '#F1F5F9', fontSize: 24, fontWeight: 700, margin: '0 0 4px' },
  pageSub:    { color: '#64748B', fontSize: 14, margin: 0 },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
  dateBadge:  { color: '#64748B', fontSize: 13, background: '#1E293B', padding: '6px 12px', borderRadius: 8 },
  exportBtn:  { padding: '7px 16px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13 },
  kpiGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  kpiCard:    { background: '#1E293B', borderRadius: 14, padding: '20px 20px 16px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' },
  kpiDot:     { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '14px 14px 0 0' },
  kpiLabel:   { color: '#64748B', fontSize: 12, fontWeight: 500, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue:   { color: '#F1F5F9', fontSize: 26, fontWeight: 700, margin: '0 0 6px' },
  kpiChange:  { fontSize: 12, fontWeight: 600 },
  row:        { display: 'flex', gap: 16, marginBottom: 24 },
  card:       { background: '#1E293B', borderRadius: 14, padding: 20, border: '1px solid #334155', marginBottom: 24 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle:  { color: '#F1F5F9', fontSize: 15, fontWeight: 600, margin: 0 },
  cardBadge:  { color: '#64748B', fontSize: 12, background: '#0F172A', padding: '3px 10px', borderRadius: 20 },
  chartArea:  { display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 4px' },
  barGroup:   { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' },
  bar:        { width: '100%', borderRadius: '4px 4px 0 0', minHeight: 6, transition: 'height 0.3s' },
  barLabel:   { color: '#475569', fontSize: 10 },
  statRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0F172A' },
  statLabel:  { color: '#64748B', fontSize: 13 },
  statValue:  { color: '#F1F5F9', fontWeight: 600, fontSize: 14 },
  table:      { width: '100%', borderCollapse: 'collapse' },
  thead:      { borderBottom: '1px solid #0F172A' },
  th:         { color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left', padding: '8px 12px' },
  tr:         { borderBottom: '1px solid #0F172A' },
  td:         { padding: '12px 12px', fontSize: 13, color: '#E2E8F0', display: 'table-cell', verticalAlign: 'middle' },
  avatar:     { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#06B6D4)', color: '#fff', fontSize: 12, fontWeight: 700, marginRight: 10 },
  tdName:     { fontWeight: 500 },
  planBadge:  { background: '#0F172A', color: '#94A3B8', fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid #334155' },
  statusDot:  { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  viewAllBtn: { background: 'none', border: 'none', color: '#06B6D4', cursor: 'pointer', fontSize: 13 },
  hint:       { background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, padding: '14px 18px', color: '#94A3B8', fontSize: 13, lineHeight: 1.5 },
};
