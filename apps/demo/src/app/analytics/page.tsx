// Analytics page — second route to test cross-route recording persistence
// Start a recording on Dashboard, navigate here, the pill should still be active.

const FUNNEL = [
  { stage: 'Page Views',     count: '142,500', pct: 100 },
  { stage: 'Sign Up Click',  count: '18,200',  pct: 13  },
  { stage: 'Registration',   count: '12,847',  pct: 9   },
  { stage: 'Onboarding',     count: '9,100',   pct: 6   },
  { stage: 'First Purchase', count: '3,820',   pct: 2.7 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <h1 style={styles.title}>Analytics</h1>
      <p style={styles.sub}>Conversion funnel · Last 30 days</p>

      <div style={styles.card}>
        <p style={styles.cardTitle}>User Conversion Funnel</p>
        {FUNNEL.map((f) => (
          <div key={f.stage} style={styles.funnelRow}>
            <span style={styles.stageLabel}>{f.stage}</span>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width: `${f.pct}%` }} />
            </div>
            <span style={styles.stageCount}>{f.count}</span>
            <span style={styles.stagePct}>{f.pct}%</span>
          </div>
        ))}
      </div>

      <p style={styles.hint}>
        🎙️ <strong>Test:</strong> Start a voice recording on the Dashboard page, then navigate here — the recording pill should still be active and the transcript will continue!
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title:      { color: '#F1F5F9', fontSize: 24, fontWeight: 700, margin: '0 0 4px' },
  sub:        { color: '#64748B', fontSize: 14, margin: '0 0 28px' },
  card:       { background: '#1E293B', borderRadius: 14, padding: 24, border: '1px solid #334155', marginBottom: 24 },
  cardTitle:  { color: '#F1F5F9', fontSize: 15, fontWeight: 600, margin: '0 0 20px' },
  funnelRow:  { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  stageLabel: { color: '#94A3B8', fontSize: 13, width: 130, flexShrink: 0 },
  barTrack:   { flex: 1, height: 10, background: '#0F172A', borderRadius: 5, overflow: 'hidden' },
  barFill:    { height: '100%', background: 'linear-gradient(90deg,#06B6D4,#6366F1)', borderRadius: 5, transition: 'width 0.5s' },
  stageCount: { color: '#F1F5F9', fontSize: 13, fontWeight: 600, width: 70, textAlign: 'right' },
  stagePct:   { color: '#64748B', fontSize: 12, width: 40, textAlign: 'right' },
  hint:       { background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '14px 18px', color: '#94A3B8', fontSize: 13 },
};
