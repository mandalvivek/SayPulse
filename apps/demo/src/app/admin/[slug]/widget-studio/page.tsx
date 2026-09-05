'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const ANIMATIONS = [
  {
    id: 'siri-wave',
    name: 'Siri Wave',
    subtitle: 'Holographic fluid sine wave ribbons',
    icon: '🌊',
  },
  {
    id: 'neural-sphere',
    name: 'Neural Sphere',
    subtitle: 'Breathing 3D particle nodes',
    icon: '🔮',
  },
  {
    id: 'particle-ring',
    name: 'Particle Ring',
    subtitle: 'Orbiting quantum dust ring',
    icon: '🪐',
  },
  {
    id: 'nebula-plasma',
    name: 'Nebula Plasma',
    subtitle: 'Ethereal glowing gas cloud',
    icon: '🌌',
  },
  {
    id: 'solar-ribbon',
    name: 'Solar Ribbon',
    subtitle: 'Golden helical energy spiral',
    icon: '🎗️',
  },
  {
    id: 'laser-horizon',
    name: 'Laser Horizon',
    subtitle: 'Dual neon equalizer beams',
    icon: '⚡',
  },
];

export default function TenantWidgetStudioPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'demo';

  // Customizer State
  const [selectedAnimation, setSelectedAnimation] = useState('siri-wave');
  const [primaryColor, setPrimaryColor] = useState('#06B6D4');
  const [position, setPosition] = useState('bottom-right');
  const [headerTitle, setHeaderTitle] = useState("How's your experience? 🎯");
  const [headerSubtitle, setHeaderSubtitle] = useState('Tap a star to rate');
  const [apiKey, setApiKey] = useState('sp_live_...');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [configRes, keysRes] = await Promise.all([
          fetch(`/saypulse/v1/admin/widget-config?slug=${slug}`),
          fetch(`/saypulse/v1/admin/api-keys?slug=${slug}`),
        ]);

        const cfg = await configRes.json();
        const keys = await keysRes.json();

        if (cfg) {
          if (cfg.default_animation) setSelectedAnimation(cfg.default_animation);
          if (cfg.primary_color) setPrimaryColor(cfg.primary_color);
          if (cfg.position) setPosition(cfg.position);
          if (cfg.header_title) setHeaderTitle(cfg.header_title);
          if (cfg.header_subtitle) setHeaderSubtitle(cfg.header_subtitle);
        }

        if (Array.isArray(keys) && keys.length > 0) {
          setApiKey(keys[0].api_key);
        }
      } catch (e) {
        console.error('Failed loading widget config:', e);
      }
    };

    loadConfig();
  }, [slug]);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await fetch('/saypulse/v1/admin/widget-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          default_animation: selectedAnimation,
          primary_color: primaryColor,
          position,
          header_title: headerTitle,
          header_subtitle: headerSubtitle,
        }),
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch (e) {
      console.error('Failed saving config:', e);
    } finally {
      setSaving(false);
    }
  };

  const copyScript = () => {
    const code = `<script src="https://cdn.saypulse.ai/v1/saypulse.min.js" data-key="${apiKey}" data-animation="${selectedAnimation}" data-position="${position}" defer></script>`;
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.workspacePill}>
            <span>🏢 /admin/{slug}</span>
          </div>
          <h1 style={styles.title}>Widget Studio & Live Customizer</h1>
          <p style={styles.subtitle}>
            Preview all 6 unboxed hyper-realistic space animations and customize your brand embed.
          </p>
        </div>

        <button onClick={handleSaveConfig} disabled={saving} style={styles.saveBtn}>
          {savedNotice ? '✓ Saved to Cloud!' : saving ? 'Saving…' : '💾 Save Widget Config'}
        </button>
      </div>

      <div style={styles.layoutGrid}>
        {/* ── Left Column: Configuration Controls ── */}
        <div style={styles.controlsCol}>
          {/* Animation Selector */}
          <div style={styles.controlCard}>
            <h3 style={styles.cardTitle}>1. Unboxed Spoken Visualizer Animation</h3>
            <p style={styles.cardSub}>Choose the fluid visualizer shown when users speak</p>

            <div style={styles.animGrid}>
              {ANIMATIONS.map((anim) => (
                <div
                  key={anim.id}
                  onClick={() => setSelectedAnimation(anim.id)}
                  style={{
                    ...styles.animOption,
                    borderColor: selectedAnimation === anim.id ? primaryColor : '#1E293B',
                    background:
                      selectedAnimation === anim.id
                        ? `${primaryColor}15`
                        : '#0F172A',
                  }}
                >
                  <div style={styles.animIcon}>{anim.icon}</div>
                  <div>
                    <div style={styles.animName}>{anim.name}</div>
                    <div style={styles.animSub}>{anim.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color & Position */}
          <div style={styles.controlCard}>
            <h3 style={styles.cardTitle}>2. Brand Styling & Badge Placement</h3>

            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Primary Glow Accent</label>
                <div style={styles.colorPickerRow}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={styles.colorInput}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={styles.colorTextInput}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Floating Mic Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="bottom-right">Bottom Right (Default)</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Copy */}
          <div style={styles.controlCard}>
            <h3 style={styles.cardTitle}>3. Header Copy</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Dialog Header Title</label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                style={styles.textInput}
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Live Interactive Sandbox & Embed Snippet ── */}
        <div style={styles.previewCol}>
          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>
              <span style={styles.previewBadge}>LIVE SANDBOX PREVIEW</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>
                Animation: <strong>{selectedAnimation}</strong>
              </span>
            </div>

            {/* Sandbox Simulation Window */}
            <div style={styles.sandboxCanvas}>
              <div style={styles.sandboxMockContent}>
                <div style={styles.mockHero}>
                  <div style={styles.mockTitle}>Your Website / Application</div>
                  <div style={styles.mockSub}>
                    The SayPulse floating mic badge automatically floats over your UI.
                  </div>
                </div>
              </div>

              {/* Floating Trigger Badge */}
              <div
                style={{
                  ...styles.floatingBadgeSim,
                  background: primaryColor,
                  boxShadow: `0 0 24px ${primaryColor}66`,
                  right: position.includes('right') ? 24 : 'auto',
                  left: position.includes('left') ? 24 : 'auto',
                  bottom: position.includes('bottom') ? 24 : 'auto',
                  top: position.includes('top') ? 24 : 'auto',
                }}
              >
                🎙️
              </div>
            </div>

            {/* 1-Line Embed Snippet */}
            <div style={styles.snippetBox}>
              <div style={styles.snippetTop}>
                <span style={styles.snippetTitle}>⚡ Universal 1-Line Embed Code</span>
                <button onClick={copyScript} style={styles.copyBtn}>
                  {copiedScript ? '✓ Copied!' : '📋 Copy Script Tag'}
                </button>
              </div>
              <pre style={styles.codeBlock}>
                {`<script src="https://cdn.saypulse.ai/v1/saypulse.min.js"\n  data-key="${apiKey}"\n  data-animation="${selectedAnimation}"\n  data-position="${position}"\n  defer></script>`}
              </pre>
            </div>
          </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  saveBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
  },

  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  controlsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  previewCol: {
    position: 'sticky',
    top: 24,
  },

  controlCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '24px',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#F8FAFC',
    margin: '0 0 4px',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    margin: '0 0 16px',
  },

  animGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  animOption: {
    border: '1px solid',
    borderRadius: 12,
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  animIcon: {
    fontSize: 20,
  },
  animName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#F8FAFC',
  },
  animSub: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 1.3,
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94A3B8',
  },
  colorPickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  colorInput: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: 'none',
  },
  colorTextInput: {
    flex: 1,
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#F8FAFC',
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: 'monospace',
    outline: 'none',
  },
  selectInput: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#F8FAFC',
    padding: '8px 10px',
    fontSize: 13,
    outline: 'none',
  },
  textInput: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#F8FAFC',
    padding: '10px 12px',
    fontSize: 13,
    outline: 'none',
  },

  previewCard: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 20,
    padding: '24px',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewBadge: {
    background: 'rgba(6,182,212,0.15)',
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 6,
    letterSpacing: 0.5,
  },

  sandboxCanvas: {
    position: 'relative',
    height: 280,
    background: '#060913',
    border: '1px solid #1E293B',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sandboxMockContent: {
    padding: 24,
  },
  mockHero: {
    textAlign: 'center',
    marginTop: 40,
  },
  mockTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#F8FAFC',
    marginBottom: 6,
  },
  mockSub: {
    fontSize: 12,
    color: '#64748B',
    maxWidth: 280,
    margin: '0 auto',
  },
  floatingBadgeSim: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    cursor: 'pointer',
    color: '#fff',
  },

  snippetBox: {
    background: '#060913',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: '16px',
  },
  snippetTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  snippetTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#94A3B8',
  },
  copyBtn: {
    background: 'rgba(6,182,212,0.15)',
    border: '1px solid rgba(6,182,212,0.3)',
    color: '#06B6D4',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  },
  codeBlock: {
    margin: 0,
    color: '#38BDF8',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
};
