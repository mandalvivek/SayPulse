'use client';

import React, { useEffect, useState } from 'react';
import { AudioVisualizer } from '@saypulse/react';
import { AnimationVariant } from '@saypulse/react';

const ANIMATION_OPTIONS: { id: AnimationVariant; name: string; icon: string; desc: string }[] = [
  { id: 'siri-wave', name: 'Siri Wave', icon: '🌊', desc: 'Fluid multi-color harmonic frequency ribbons' },
  { id: 'neural-sphere', name: 'Neural Sphere', icon: '🌐', desc: '3D rotating holographic constellation orb' },
  { id: 'particle-ring', name: 'Particle Ring', icon: '🪐', desc: 'Cosmic chromatic particle corona with turbulent aura' },
  { id: 'nebula-plasma', name: 'Nebula Plasma', icon: '✨', desc: 'Swirling quantum photons around an additive plasma core' },
  { id: 'solar-ribbon', name: 'Solar Ribbon', icon: '☀️', desc: 'Radiating solar spikes with sweeping magnetic side wings' },
  { id: 'laser-horizon', name: 'Laser Horizon', icon: '⚡', desc: 'Horizontal soliton laser with expanding radar beacon' },
];

export default function AdminWidgetStudioPage() {
  const [activeAnim, setActiveAnim] = useState<AnimationVariant>('siri-wave');
  const [primaryColor, setPrimaryColor] = useState('#06B6D4');
  const [position, setPosition] = useState('bottom-right');
  const [title, setTitle] = useState("How's your experience? 🎯");
  const [subtitle, setSubtitle] = useState('Tap a star to rate');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Frequency ref for live visualizer preview
  const freqRef = React.useRef<Uint8Array>(new Uint8Array(64));

  useEffect(() => {
    // Generate animated frequency data for the preview
    let phase = 0;
    const interval = setInterval(() => {
      phase += 0.1;
      const arr = new Uint8Array(64);
      for (let i = 0; i < 64; i++) {
        arr[i] = Math.floor(128 + Math.sin(phase + i * 0.2) * 80 + Math.random() * 30);
      }
      freqRef.current = arr;
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/saypulse/v1/admin/widget-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_animation: activeAnim,
          primary_color: primaryColor,
          position,
          header_title: title,
          header_subtitle: subtitle,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Failed saving widget config:', e);
    }
  };

  const embedScriptTag = `<!-- SayPulse AI Voice Feedback Widget -->
<script
  src="http://localhost:7100/saypulse.min.js"
  data-api-key="sp_dev_local_master"
  data-animation="${activeAnim}"
  data-color="${primaryColor}"
  data-position="${position}"
  defer>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedScriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Widget Studio</h1>
          <p style={styles.pageSubtitle}>
            Customize widget animations, brand colors, and copy with real-time live preview
          </p>
        </div>
        <button onClick={handleSave} style={styles.saveBtn}>
          {saved ? '✓ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      <div style={styles.studioGrid}>
        {/* ── Left: Controls ── */}
        <div style={styles.controlPanel}>
          {/* Section 1: Animation Variant */}
          <div style={styles.configSection}>
            <p style={styles.sectionHeading}>1. SELECT ACTIVE ANIMATION</p>
            <div style={styles.animGrid}>
              {ANIMATION_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setActiveAnim(opt.id)}
                  style={{
                    ...styles.animCard,
                    borderColor: activeAnim === opt.id ? '#06B6D4' : '#334155',
                    background: activeAnim === opt.id ? 'rgba(6,182,212,0.1)' : '#1E293B',
                  }}
                >
                  <div style={styles.animIcon}>{opt.icon}</div>
                  <div>
                    <p style={styles.animName}>{opt.name}</p>
                    <p style={styles.animDesc}>{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Colors & Positioning */}
          <div style={styles.configSection}>
            <p style={styles.sectionHeading}>2. BRANDING & POSITION</p>
            <div style={styles.rowTwo}>
              <div>
                <label style={styles.inputLabel}>Primary Brand Accent Color</label>
                <div style={styles.colorPickerRow}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={styles.colorInput}
                  />
                  <span style={styles.colorHex}>{primaryColor}</span>
                </div>
              </div>

              <div>
                <label style={styles.inputLabel}>Widget Screen Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  style={styles.selectBox}
                >
                  <option value="bottom-right">Bottom-Right (Standard)</option>
                  <option value="bottom-left">Bottom-Left</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Copy Customization */}
          <div style={styles.configSection}>
            <p style={styles.sectionHeading}>3. HEADER COPY</p>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Popover Header Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.textInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Popover Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                style={styles.textInput}
              />
            </div>
          </div>

          {/* Section 4: Embed Code */}
          <div style={styles.configSection}>
            <div style={styles.embedHeader}>
              <p style={styles.sectionHeading}>4. 1-LINE EMBED CODE</p>
              <button onClick={handleCopy} style={styles.copyBtn}>
                {copied ? '✓ Copied!' : '📋 Copy Snippet'}
              </button>
            </div>
            <pre style={styles.codeBlock}>
              <code>{embedScriptTag}</code>
            </pre>
          </div>
        </div>

        {/* ── Right: Live Sandbox Preview ── */}
        <div style={styles.previewPanel}>
          <div style={styles.previewHeader}>
            <span style={styles.previewDot} />
            <span style={styles.previewTitle}>Live Visualizer Sandbox</span>
            <span style={styles.animBadge}>
              {ANIMATION_OPTIONS.find((a) => a.id === activeAnim)?.icon}{' '}
              {ANIMATION_OPTIONS.find((a) => a.id === activeAnim)?.name}
            </span>
          </div>

          <div style={styles.previewCanvasArea}>
            <AudioVisualizer
              variant={activeAnim}
              freqRef={freqRef}
              isActive={true}
              height={240}
            />

            <div style={styles.simulatedDock}>
              <div style={styles.simDockLeft}>
                <span style={styles.simRecDot} />
                <span style={styles.simTimer}>00:14</span>
              </div>
              <div style={styles.simDivider} />
              <span style={styles.simAnimTag}>
                {ANIMATION_OPTIONS.find((a) => a.id === activeAnim)?.name}
              </span>
              <div style={styles.simDivider} />
              <span style={styles.simStopBtn}>Stop</span>
            </div>
          </div>

          {/* Simulated Rating Popover */}
          <div style={styles.popoverPreviewBox}>
            <p style={styles.popoverTitle}>{title}</p>
            <p style={styles.popoverSub}>{subtitle}</p>
            <div style={styles.popoverStars}>
              {'★★★★☆'}
            </div>
            <div style={styles.popoverTagsRow}>
              <span style={styles.popoverTag}>#Bug / Error</span>
              <span style={styles.popoverTag}>#Slow / Laggy</span>
              <span style={styles.popoverTag}>#Confusing UI</span>
            </div>
            <button style={{ ...styles.popoverMicBtn, background: `linear-gradient(135deg, ${primaryColor}, #6366F1)` }}>
              🎙️ Tell us more with voice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  pageTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: '#64748B',
    fontSize: 14,
    margin: '4px 0 0',
  },
  saveBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    padding: '8px 18px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
  },

  studioGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  controlPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  configSection: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '20px 22px',
  },
  sectionHeading: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    margin: '0 0 14px',
  },

  animGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  animCard: {
    borderRadius: 12,
    border: '1px solid #334155',
    padding: '12px 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    transition: 'all 0.15s ease',
  },
  animIcon: {
    fontSize: 20,
  },
  animName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 700,
    margin: '0 0 2px',
  },
  animDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 1.3,
    margin: 0,
  },

  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    display: 'block',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
  },
  colorPickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  colorInput: {
    width: 40,
    height: 36,
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1E293B',
    cursor: 'pointer',
  },
  colorHex: {
    color: '#F1F5F9',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  selectBox: {
    width: '100%',
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#F1F5F9',
    fontSize: 13,
    padding: '8px 10px',
    outline: 'none',
  },
  textInput: {
    width: '100%',
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#F1F5F9',
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  embedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyBtn: {
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  codeBlock: {
    background: '#0B1120',
    border: '1px solid #1E293B',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#38BDF8',
    fontSize: 12,
    lineHeight: 1.5,
    overflowX: 'auto',
    margin: 0,
    fontFamily: 'monospace',
  },

  previewPanel: {
    background: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#10B981',
  },
  previewTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 700,
  },
  animBadge: {
    marginLeft: 'auto',
    background: 'rgba(6,182,212,0.12)',
    border: '1px solid rgba(6,182,212,0.3)',
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 12,
  },
  previewCanvasArea: {
    background: '#0B1120',
    border: '1px solid #1E293B',
    borderRadius: 14,
    height: 280,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  simulatedDock: {
    position: 'absolute',
    bottom: 14,
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: 20,
    padding: '4px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  simDockLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  simRecDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#EF4444',
  },
  simTimer: {
    color: '#F1F5F9',
    fontWeight: 600,
  },
  simDivider: {
    width: 1,
    height: 14,
    background: '#334155',
  },
  simAnimTag: {
    color: '#06B6D4',
    fontWeight: 600,
  },
  simStopBtn: {
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 700,
  },

  popoverPreviewBox: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 14,
    padding: '16px 18px',
  },
  popoverTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 700,
    margin: '0 0 2px',
  },
  popoverSub: {
    color: '#64748B',
    fontSize: 12,
    margin: '0 0 10px',
  },
  popoverStars: {
    color: '#FBBF24',
    fontSize: 18,
    marginBottom: 10,
  },
  popoverTagsRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  popoverTag: {
    background: '#0F172A',
    border: '1px solid #334155',
    color: '#94A3B8',
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 12,
  },
  popoverMicBtn: {
    width: '100%',
    border: 'none',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    padding: '9px 0',
    borderRadius: 8,
    cursor: 'pointer',
  },
};
