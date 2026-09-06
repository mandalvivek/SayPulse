'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

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

const TRIGGER_STYLES = [
  {
    id: 'pill-wave-voice',
    name: 'Hybrid Voice + Wave',
    icon: '🎙️',
    badge: 'RECOMMENDED',
    desc: 'Pill dock with speech mic, animated micro-equalizer bars, and feedback text.',
    previewText: 'Feedback',
  },
  {
    id: 'bubble-wave',
    name: 'Chat Bubble Wave',
    icon: '💬',
    badge: 'CONVERSATIONAL',
    desc: 'Speech bubble icon with animated soundbars and clean feedback label.',
    previewText: 'Feedback',
  },
  {
    id: 'tab-corner',
    name: 'Corner Tab',
    icon: '✨',
    badge: 'MINIMAL',
    desc: 'Sleek corner-anchored sparkle tab with directional action indicator.',
    previewText: 'Feedback ➔',
  },
  {
    id: 'badge-compact',
    name: 'Micro Voice Pill',
    icon: '🎙️',
    badge: 'ULTRA COMPACT',
    desc: 'Lightweight micro-dock pill displaying a clean mic badge and text.',
    previewText: 'Voice',
  },
  {
    id: 'memo-voice',
    name: 'Voice Memo',
    icon: '🎧',
    badge: 'AUDIO MEMO',
    desc: 'Modern audio headset badge with soft indigo gradient accents.',
    previewText: 'Voice Memo',
  },
  {
    id: 'tab-vertical',
    name: 'Vertical Edge Ribbon',
    icon: '📑',
    badge: 'SIDE DOCK',
    desc: 'Lateral vertical edge tab docked directly on the screen margin.',
    previewText: 'FEEDBACK',
  },
];

export default function TenantWidgetStudioPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'demo';

  // Customizer State
  const [layoutMode, setLayoutMode] = useState<'card' | 'bottom-pill'>('card');
  const [selectedAnimation, setSelectedAnimation] = useState('siri-wave');
  const [triggerStyle, setTriggerStyle] = useState('pill-wave-voice');
  const [autoCollapse, setAutoCollapse] = useState(true);
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
          apiFetch(`/saypulse/v1/admin/widget-config?slug=${slug}`),
          apiFetch(`/saypulse/v1/admin/api-keys?slug=${slug}`),
        ]);

        const cfg = await configRes.json();
        const keys = await keysRes.json();

        if (cfg) {
          if (cfg.layout_mode) setLayoutMode(cfg.layout_mode);
          if (cfg.default_animation) setSelectedAnimation(cfg.default_animation);
          if (cfg.trigger_style) setTriggerStyle(cfg.trigger_style);
          if (cfg.auto_collapse !== undefined) setAutoCollapse(Boolean(cfg.auto_collapse));
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
      await apiFetch('/saypulse/v1/admin/widget-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          layout_mode: layoutMode,
          default_animation: selectedAnimation,
          trigger_style: triggerStyle,
          auto_collapse: autoCollapse,
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
    const code = `<!-- SayPulse AI Voice Feedback Widget -->
<script 
  src="https://saypulse.nextgenmultiverse.com/saypulse.min.js" 
  data-key="${apiKey}" 
  data-layout="${layoutMode}"
  data-animation="${selectedAnimation}" 
  data-trigger-style="${triggerStyle}"
  data-auto-collapse="${autoCollapse}"
  data-color="${primaryColor}" 
  data-position="${position}" 
  defer>
</script>`;
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes sp-eq-1 { 0%, 100% { height: 3px; } 50% { height: 11px; } }
        @keyframes sp-eq-2 { 0%, 100% { height: 11px; } 50% { height: 4px; } }
        @keyframes sp-eq-3 { 0%, 100% { height: 5px; } 50% { height: 13px; } }
        @keyframes sp-eq-4 { 0%, 100% { height: 9px; } 50% { height: 3px; } }
        .sim-eq-bar { width: 2px; border-radius: 2px; background: currentColor; display: inline-block; }
        .sim-eq-1 { animation: sp-eq-1 0.9s ease-in-out infinite; }
        .sim-eq-2 { animation: sp-eq-2 0.7s ease-in-out infinite 0.15s; }
        .sim-eq-3 { animation: sp-eq-3 1.1s ease-in-out infinite 0.3s; }
        .sim-eq-4 { animation: sp-eq-4 0.8s ease-in-out infinite 0.2s; }
      `}</style>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.workspacePill}>
            <span>🏢 /admin/{slug}</span>
          </div>
          <h1 style={styles.title}>Widget Studio & Live Customizer</h1>
          <p style={styles.subtitle}>
            Customize your brand voice trigger aesthetic, unboxed space visualizer, and scroll collapse behaviors.
          </p>
        </div>

        <button onClick={handleSaveConfig} disabled={saving} style={styles.saveBtn}>
          {savedNotice ? '✓ Saved to Cloud!' : saving ? 'Saving…' : '💾 Save Widget Config'}
        </button>
      </div>

      <div style={styles.layoutGrid}>
        {/* ── Left Column: Configuration Controls ── */}
        <div style={styles.controlsCol}>
          {/* 1. Presentation Architecture */}
          <div style={styles.controlCard}>
            <h3 style={styles.cardTitle}>1. Widget Presentation Style</h3>
            <p style={styles.cardSub}>Choose between a floating corner card or an unboxed bottom dock</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div
                onClick={() => setLayoutMode('card')}
                style={{
                  ...styles.animOption,
                  borderColor: layoutMode === 'card' ? primaryColor : '#1E293B',
                  background: layoutMode === 'card' ? `${primaryColor}15` : '#0F172A',
                  cursor: 'pointer',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>🗂️</div>
                <div style={styles.animName}>Corner Card (Default)</div>
                <div style={styles.animSub}>Compact corner badge that pops open a sleek dialog card</div>
              </div>

              <div
                onClick={() => setLayoutMode('bottom-pill')}
                style={{
                  ...styles.animOption,
                  borderColor: layoutMode === 'bottom-pill' ? primaryColor : '#1E293B',
                  background: layoutMode === 'bottom-pill' ? `${primaryColor}15` : '#0F172A',
                  cursor: 'pointer',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>💊</div>
                <div style={styles.animName}>Unboxed Bottom Dock</div>
                <div style={styles.animSub}>Dynamic island pill floating centrally at the bottom</div>
              </div>
            </div>
          </div>

          {/* 2. Floating Trigger Button Style */}
          <div style={styles.controlCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={styles.cardTitle}>2. Floating Trigger Button Style</h3>
              <span style={{ fontSize: 11, color: '#06B6D4', fontWeight: 600 }}>6 Distinct Aesthetics</span>
            </div>
            <p style={styles.cardSub}>Select the floating trigger badge displayed on your website pages</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TRIGGER_STYLES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTriggerStyle(t.id)}
                  style={{
                    ...styles.animOption,
                    borderColor: triggerStyle === t.id ? primaryColor : '#1E293B',
                    background: triggerStyle === t.id ? `${primaryColor}15` : '#0F172A',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: 18 }}>{t.icon}</span>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${primaryColor}22`, color: primaryColor, fontWeight: 700 }}>
                      {t.badge}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#F8FAFC' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.3 }}>{t.desc}</div>
                  <div style={{ marginTop: 4, fontSize: 11, fontFamily: 'monospace', color: '#06B6D4', background: '#090D16', padding: '3px 8px', borderRadius: 6, width: '100%', boxSizing: 'border-box' }}>
                    {t.previewText}
                  </div>
                </div>
              ))}
            </div>

            {/* Auto Collapse Toggle Switch */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>Scroll-Aware Auto-Collapse</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Smoothly collapse button text to a compact badge while user is scrolling</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoCollapse}
                  onChange={(e) => setAutoCollapse(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#06B6D4', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* 3. Animation Selector */}
          <div style={styles.controlCard}>
            <h3 style={styles.cardTitle}>3. Spoken Visualizer Animation</h3>
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

          {/* 4. Color & Position */}
          <div style={styles.controlCard}>
            <h3 style={styles.cardTitle}>4. Brand Styling & Badge Placement</h3>

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

              {layoutMode === 'card' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Floating Trigger Position</label>
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
              )}
            </div>
          </div>

          {/* 5. Modal Copy */}
          <div style={styles.controlCard}>
            <h3 style={styles.cardTitle}>5. Header Copy</h3>
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
                Style: <strong>{triggerStyle}</strong> • <strong>{selectedAnimation}</strong>
              </span>
            </div>

            {/* Sandbox Simulation Window */}
            <div style={styles.sandboxCanvas}>
              <div style={styles.sandboxMockContent}>
                <div style={styles.mockHero}>
                  <div style={styles.mockTitle}>Your Website / Application</div>
                  <div style={styles.mockSub}>
                    {layoutMode === 'bottom-pill'
                      ? 'The unboxed dynamic dock floats centrally at the bottom of the viewport.'
                      : 'The customizable SayPulse voice feedback trigger floats neatly in your UI with scroll collapse.'}
                  </div>
                </div>
              </div>

              {/* Simulated Floating Trigger Badge */}
              {layoutMode === 'bottom-pill' ? (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    height: 44,
                    padding: '0 20px',
                    borderRadius: 22,
                    background: primaryColor,
                    boxShadow: `0 0 24px ${primaryColor}88`,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <span>🎙️</span>
                  <span>Speak Feedback</span>
                </div>
              ) : triggerStyle === 'tab-vertical' ? (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    transform: 'translateY(-50%)',
                    background: '#0F172A',
                    border: `1px solid ${primaryColor}66`,
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                    padding: '12px 8px',
                    color: '#FFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '-4px 4px 16px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 14 }}>🎙️</span>
                  <span style={{ writingMode: 'vertical-rl', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>FEEDBACK</span>
                </div>
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    right: position.includes('right') ? 20 : 'auto',
                    left: position.includes('left') ? 20 : 'auto',
                    bottom: position.includes('bottom') ? 20 : 'auto',
                    top: position.includes('top') ? 20 : 'auto',
                    height: triggerStyle === 'badge-compact' ? 36 : 42,
                    padding: triggerStyle === 'badge-compact' ? '0 12px' : '0 16px',
                    borderRadius: 9999,
                    background: triggerStyle === 'badge-compact' ? '#0F172A' : primaryColor,
                    border: triggerStyle === 'badge-compact' ? `1px solid ${primaryColor}88` : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: `0 6px 20px ${primaryColor}55`,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {triggerStyle === 'pill-wave-voice' && (
                    <>
                      <span>🎙️</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 12 }}>
                        <span className="sim-eq-bar sim-eq-1" />
                        <span className="sim-eq-bar sim-eq-2" />
                        <span className="sim-eq-bar sim-eq-3" />
                        <span className="sim-eq-bar sim-eq-4" />
                      </span>
                      <span>Feedback</span>
                    </>
                  )}
                  {triggerStyle === 'bubble-wave' && (
                    <>
                      <span>💬</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 12 }}>
                        <span className="sim-eq-bar sim-eq-1" />
                        <span className="sim-eq-bar sim-eq-2" />
                        <span className="sim-eq-bar sim-eq-3" />
                      </span>
                      <span>Feedback</span>
                    </>
                  )}
                  {triggerStyle === 'tab-corner' && (
                    <>
                      <span>✨</span>
                      <span>Feedback</span>
                      <span style={{ fontSize: 11 }}>➔</span>
                    </>
                  )}
                  {triggerStyle === 'badge-compact' && (
                    <>
                      <span>🎙️</span>
                      <span>Voice</span>
                    </>
                  )}
                  {triggerStyle === 'memo-voice' && (
                    <>
                      <span>🎧</span>
                      <span>Voice Memo</span>
                    </>
                  )}
                </div>
              )}
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
                {`<script \n  src="https://saypulse.nextgenmultiverse.com/saypulse.min.js" \n  data-key="${apiKey}" \n  data-layout="${layoutMode}"\n  data-animation="${selectedAnimation}" \n  data-trigger-style="${triggerStyle}"\n  data-auto-collapse="${autoCollapse}"\n  data-color="${primaryColor}" \n  data-position="${position}" \n  defer></script>`}
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
