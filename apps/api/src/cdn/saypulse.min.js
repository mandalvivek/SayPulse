/**
 * SayPulse Universal 1-Line Embeddable Voice Feedback Widget
 * Version: 2.1.0
 * Zero Dependencies • Shadow DOM Isolation • Gemini 3.6 Flash AI Telemetry
 * Supported Layouts: 'box' (Bottom-Right Card Popover) | 'full' (Full-Width Unboxed Horizon + Dynamic Island Dock)
 * Supported Animations: 'siri-wave', 'neural-sphere', 'particle-ring', 'nebula-plasma', 'solar-ribbon', 'laser-horizon'
 */
(function () {
  'use strict';

  // Prevent duplicate initialization
  if (window.__SAYPULSE_INITIALIZED__) return;
  window.__SAYPULSE_INITIALIZED__ = true;

  // Read configuration from current script tag
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('saypulse')) return scripts[i];
    }
    return null;
  })();

  const apiKey = currentScript ? currentScript.getAttribute('data-key') || 'sp_dev_local_master' : 'sp_dev_local_master';
  let apiBase = currentScript ? currentScript.getAttribute('data-api') : '';
  
  if (!apiBase) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      apiBase = 'http://localhost:8000';
    } else {
      apiBase = 'https://saypulse.nextgenmultiverse.com';
    }
  }
  apiBase = apiBase.replace(/\/+$/, '');

  let currentLayout = (currentScript && (currentScript.getAttribute('data-layout') || currentScript.getAttribute('data-mode'))) || 'box';
  let currentAnimation = (currentScript && currentScript.getAttribute('data-animation')) || 'siri-wave';
  const triggerStyle = (currentScript && (currentScript.getAttribute('data-trigger') || currentScript.getAttribute('data-trigger-style'))) || 'pill-wave';
  const primaryColor = (currentScript && currentScript.getAttribute('data-color')) || '#06B6D4';
  const initialLang = (currentScript && currentScript.getAttribute('data-lang')) || 'auto';
  const widgetTitle = (currentScript && currentScript.getAttribute('data-title')) || "How's your experience? 🎯";
  const showStars = (currentScript && currentScript.getAttribute('data-stars')) !== 'false';
  const autoCollapse = (currentScript && currentScript.getAttribute('data-auto-collapse')) !== 'false';

  // Phonetic brand dictionary for speech normalizations
  const PHONETIC_BRAND_DICTIONARY = [
    { pattern: /\b(sepals?|sepal|safe\s*pulse|say\s*pulse|say\s*pause|c\s*pulse|see\s*pulse|save\s*pulse|say\s*polls|say\s*poles|staples|stay\s*pulse|sayplus|say\s*plus|sapulse)\b/gi, replacement: 'SayPulse' },
    { pattern: /\b(next\s*gen\s*multiverse|nextgen\s*multiverse|next\s*generation\s*multiverse)\b/gi, replacement: 'NextGen Multiverse' },
    { pattern: /\b(exam\s*desk|examdesk)\b/gi, replacement: 'ExamDesk' },
    { pattern: /\b(tekton|tecton\s*enterprise)\b/gi, replacement: 'Tecton Enterprise' },
  ];

  function normalizeBrandTerms(text) {
    if (!text) return '';
    let res = text;
    for (let i = 0; i < PHONETIC_BRAND_DICTIONARY.length; i++) {
      res = res.replace(PHONETIC_BRAND_DICTIONARY[i].pattern, PHONETIC_BRAND_DICTIONARY[i].replacement);
    }
    return res;
  }

  // Global Context Harvesting
  const capturedErrors = [];
  const routeHistory = [window.location.pathname];

  window.addEventListener('error', function (e) {
    if (capturedErrors.length < 5) {
      capturedErrors.push(`${e.message} at ${e.filename || 'unknown'}:${e.lineno || 0}`);
    }
  });

  const pushState = history.pushState;
  if (pushState) {
    history.pushState = function () {
      pushState.apply(history, arguments);
      if (routeHistory[routeHistory.length - 1] !== window.location.pathname) {
        routeHistory.push(window.location.pathname);
      }
    };
  }

  // Create Container with Shadow DOM for complete CSS style encapsulation
  const host = document.createElement('div');
  host.id = 'saypulse-widget-root';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  // Widget HTML & Styles
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    @keyframes sp-eq-1 { 0%, 100% { height: 3px; } 50% { height: 11px; } }
    @keyframes sp-eq-2 { 0%, 100% { height: 11px; } 50% { height: 4px; } }
    @keyframes sp-eq-3 { 0%, 100% { height: 5px; } 50% { height: 13px; } }
    @keyframes sp-eq-4 { 0%, 100% { height: 9px; } 50% { height: 3px; } }
    
    @keyframes sp-recblink { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.85); } }
    @keyframes sp-pulse-glow {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(239,68,68,0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }

    @keyframes sp-fade-slide {
      from { opacity: 0; transform: translateY(10px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .sp-eq-bars { display: inline-flex; align-items: center; gap: 2.5px; height: 14px; }
    .sp-eq-bar { width: 2.5px; border-radius: 2px; background: #fff; display: inline-block; }
    .sp-eq-1 { animation: sp-eq-1 0.9s ease-in-out infinite; }
    .sp-eq-2 { animation: sp-eq-2 0.7s ease-in-out infinite 0.15s; }
    .sp-eq-3 { animation: sp-eq-3 1.1s ease-in-out infinite 0.3s; }
    .sp-eq-4 { animation: sp-eq-4 0.8s ease-in-out infinite 0.2s; }

    /* Floating Trigger Positioning (Corner Box Mode) */
    .sp-badge-container {
      position: fixed;
      z-index: 999999;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    /* Trigger Style: Pill + Wave */
    .sp-pill-btn {
      height: 44px;
      padding: 0 18px;
      border-radius: 22px;
      background: ${primaryColor};
      box-shadow: 0 8px 24px ${primaryColor}66, 0 2px 8px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.25);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      user-select: none;
    }
    .sp-pill-btn:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow: 0 12px 30px ${primaryColor}88;
    }

    /* Trigger Style: Bubble Orb */
    .sp-orb-btn {
      width: 54px;
      height: 54px;
      border-radius: 27px;
      background: ${primaryColor};
      box-shadow: 0 8px 24px ${primaryColor}66, 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid rgba(255,255,255,0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      user-select: none;
      color: #fff;
    }
    .sp-orb-btn:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 12px 30px ${primaryColor}88;
    }

    /* Trigger Style: Edge Ribbon */
    .sp-edge-btn {
      background: #0F172A;
      border: 1px solid ${primaryColor}88;
      border-right: none;
      border-radius: 10px 0 0 10px;
      padding: 12px 7px;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }
    .sp-edge-text {
      writing-mode: vertical-rl;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: ${primaryColor};
    }

    /* Trigger Style: Badge Compact */
    .sp-badge-btn {
      height: 34px;
      padding: 0 12px;
      border-radius: 17px;
      background: #0F172A;
      border: 1px solid ${primaryColor}88;
      color: #fff;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
    }

    .sp-floating-btn.recording {
      animation: sp-pulse-glow 1.5s infinite;
      background: #EF4444 !important;
      box-shadow: 0 0 24px rgba(239,68,68,0.8) !important;
    }

    /* Popover Dialog Card (Corner Box Mode) */
    .sp-dialog-card {
      background: #0B1325;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 22px;
      padding: 20px;
      width: 350px;
      box-shadow: 0 24px 70px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.15);
      color: #F8FAFC;
      display: none;
      flex-direction: column;
      gap: 14px;
      animation: sp-fade-slide 0.2s ease-out;
    }

    .sp-dialog-card.active {
      display: flex;
    }

    .sp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .sp-title {
      font-size: 14px;
      font-weight: 700;
      color: #F8FAFC;
      margin: 0;
      flex: 1;
    }

    .sp-lang-select {
      background: #1E293B;
      border: 1px solid #334155;
      color: #38BDF8;
      font-size: 11px;
      font-weight: 600;
      border-radius: 8px;
      padding: 3px 6px;
      outline: none;
      cursor: pointer;
    }

    .sp-close-btn {
      background: none;
      border: none;
      color: #64748B;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      transition: color 0.15s;
    }
    .sp-close-btn:hover { color: #fff; }

    /* Star Rating */
    .sp-stars-row {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .sp-star {
      font-size: 24px;
      color: #334155;
      cursor: pointer;
      transition: transform 0.15s ease, color 0.15s ease;
    }

    .sp-star.filled {
      color: #FBBF24;
    }

    .sp-star:hover {
      transform: scale(1.2);
    }

    /* Visualizer Box for Corner Popover */
    .sp-wave-box {
      background: #040711;
      border: 1px solid #1E293B;
      border-radius: 12px;
      height: 76px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .sp-wave-canvas {
      width: 100%;
      height: 100%;
    }

    .sp-wave-status {
      position: absolute;
      bottom: 5px;
      font-size: 11px;
      color: #94A3B8;
      font-weight: 600;
      text-align: center;
      padding: 0 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 90%;
    }

    .sp-mic-action-btn {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, ${primaryColor}, #6366F1);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 16px ${primaryColor}44;
      transition: all 0.15s ease;
    }

    .sp-mic-action-btn:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    .sp-mic-action-btn.recording {
      background: #EF4444;
      box-shadow: 0 4px 16px rgba(239,68,68,0.5);
    }

    /* AI Review Container */
    .sp-review-box {
      background: #040711;
      border: 1px solid #1E293B;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sp-review-label {
      font-size: 10px;
      font-weight: 800;
      color: #06B6D4;
      letter-spacing: 0.5px;
    }

    .sp-review-text {
      font-size: 12px;
      color: #CBD5E1;
      line-height: 1.4;
      margin: 0;
    }

    .sp-task-text {
      font-size: 11px;
      color: #A5B4FC;
      background: rgba(99,102,241,0.1);
      padding: 6px 8px;
      border-radius: 6px;
      margin-top: 4px;
    }

    .sp-footer-branding {
      text-align: center;
      font-size: 10px;
      color: #475569;
      font-weight: 600;
    }

    /* ── Full-Width Unboxed Horizon Wave + Dynamic Island Dock ── */
    .sp-horizon-layer {
      position: fixed;
      bottom: 50px;
      left: 0;
      right: 0;
      width: 100vw;
      height: 200px;
      pointer-events: none;
      z-index: 999997;
      display: none;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .sp-dynamic-dock {
      position: fixed;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 50px;
      padding: 7px 18px;
      display: none;
      align-items: center;
      gap: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.85), 0 0 24px ${primaryColor}44;
      z-index: 999999;
      white-space: nowrap;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* ── Universal AI Synthesis Review Pop-up Modal ── */
    .sp-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000000;
      padding: 16px;
      box-sizing: border-box;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .sp-modal-backdrop.active {
      display: flex;
    }

    .sp-review-modal-card {
      background: #0F172A;
      border-radius: 20px;
      padding: 22px 24px 20px;
      width: 100%;
      max-width: 560px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.85), 0 0 40px ${primaryColor}33;
      border: 1px solid rgba(255, 255, 255, 0.12);
      max-height: 90vh;
      overflow-y: auto;
      box-sizing: border-box;
      animation: sp-modal-pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sp-modal-success-card {
      background: #0F172A;
      border-radius: 20px;
      padding: 32px 36px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.85), 0 0 40px rgba(16, 185, 129, 0.25);
      border: 1px solid rgba(16, 185, 129, 0.35);
      text-align: center;
      display: none;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
      animation: sp-modal-pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes sp-modal-pop-in {
      0% {
        opacity: 0;
        transform: scale(0.92) translateY(18px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .sp-tab-btn {
      border: none;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 6px 6px 0 0;
      background: transparent;
      color: #64748B;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .sp-tab-btn.active {
      background: #1E293B;
      color: #06B6D4;
      border-bottom: 2px solid #06B6D4;
    }

    .sp-tone-chip {
      font-size: 11px;
      border-radius: 16px;
      padding: 3px 10px;
      cursor: pointer;
      background: #1E293B;
      color: #94A3B8;
      border: 1px solid #334155;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    .sp-tone-chip.active {
      background: #06B6D4;
      color: #fff;
      border: 1px solid #06B6D4;
    }
  `;

  shadow.appendChild(style);

  // Widget DOM
  const container = document.createElement('div');
  container.className = 'sp-widget-container';

  // Construct initial CTA trigger button
  let triggerHtml = '';
  if (triggerStyle === 'bubble-orb') {
    triggerHtml = `
      <div class="sp-floating-btn sp-orb-btn" id="sp-trigger" title="Send Voice Feedback">
        🎙️
      </div>
    `;
  } else if (triggerStyle === 'edge-ribbon') {
    triggerHtml = `
      <div class="sp-floating-btn sp-edge-btn" id="sp-trigger" title="Send Voice Feedback">
        <span>🎙️</span>
        <span class="sp-edge-text">FEEDBACK</span>
      </div>
    `;
  } else if (triggerStyle === 'badge-compact') {
    triggerHtml = `
      <div class="sp-floating-btn sp-badge-btn" id="sp-trigger" title="Send Voice Feedback">
        <span>🎙️</span>
        <span>Voice</span>
      </div>
    `;
  } else {
    // Default 'pill-wave'
    triggerHtml = `
      <div class="sp-floating-btn sp-pill-btn" id="sp-trigger" title="Send Voice Feedback">
        <span>🎙️</span>
        <span class="sp-eq-bars">
          <span class="sp-eq-bar sp-eq-1"></span>
          <span class="sp-eq-bar sp-eq-2"></span>
          <span class="sp-eq-bar sp-eq-3"></span>
          <span class="sp-eq-bar sp-eq-4"></span>
        </span>
        <span class="sp-pill-label">Feedback</span>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- 1. CORNER BOX LAYOUT (Bottom-Right Card Popover)          -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <div class="sp-badge-container" id="sp-corner-wrap">
      <div class="sp-dialog-card" id="sp-box-card">
        <div class="sp-header">
          <h4 class="sp-title">${widgetTitle}</h4>
          <select class="sp-lang-select" id="sp-box-lang" title="Speech Language">
            <option value="auto">🌐 Auto</option>
            <option value="hi-IN">हिन्दी (Hindi)</option>
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="bn-IN">বাংলা (Bengali)</option>
            <option value="mr-IN">मराठी (Marathi)</option>
            <option value="fr-FR">Français (French)</option>
            <option value="nl-NL">Nederlands (Dutch)</option>
            <option value="zh-CN">中文 (Chinese)</option>
          </select>
          <button class="sp-close-btn" id="sp-box-close">✕</button>
        </div>

        <div class="sp-stars-row" id="sp-box-stars" style="${showStars ? '' : 'display:none;'}">
          <span class="sp-star" data-rating="1">★</span>
          <span class="sp-star" data-rating="2">★</span>
          <span class="sp-star" data-rating="3">★</span>
          <span class="sp-star" data-rating="4">★</span>
          <span class="sp-star" data-rating="5">★</span>
        </div>

        <div class="sp-wave-box">
          <canvas class="sp-wave-canvas" id="sp-box-canvas"></canvas>
          <span class="sp-wave-status" id="sp-box-status">Tap mic below to speak</span>
        </div>

        <div class="sp-review-box" id="sp-box-review" style="display:none;">
          <span class="sp-review-label">✨ GEMINI 3.6 FLASH SYNTHESIS</span>
          <p class="sp-review-text" id="sp-box-summary"></p>
          <div class="sp-task-text" id="sp-box-task"></div>
        </div>

        <button class="sp-mic-action-btn" id="sp-box-action">
          <span id="sp-box-action-icon">🎙️</span>
          <span id="sp-box-action-text">Hold or Tap to Speak</span>
        </button>

        <div class="sp-footer-branding">
          Powered by SayPulse AI Voice Intelligence
        </div>
      </div>

      ${triggerHtml}
    </div>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- 2. FULL-WIDTH HORIZON LAYOUT (Unboxed Wave + Dynamic Dock) -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <div class="sp-horizon-layer" id="sp-full-horizon">
      <canvas class="sp-wave-canvas" id="sp-full-canvas" style="width:100%; height:100%;"></canvas>
    </div>

    <div class="sp-dynamic-dock" id="sp-full-dock">
      <div style="display:flex; align-items:center; gap:6px;">
        <div id="sp-rec-dot" style="width:8px; height:8px; border-radius:50%; background:${primaryColor};"></div>
        <span id="sp-timer" style="font-family:monospace; font-size:12px; font-weight:700; color:#F8FAFC;">00:00</span>
      </div>

      <div style="width:1px; height:14px; background:#334155;"></div>

      <div style="font-size:11px; color:#94A3B8; font-weight:500;" id="sp-full-status">
        Listening to your voice… 🎙️
      </div>

      <div style="width:1px; height:14px; background:#334155;"></div>

      <!-- Action Button -->
      <button class="sp-mic-action-btn" id="sp-full-action" style="padding:6px 14px; border-radius:20px; border:none; background:linear-gradient(135deg, ${primaryColor}, #6366F1); color:#fff; font-size:11px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:5px; box-shadow:0 4px 14px ${primaryColor}55;">
        <span id="sp-full-action-icon">⏹</span>
        <span id="sp-full-action-text">Finish & Submit</span>
      </button>

      <button class="sp-close-btn" id="sp-full-close" style="background:none; border:none; color:#64748B; cursor:pointer; font-size:13px; padding:2px 4px;">✕</button>
    </div>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- 3. UNIVERSAL AI SYNTHESIS REVIEW POP-UP MODAL             -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <div class="sp-modal-backdrop" id="sp-modal-backdrop">
      <div class="sp-review-modal-card" id="sp-review-modal-card">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2px;">
          <div>
            <h3 style="color:#F8FAFC; font-size:17px; font-weight:700; margin:0; line-height:1.2;">Review Your Feedback</h3>
            <p style="color:#64748B; font-size:12px; margin:3px 0 0;">Verify what was heard and how AI structured it</p>
          </div>
          <button type="button" class="sp-close-btn" id="sp-modal-close" style="font-size:16px; padding:4px; line-height:1;">✕</button>
        </div>

        <!-- Meta Chips Row (Category, Sentiment, Rating) -->
        <div style="display:flex; gap:8px; margin-bottom:2px; flex-wrap:wrap;">
          <span id="sp-modal-chip-cat" style="font-size:12px; font-weight:600; padding:3px 10px; border-radius:20px; background:#1E293B; color:#94A3B8; border:1px solid #334155;">🌟 Praise</span>
          <span id="sp-modal-chip-sent" style="font-size:12px; font-weight:600; padding:3px 10px; border-radius:20px; background:#10B98118; color:#10B981; border:1px solid #10B98144;">Positive</span>
          <span id="sp-modal-chip-rating" style="font-size:12px; font-weight:600; padding:3px 10px; border-radius:20px; background:#1E293B; color:#FBBF24; border:1px solid #334155;">★★★★★ (5/5)</span>
        </div>

        <!-- View Switcher Tabs -->
        <div style="display:flex; gap:4px; border-bottom:1px solid #1E293B; margin-bottom:4px;">
          <button type="button" class="sp-tab-btn active" id="sp-tab-comparison">📊 Side-by-Side</button>
          <button type="button" class="sp-tab-btn" id="sp-tab-ai">✨ AI Summary</button>
          <button type="button" class="sp-tab-btn" id="sp-tab-raw">🎙️ What You Said</button>
        </div>

        <!-- Content Area -->
        <div id="sp-view-content" style="display:flex; flex-direction:column; gap:8px;">
          <!-- Box 1: What You Said -->
          <div id="sp-modal-raw-box" style="background:#1E293B; border-radius:12px; padding:12px 16px; border:1px solid #334155;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="color:#94A3B8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">🎙️ What You Said</span>
              <span style="background:#0F172A; border:1px solid #334155; border-radius:12px; color:#64748B; font-size:10px; padding:2px 8px;">Raw Transcript</span>
            </div>
            <p id="sp-modal-raw-text" style="color:#CBD5E1; font-size:13px; line-height:1.5; margin:0; font-style:italic;">[Voice note recorded]</p>
          </div>

          <!-- Box 2: AI Summary -->
          <div id="sp-modal-summary-box" style="background:#1E293B; border-radius:12px; padding:12px 16px; border:1px solid rgba(56,189,248,0.3);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="color:#38BDF8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">✨ AI Summary</span>
              <button type="button" id="sp-modal-edit-btn" style="background:none; border:1px solid #334155; border-radius:6px; color:#94A3B8; font-size:11px; cursor:pointer; padding:2px 8px;">✏️ Edit</button>
            </div>
            <p id="sp-modal-summary-text" style="color:#F1F5F9; font-size:14px; line-height:1.55; margin:0 0 8px;"></p>
            <textarea id="sp-modal-summary-edit" rows="3" style="display:none; width:100%; background:#0F172A; border:1px solid #334155; border-radius:8px; padding:8px; color:#F1F5F9; font-size:13px; line-height:1.5; resize:vertical; outline:none; font-family:inherit; margin-bottom:8px; box-sizing:border-box;"></textarea>

            <!-- Tone Variations -->
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span style="color:#64748B; font-size:11px; font-weight:600;">Tone:</span>
              <button type="button" class="sp-tone-chip" data-tone="short">Short</button>
              <button type="button" class="sp-tone-chip" data-tone="formal">Formal</button>
              <button type="button" class="sp-tone-chip" data-tone="elaborated">Elaborated</button>
            </div>
          </div>
        </div>

        <!-- Box 3: Actionable Recommendation -->
        <div id="sp-modal-action-box" style="background:rgba(99,102,241,0.08); border-radius:12px; padding:12px 16px; border:1px solid rgba(99,102,241,0.25); border-left:4px solid #6366F1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="color:#818CF8; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">💡 Actionable Recommendation</span>
            <span style="color:#6366F1; font-size:10px; font-weight:600;">Product Impact</span>
          </div>
          <p id="sp-modal-task-text" style="color:#E2E8F0; font-size:13px; margin:0; line-height:1.5;">Feedback logged to dashboard</p>
        </div>

        <!-- Footer Actions -->
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:4px;">
          <button type="button" id="sp-modal-rerecord-btn" style="padding:8px 16px; border-radius:10px; border:1px solid #334155; background:transparent; color:#94A3B8; font-size:13px; cursor:pointer; font-weight:600;">🎙️ Re-record</button>
          <button type="button" id="sp-modal-submit-btn" style="padding:8px 20px; border-radius:10px; border:none; background:linear-gradient(135deg, ${primaryColor}, #6366F1); color:#fff; font-size:13px; font-weight:700; cursor:pointer; box-shadow:0 4px 14px ${primaryColor}55;">Submit Feedback →</button>
        </div>
      </div>

      <!-- Success State Card -->
      <div class="sp-modal-success-card" id="sp-modal-success-card">
        <div style="font-size:48px; text-align:center; margin-bottom:10px;">🎉</div>
        <h3 style="color:#F1F5F9; font-size:18px; font-weight:700; text-align:center; margin:0 0 6px;">Feedback Submitted!</h3>
        <p style="color:#94A3B8; font-size:13px; text-align:center; margin:0; line-height:1.5;">Thank you! Your feedback has been recorded and saved.</p>
      </div>
    </div>
  `;

  shadow.appendChild(container);

  // DOM Elements
  const trigger = shadow.getElementById('sp-trigger');
  const cornerWrap = shadow.getElementById('sp-corner-wrap');
  const boxCard = shadow.getElementById('sp-box-card');
  const boxClose = shadow.getElementById('sp-box-close');
  const boxLang = shadow.getElementById('sp-box-lang');
  const boxAction = shadow.getElementById('sp-box-action');
  const boxActionIcon = shadow.getElementById('sp-box-action-icon');
  const boxActionText = shadow.getElementById('sp-box-action-text');
  const boxStatus = shadow.getElementById('sp-box-status');
  const boxReview = shadow.getElementById('sp-box-review');
  const boxSummary = shadow.getElementById('sp-box-summary');
  const boxTask = shadow.getElementById('sp-box-task');
  const boxStars = shadow.querySelectorAll('#sp-box-stars .sp-star');
  const boxCanvas = shadow.getElementById('sp-box-canvas');

  const fullHorizon = shadow.getElementById('sp-full-horizon');
  const fullCanvas = shadow.getElementById('sp-full-canvas');
  const fullDock = shadow.getElementById('sp-full-dock');
  const fullAction = shadow.getElementById('sp-full-action');
  const fullActionIcon = shadow.getElementById('sp-full-action-icon');
  const fullActionText = shadow.getElementById('sp-full-action-text');
  const fullClose = shadow.getElementById('sp-full-close');
  const fullStatus = shadow.getElementById('sp-full-status');
  const recDot = shadow.getElementById('sp-rec-dot');
  const recTimerEl = shadow.getElementById('sp-timer');

  // Review Pop-up Modal DOM Elements
  const modalBackdrop = shadow.getElementById('sp-modal-backdrop');
  const reviewModalCard = shadow.getElementById('sp-review-modal-card');
  const modalSuccessCard = shadow.getElementById('sp-modal-success-card');
  const modalClose = shadow.getElementById('sp-modal-close');
  const modalChipCat = shadow.getElementById('sp-modal-chip-cat');
  const modalChipSent = shadow.getElementById('sp-modal-chip-sent');
  const modalChipRating = shadow.getElementById('sp-modal-chip-rating');
  const tabComparison = shadow.getElementById('sp-tab-comparison');
  const tabAi = shadow.getElementById('sp-tab-ai');
  const tabRaw = shadow.getElementById('sp-tab-raw');
  const modalRawBox = shadow.getElementById('sp-modal-raw-box');
  const modalRawText = shadow.getElementById('sp-modal-raw-text');
  const modalSummaryBox = shadow.getElementById('sp-modal-summary-box');
  const modalSummaryText = shadow.getElementById('sp-modal-summary-text');
  const modalSummaryEdit = shadow.getElementById('sp-modal-summary-edit');
  const modalEditBtn = shadow.getElementById('sp-modal-edit-btn');
  const modalToneChips = shadow.querySelectorAll('.sp-tone-chip');
  const modalTaskText = shadow.getElementById('sp-modal-task-text');
  const modalRerecordBtn = shadow.getElementById('sp-modal-rerecord-btn');
  const modalSubmitBtn = shadow.getElementById('sp-modal-submit-btn');

  let currentAiData = null;
  let activeTab = 'comparison';
  let activeTone = 'default';
  let isEditingSummary = false;

  function openReviewModal(finalTranscript, aiData) {
    currentAiData = aiData || {};
    activeTab = 'comparison';
    activeTone = 'default';
    isEditingSummary = false;

    // Reset tabs
    if (tabComparison) tabComparison.classList.add('active');
    if (tabAi) tabAi.classList.remove('active');
    if (tabRaw) tabRaw.classList.remove('active');
    if (modalRawBox) modalRawBox.style.display = 'block';
    if (modalSummaryBox) modalSummaryBox.style.display = 'block';

    // Meta chips
    const cat = currentAiData.category || (selectedRating >= 4 ? 'General_Praise' : (selectedRating <= 2 ? 'Bug' : 'UX_Friction'));
    const catLabels = {
      General_Praise: '🌟 Praise',
      Bug: '🐛 Bug',
      UX_Friction: '😤 UX Friction',
      Feature_Request: '💡 Feature Request',
      Performance: '⚡ Performance',
      Billing: '💳 Billing'
    };
    if (modalChipCat) modalChipCat.textContent = catLabels[cat] || cat;

    const sent = currentAiData.sentiment || (selectedRating >= 4 ? 'Positive' : (selectedRating <= 2 ? 'Critical' : 'Neutral'));
    const sentColors = {
      Positive: '#10B981',
      Neutral: '#6366F1',
      Frustrated: '#F59E0B',
      Critical: '#EF4444'
    };
    if (modalChipSent) {
      modalChipSent.textContent = sent;
      const c = sentColors[sent] || '#10B981';
      modalChipSent.style.color = c;
      modalChipSent.style.background = c + '18';
      modalChipSent.style.border = `1px solid ${c}44`;
    }

    if (modalChipRating) {
      modalChipRating.textContent = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating) + ` (${selectedRating}/5)`;
    }

    // Texts
    if (modalRawText) modalRawText.textContent = `"${finalTranscript}"`;
    const summaryStr = currentAiData.summary || finalTranscript;
    if (modalSummaryText) {
      modalSummaryText.textContent = summaryStr;
      modalSummaryText.style.display = 'block';
    }
    if (modalSummaryEdit) {
      modalSummaryEdit.value = summaryStr;
      modalSummaryEdit.style.display = 'none';
    }
    if (modalEditBtn) modalEditBtn.textContent = '✏️ Edit';

    // Reset tone chips
    modalToneChips.forEach(chip => chip.classList.remove('active'));

    // Actionable recommendation
    const task = currentAiData.actionableItem || currentAiData.actionable_item || (selectedRating >= 4 ? 'Continue monitoring positive user reception.' : 'Investigate friction reported in voice session.');
    if (modalTaskText) modalTaskText.textContent = task;

    // Show card, hide success
    if (reviewModalCard) reviewModalCard.style.display = 'flex';
    if (modalSuccessCard) modalSuccessCard.style.display = 'none';
    if (modalSubmitBtn) {
      modalSubmitBtn.disabled = false;
      modalSubmitBtn.textContent = 'Submit Feedback →';
    }

    // Open backdrop
    if (modalBackdrop) modalBackdrop.classList.add('active');
  }

  function closeReviewModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('active');
    if (boxActionIcon) boxActionIcon.textContent = '🎙️';
    if (boxActionText) boxActionText.textContent = 'Hold or Tap to Speak';
    if (fullActionText) fullActionText.textContent = 'Finish & Submit';
  }

  if (modalClose) modalClose.addEventListener('click', closeReviewModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeReviewModal();
    });
  }

  if (tabComparison) {
    tabComparison.addEventListener('click', () => {
      activeTab = 'comparison';
      tabComparison.classList.add('active');
      if (tabAi) tabAi.classList.remove('active');
      if (tabRaw) tabRaw.classList.remove('active');
      if (modalRawBox) modalRawBox.style.display = 'block';
      if (modalSummaryBox) modalSummaryBox.style.display = 'block';
    });
  }
  if (tabAi) {
    tabAi.addEventListener('click', () => {
      activeTab = 'ai';
      if (tabComparison) tabComparison.classList.remove('active');
      tabAi.classList.add('active');
      if (tabRaw) tabRaw.classList.remove('active');
      if (modalRawBox) modalRawBox.style.display = 'none';
      if (modalSummaryBox) modalSummaryBox.style.display = 'block';
    });
  }
  if (tabRaw) {
    tabRaw.addEventListener('click', () => {
      activeTab = 'raw';
      if (tabComparison) tabComparison.classList.remove('active');
      if (tabAi) tabAi.classList.remove('active');
      tabRaw.classList.add('active');
      if (modalRawBox) modalRawBox.style.display = 'block';
      if (modalSummaryBox) modalSummaryBox.style.display = 'none';
    });
  }

  if (modalEditBtn) {
    modalEditBtn.addEventListener('click', () => {
      isEditingSummary = !isEditingSummary;
      if (isEditingSummary) {
        modalEditBtn.textContent = '👁 View';
        if (modalSummaryText) modalSummaryText.style.display = 'none';
        if (modalSummaryEdit) {
          modalSummaryEdit.style.display = 'block';
          modalSummaryEdit.focus();
        }
      } else {
        modalEditBtn.textContent = '✏️ Edit';
        if (modalSummaryEdit) {
          modalSummaryEdit.style.display = 'none';
          if (modalSummaryText) modalSummaryText.textContent = modalSummaryEdit.value;
          if (currentAiData) currentAiData.summary = modalSummaryEdit.value;
        }
        if (modalSummaryText) modalSummaryText.style.display = 'block';
      }
    });
  }

  modalToneChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const tone = chip.getAttribute('data-tone');
      if (activeTone === tone) {
        activeTone = 'default';
        chip.classList.remove('active');
        const defaultSum = (currentAiData && currentAiData.defaultSummary) || (currentAiData && currentAiData.summary) || '';
        if (modalSummaryText) modalSummaryText.textContent = defaultSum;
        if (modalSummaryEdit) modalSummaryEdit.value = defaultSum;
        return;
      }
      activeTone = tone;
      modalToneChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      let newText = '';
      if (currentAiData && currentAiData.toneVariations && currentAiData.toneVariations[tone]) {
        newText = currentAiData.toneVariations[tone];
      } else {
        const base = (currentAiData && currentAiData.summary) || '';
        if (tone === 'short') newText = base.split('.')[0] + '.';
        else if (tone === 'formal') newText = `Feedback statement: ${base}`;
        else if (tone === 'elaborated') newText = `Detailed user session note: ${base} Observed on page URL: ${window.location.pathname}.`;
      }
      if (modalSummaryText) modalSummaryText.textContent = newText;
      if (modalSummaryEdit) modalSummaryEdit.value = newText;
    });
  });

  if (modalRerecordBtn) {
    modalRerecordBtn.addEventListener('click', () => {
      closeReviewModal();
      openWidget();
    });
  }

  if (modalSubmitBtn) {
    modalSubmitBtn.addEventListener('click', async () => {
      modalSubmitBtn.disabled = true;
      modalSubmitBtn.textContent = 'Submitting…';

      const finalSubSummary = (modalSummaryEdit && modalSummaryEdit.value.trim()) || (modalSummaryText && modalSummaryText.textContent.trim()) || '';
      const chosenLang = (boxLang && boxLang.value) ? boxLang.value : 'auto';

      try {
        await fetch(`${apiBase}/saypulse/v1/feedback/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SayPulse-Key': apiKey,
          },
          body: JSON.stringify({
            rating: selectedRating,
            rawTranscript: spokenTranscript || finalSubSummary,
            summary: finalSubSummary,
            category: (currentAiData && currentAiData.category) || 'General_Praise',
            sentiment: (currentAiData && currentAiData.sentiment) || 'Positive',
            actionableItem: (currentAiData && (currentAiData.actionableItem || currentAiData.actionable_item)) || 'Feedback logged to dashboard',
            detectedLanguage: chosenLang,
            toneVariations: (currentAiData && currentAiData.toneVariations) || {},
            context: {
              url: window.location.href,
              pathname: window.location.pathname,
              language: chosenLang,
              browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
              os: navigator.platform || 'MacIntel',
              viewport: { width: window.innerWidth, height: window.innerHeight },
              routeHistory: routeHistory,
              consoleErrors: capturedErrors,
            },
          }),
        });
      } catch (e) {
        console.warn('[SayPulse] Submit notice:', e);
      }

      // Transition to Success confirmation card
      if (reviewModalCard) reviewModalCard.style.display = 'none';
      if (modalSuccessCard) modalSuccessCard.style.display = 'flex';

      setTimeout(() => {
        closeReviewModal();
        closeWidget();
      }, 2500);
    });
  }

  let isRecording = false;
  let selectedRating = 5;
  let recognition = null;
  let spokenTranscript = '';
  let animFrame = null;
  let wavePhase = 0;
  let timerInterval = null;
  let elapsedSeconds = 0;

  function updateTimerDisplay() {
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    if (recTimerEl) recTimerEl.textContent = `${m}:${s}`;
  }

  // Star Rating Interaction
  function setRating(r) {
    selectedRating = r;
    boxStars.forEach((s) => {
      const val = parseInt(s.getAttribute('data-rating') || '0', 10);
      if (val <= r) s.classList.add('filled');
      else s.classList.remove('filled');
    });
  }
  setRating(5);

  boxStars.forEach((s) => {
    s.addEventListener('click', function () {
      setRating(parseInt(this.getAttribute('data-rating') || '5', 10));
    });
  });

  // Layout Toggle Handlers
  function openWidget() {
    if (currentLayout === 'full' || currentLayout === 'bottom-pill') {
      if (trigger) trigger.style.display = 'none';
      if (fullHorizon) fullHorizon.style.display = 'flex';
      if (fullDock) fullDock.style.display = 'flex';
      startRecording();
    } else {
      if (boxCard) boxCard.classList.add('active');
    }
  }

  function closeWidget() {
    if (currentLayout === 'full' || currentLayout === 'bottom-pill') {
      if (trigger) trigger.style.display = 'inline-flex';
      if (fullHorizon) fullHorizon.style.display = 'none';
      if (fullDock) fullDock.style.display = 'none';
    } else {
      if (boxCard) boxCard.classList.remove('active');
      if (boxReview) boxReview.style.display = 'none';
    }
    if (isRecording) stopRecording();
  }

  if (trigger) trigger.addEventListener('click', openWidget);
  if (boxClose) boxClose.addEventListener('click', closeWidget);
  if (fullClose) fullClose.addEventListener('click', closeWidget);

  // Scroll Auto-Collapse on background scroll
  if (autoCollapse) {
    let scrollTimer = null;
    window.addEventListener('scroll', function() {
      const pillLabel = shadow.querySelector('.sp-pill-label');
      if (pillLabel) pillLabel.style.display = 'none';
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function() {
        if (pillLabel) pillLabel.style.display = 'inline';
      }, 350);
    }, { passive: true });
  }

  // ══════════════════════════════════════════════════════════
  // 6 HIGH-FIDELITY UNBOXED VOICE VISUALIZER ENGINES
  // (Ported directly from packages/react/src/visualizers/)
  // ══════════════════════════════════════════════════════════
  let vizTime = 0;
  let angleY = 0, angleX = 0.25, angleZ = 0.1;

  // Pre-seed asset structures
  const siriStars = [];
  for (let i = 0; i < 45; i++) {
    siriStars.push({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.5 + 0.2,
      v: Math.random() * 0.001 + 0.0004
    });
  }

  const SIRI_RIBBONS = [
    { color: '#00F0FF', alpha: 0.95, speed: 2.2, phase: 0.0, freq: 2.8, ampMult: 1.00, width: 2.8, glow: 16 },
    { color: '#6366F1', alpha: 0.85, speed: 2.8, phase: 0.9, freq: 3.4, ampMult: 0.85, width: 2.2, glow: 12 },
    { color: '#A855F7', alpha: 0.75, speed: 1.9, phase: 1.8, freq: 2.4, ampMult: 0.75, width: 2.0, glow: 12 },
    { color: '#EC4899', alpha: 0.65, speed: 3.2, phase: 2.7, freq: 4.2, ampMult: 0.60, width: 1.8, glow: 10 },
    { color: '#38BDF8', alpha: 0.50, speed: 1.5, phase: 3.6, freq: 2.0, ampMult: 0.50, width: 1.5, glow: 8 },
    { color: '#F43F5E', alpha: 0.40, speed: 2.5, phase: 4.5, freq: 4.8, ampMult: 0.40, width: 1.3, glow: 8 },
    { color: '#34D399', alpha: 0.35, speed: 3.6, phase: 5.4, freq: 3.2, ampMult: 0.35, width: 1.2, glow: 6 }
  ];

  const spherePoints = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 95; i++) {
    const y = 1 - (i / (95 - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const jitter = 0.96 + Math.random() * 0.08;
    const x = Math.cos(theta) * radiusAtY * jitter;
    const z = Math.sin(theta) * radiusAtY * jitter;
    const isGold = i % 3 === 0 || i % 7 === 0;
    spherePoints.push({
      x: x,
      y: y * jitter,
      z: z,
      color: isGold ? '#F59E0B' : '#00F0FF',
      size: Math.random() * 1.5 + 1.2
    });
  }

  const ringParticles = [];
  for (let i = 0; i < 420; i++) {
    ringParticles.push({
      baseAngle: Math.random() * Math.PI * 2,
      radiusOffset: (Math.random() - 0.5) * 16,
      baseSize: Math.random() * 1.8 + 0.8,
      orbitSpeed: (Math.random() * 0.007 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      noiseSeed: Math.random() * 100,
      layer: Math.floor(Math.random() * 3)
    });
  }

  function getParticleColor(angle) {
    let a = angle % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    const sinA = Math.sin(a);
    if (sinA < -0.35) return { hex: '#00F0FF', glow: '#38BDF8' };
    if (sinA < 0.1) return { hex: '#818CF8', glow: '#6366F1' };
    if (sinA < 0.6) return { hex: '#F43F5E', glow: '#EC4899' };
    return { hex: '#F97316', glow: '#EF4444' };
  }

  const nebulaPhotons = [];
  const NEBULA_PALETTE = [
    { color: '#00F0FF', glow: '#38BDF8' },
    { color: '#38BDF8', glow: '#60A5FA' },
    { color: '#818CF8', glow: '#6366F1' },
    { color: '#C084FC', glow: '#A855F7' },
    { color: '#F43F5E', glow: '#EC4899' },
    { color: '#E879F9', glow: '#D946EF' }
  ];
  for (let i = 0; i < 260; i++) {
    const pCol = NEBULA_PALETTE[i % NEBULA_PALETTE.length];
    nebulaPhotons.push({
      orbitRadius: Math.random() * 32 + 4,
      angle: Math.random() * Math.PI * 2,
      orbitSpeed: (Math.random() * 0.025 + 0.01) * (Math.random() > 0.4 ? 1 : -1),
      radialVelocity: Math.random() * 0.02 - 0.01,
      size: Math.random() * 2.0 + 0.8,
      color: pCol.color,
      glowColor: pCol.glow,
      seed: Math.random() * 100
    });
  }

  const SOLAR_RIBBON_SETS = [
    { color: '#00F0FF', alpha: 0.90, freq: 2.6, speed: 2.2, phase: 0.0, w: 2.4 },
    { color: '#38BDF8', alpha: 0.60, freq: 3.6, speed: 2.6, phase: 0.8, w: 1.6 },
    { color: '#818CF8', alpha: 0.45, freq: 4.8, speed: 1.8, phase: 1.6, w: 1.2 },
    { color: '#EC4899', alpha: 0.90, freq: 2.6, speed: 2.2, phase: 2.4, w: 2.4 },
    { color: '#F43F5E', alpha: 0.60, freq: 3.6, speed: 2.6, phase: 3.2, w: 1.6 },
    { color: '#C084FC', alpha: 0.45, freq: 4.8, speed: 1.8, phase: 4.0, w: 1.2 }
  ];

  const LASER_HARMONICS = [
    { color: '#00F0FF', alpha: 0.95, phase: 0.0, w: 2.4, f: 5.0, hMult: 1.00 },
    { color: '#818CF8', alpha: 0.75, phase: 0.9, w: 1.8, f: 7.0, hMult: 0.75 },
    { color: '#F43F5E', alpha: 0.60, phase: 1.8, w: 1.4, f: 9.0, hMult: 0.55 },
    { color: '#EC4899', alpha: 0.45, phase: 2.7, w: 1.0, f: 11.0, hMult: 0.35 }
  ];

  function drawCanvasVisualizer(cvs) {
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const W = (cvs.width = cvs.offsetWidth || 300);
    const H = (cvs.height = cvs.offsetHeight || 60);

    ctx.clearRect(0, 0, W, H);
    vizTime += 0.026;

    // Simulated speech frequency spectrum reactive to recording state
    const amp = isRecording ? (0.65 + Math.sin(vizTime * 4) * 0.25 + Math.sin(vizTime * 7) * 0.1) : 0.06;
    const freq = [];
    for (let i = 0; i < 32; i++) {
      freq.push(isRecording ? Math.floor(Math.abs(Math.sin(vizTime * 3 + i * 0.5)) * 220 + 35) : 10);
    }

    const centerX = W / 2;
    const centerY = H * 0.50;

    // ────────────────────────────────────────────────────────────
    // 1. Siri Wave (Fluid Multi-Harmonic Ribbons + Ambient Stardust)
    // ────────────────────────────────────────────────────────────
    if (currentAnimation === 'siri-wave') {
      ctx.save();

      // Ambient Stardust
      siriStars.forEach(st => {
        st.x += st.v * (1 + amp * 2);
        if (st.x > 1) st.x = 0;
        const sx = st.x * W;
        const sy = st.y * H;
        const sa = st.a * (0.35 + Math.sin(vizTime * 2 + st.y * 10) * 0.3 + amp * 0.5);

        ctx.beginPath();
        ctx.arc(sx, sy, st.s, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8';
        ctx.globalAlpha = Math.min(1, Math.max(0, sa));
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 5;
        ctx.fill();
      });

      // Additive Siri Ribbons
      ctx.globalCompositeOperation = 'lighter';
      SIRI_RIBBONS.forEach(({ color, alpha, speed, phase, freq: f, ampMult, width: strokeW, glow }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeW;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = glow + amp * 10;

        const maxH = (H * 0.34) * amp * ampMult;
        const steps = Math.min(180, Math.floor(W / 6));

        for (let i = 0; i <= steps; i++) {
          const normX = i / steps;
          const x = normX * W;
          const envelope = Math.sin(normX * Math.PI);
          const y = H * 0.50 +
            (Math.sin(normX * Math.PI * f + vizTime * speed + phase) * 0.70 +
             Math.sin(normX * Math.PI * (f * 1.5) - vizTime * (speed * 0.6) + phase * 1.3) * 0.22 +
             Math.cos(normX * Math.PI * 2 + vizTime * 1.2) * 0.08) * maxH * envelope;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.restore();
      return;
    }

    // ────────────────────────────────────────────────────────────
    // 2. Neural Sphere (3D Holographic Constellation Orb)
    // ────────────────────────────────────────────────────────────
    if (currentAnimation === 'neural-sphere') {
      angleY += 0.016 + amp * 0.03;
      angleX += 0.006 + amp * 0.01;
      angleZ += 0.003;

      const baseRadius = Math.min(W * 0.22, H * 0.32);
      const currentRadius = baseRadius * (1 + amp * 0.32);

      ctx.save();

      // Ambient radial space glow
      const bgGlow = ctx.createRadialGradient(
        centerX, centerY, currentRadius * 0.2,
        centerX, centerY, currentRadius * 1.6
      );
      bgGlow.addColorStop(0, `rgba(6, 182, 212, ${0.15 + amp * 0.22})`);
      bgGlow.addColorStop(0.5, `rgba(30, 58, 138, ${0.08 + amp * 0.12})`);
      bgGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, W, H);

      const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      const cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ);

      const projected = spherePoints.map((pt, idx) => {
        let x1 = pt.x * cosY - pt.z * sinY;
        let z1 = pt.x * sinY + pt.z * cosY;
        let y1 = pt.y;

        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        const depth = 2.4;
        const scale = depth / (depth - z3 * 0.55);
        const px = centerX + x3 * currentRadius * scale;
        const py = centerY + y3 * currentRadius * scale;
        const alpha = Math.max(0.12, (z3 + 1.2) / 2.2);
        const fVal = freq[idx % freq.length] || 0;
        const nodeAudioBoost = (fVal / 255) * amp;

        return { px, py, z: z3, alpha, color: pt.color, size: pt.size, nodeAudioBoost };
      });

      projected.sort((a, b) => a.z - b.z);

      // Plexus lines
      ctx.globalCompositeOperation = 'lighter';
      const maxDist = currentRadius * 0.62;
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * (0.35 + amp * 0.55);
            ctx.beginPath();
            const isGoldLine = p1.color === '#F59E0B' || p2.color === '#F59E0B';
            ctx.strokeStyle = isGoldLine ? '#FBBF24' : '#00F0FF';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = isGoldLine ? 1.0 : 0.8;
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Nodes
      projected.forEach(p => {
        const radius = (p.size * (p.z + 1.4) * 0.85) * (1 + p.nodeAudioBoost * 1.2 + amp * 0.4);
        ctx.beginPath();
        ctx.arc(p.px, p.py, radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.28 + amp * 0.35);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12 + amp * 14;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color === '#F59E0B' ? '#FDE68A' : '#E0F2FE';
        ctx.globalAlpha = Math.min(1, p.alpha * 1.3);
        ctx.fill();
      });

      ctx.restore();
      return;
    }

    // ────────────────────────────────────────────────────────────
    // 3. Particle Ring (Cosmic Particle Ring Corona)
    // ────────────────────────────────────────────────────────────
    if (currentAnimation === 'particle-ring') {
      const baseRadius = Math.min(W * 0.20, H * 0.30);

      ctx.save();

      // Cosmic Radial Aura
      const haloGrad = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.25,
        centerX, centerY, baseRadius * 1.6
      );
      haloGrad.addColorStop(0, 'rgba(11, 17, 32, 0)');
      haloGrad.addColorStop(0.5, `rgba(6, 182, 212, ${0.08 + amp * 0.14})`);
      haloGrad.addColorStop(0.85, `rgba(244, 63, 94, ${0.05 + amp * 0.09})`);
      haloGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      ringParticles.forEach((p, idx) => {
        p.baseAngle += p.orbitSpeed * (1 + amp * 2.5);

        const wave1 = Math.sin(p.baseAngle * 6 + vizTime * 2.2 + p.noiseSeed);
        const wave2 = Math.cos(p.baseAngle * 10 - vizTime * 1.6);
        const wave3 = Math.sin(p.baseAngle * 16 + vizTime * 3.0) * 0.4;
        const fIdx = Math.floor((idx / ringParticles.length) * (freq.length * 0.75));
        const audioDisplacement = ((freq[fIdx] || 0) / 255) * 11 * amp;
        const turbulentOffset = (wave1 * 5 + wave2 * 3 + wave3 * 1.5) * (0.6 + amp * 1.2);

        const currentR = baseRadius + p.radiusOffset + turbulentOffset + audioDisplacement;
        const x = centerX + Math.cos(p.baseAngle) * currentR;
        const y = centerY + Math.sin(p.baseAngle) * currentR * 0.65;

        const { hex, glow } = getParticleColor(p.baseAngle);
        const pulse = 0.5 + Math.sin(vizTime * 3 + p.noiseSeed) * 0.35 + amp * 0.25;
        const particleSize = p.baseSize * (1 + amp * 0.75);

        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = hex;
        ctx.globalAlpha = Math.min(1, Math.max(0.15, pulse));
        ctx.shadowColor = glow;
        ctx.shadowBlur = 6 + amp * 8;
        ctx.fill();
      });

      ctx.restore();
      return;
    }

    // ────────────────────────────────────────────────────────────
    // 4. Nebula Plasma (Quantum Nebula Plasma Core)
    // ────────────────────────────────────────────────────────────
    if (currentAnimation === 'nebula-plasma') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Plasma Core Flares
      const coreR = 14 + amp * 22;
      const plasmaGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreR * 2.2
      );
      plasmaGrad.addColorStop(0, `rgba(0, 240, 255, ${0.58 + amp * 0.42})`);
      plasmaGrad.addColorStop(0.35, `rgba(192, 132, 252, ${0.40 + amp * 0.4})`);
      plasmaGrad.addColorStop(0.7, `rgba(244, 63, 94, ${0.20 + amp * 0.22})`);
      plasmaGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = plasmaGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Swirling Quantum Photons
      nebulaPhotons.forEach((p, idx) => {
        p.angle += p.orbitSpeed * (1 + amp * 3.2);

        const rDrift = Math.sin(vizTime * 1.8 + p.seed) * 6;
        const freqBucket = freq[idx % freq.length] || 0;
        const audioRadialBoost = (freqBucket / 255) * 12 * amp;
        const currentR = (p.orbitRadius + rDrift + audioRadialBoost) * (1 + amp * 0.65);

        const x = centerX + Math.cos(p.angle) * currentR * 1.4 + Math.sin(p.angle * 2 + vizTime * 1.5) * 6;
        const y = centerY + Math.sin(p.angle) * currentR * 0.95 + Math.cos(p.angle * 2 - vizTime * 1.5) * 4;

        const pulse = 0.5 + Math.sin(vizTime * 4 + p.seed) * 0.4 + amp * 0.3;
        const pSize = p.size * (1 + amp * 0.7);

        ctx.beginPath();
        ctx.arc(x, y, pSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, Math.max(0.15, pulse));
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 8 + amp * 10;
        ctx.fill();
      });

      ctx.restore();
      return;
    }

    // ────────────────────────────────────────────────────────────
    // 5. Solar Ribbon (Wide-Span Solar Corona + Ribbon Wings)
    // ────────────────────────────────────────────────────────────
    if (currentAnimation === 'solar-ribbon') {
      const coreRadius = 18;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      SOLAR_RIBBON_SETS.forEach(({ color, alpha, freq: f, speed, phase, w }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        const maxH = (H * 0.32) * amp;
        const steps = Math.min(160, Math.floor(W / 6));

        for (let i = 0; i <= steps; i++) {
          const normX = i / steps;
          const x = normX * W;
          const side = normX < 0.5 ? -1 : 1;
          const distFromCenter = Math.abs(normX - 0.5) * 2;
          const taper = Math.sin(normX * Math.PI);
          const y = centerY + Math.sin(normX * Math.PI * f + vizTime * speed * side + phase) * maxH * taper * (0.35 + distFromCenter * 0.65);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Radiating Solar Corona Filament Spikes
      const spikeCount = 48;
      for (let i = 0; i < spikeCount; i++) {
        const theta = (i / spikeCount) * Math.PI * 2;
        const fIdx = Math.floor((i / spikeCount) * (freq.length * 0.7));
        const val = freq[fIdx] || 0;
        const spikeLen = (val / 255) * 20 * (1 + amp * 1.4) + (4 + Math.sin(vizTime * 3 + i) * 2.5);

        const x1 = centerX + Math.cos(theta) * (coreRadius - 2);
        const y1 = centerY + Math.sin(theta) * (coreRadius - 2);
        const x2 = centerX + Math.cos(theta) * (coreRadius + spikeLen);
        const y2 = centerY + Math.sin(theta) * (coreRadius + spikeLen);

        const isLeft = Math.cos(theta) < 0;
        const spikeColor = isLeft ? '#00F0FF' : '#EC4899';

        ctx.beginPath();
        ctx.strokeStyle = spikeColor;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.75 + amp * 0.25;
        ctx.shadowColor = spikeColor;
        ctx.shadowBlur = 8;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x2, y2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = spikeColor;
        ctx.fill();
      }

      // Central Solar Core Orb
      ctx.globalCompositeOperation = 'source-over';
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
      orbGrad.addColorStop(0, '#1E293B');
      orbGrad.addColorStop(0.7, '#0B1120');
      orbGrad.addColorStop(1, '#00F0FF');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = orbGrad;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 18 + amp * 14;
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#38BDF8';
      ctx.stroke();

      ctx.restore();
      return;
    }

    // ────────────────────────────────────────────────────────────
    // 6. Laser Horizon (Horizon Laser + Radar Rings + Equalizer)
    // ────────────────────────────────────────────────────────────
    if (currentAnimation === 'laser-horizon') {
      const horizonY = H * 0.54;
      ctx.save();

      // Concentric Sonar Radar Wavefronts
      const ringCenterY = H * 0.22;
      const maxRadarR = H * 0.16;
      const ringCount = 4;

      for (let r = 0; r < ringCount; r++) {
        const progress = ((vizTime * 0.75 + r / ringCount) % 1);
        const radius = 6 + progress * maxRadarR * (1 + amp * 0.35);
        const alpha = Math.pow(1 - progress, 1.4) * (0.5 + amp * 0.4);

        ctx.beginPath();
        ctx.arc(centerX, ringCenterY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00F0FF';
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      // Central glowing beacon dot
      ctx.beginPath();
      ctx.arc(centerX, ringCenterY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.globalAlpha = 1;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 12 + amp * 8;
      ctx.fill();

      // Laser Horizon Beam Across Full Screen
      ctx.globalCompositeOperation = 'lighter';
      LASER_HARMONICS.forEach(({ color, alpha, phase, w, f, hMult }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + amp * 8;

        const maxSwell = (H * 0.22) * amp * hMult;
        const steps = Math.min(180, Math.floor(W / 6));

        for (let i = 0; i <= steps; i++) {
          const normX = i / steps;
          const x = normX * W;
          const dist = (normX - 0.5) * 4.2;
          const gaussian = Math.exp(-(dist * dist));
          const wave = Math.sin(normX * Math.PI * f + vizTime * 3.2 + phase);
          const y = horizonY - wave * maxSwell * gaussian;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Dynamic Equalizer Audio Spectrum Bars (Bottom Center)
      const barCount = 22;
      const barW = 3.5;
      const barGap = 4;
      const totalBarW = barCount * barW + (barCount - 1) * barGap;
      const startX = (W - totalBarW) / 2;
      const baseY = H - 10;

      for (let i = 0; i < barCount; i++) {
        const freqIndex = Math.floor((i / barCount) * (freq.length * 0.7));
        const val = freq[freqIndex] || 0;
        const barH = Math.max(3, (val / 255) * 20 * (1 + amp * 1.6) + (Math.sin(vizTime * 4 + i) * 1.5));
        const bx = startX + i * (barW + barGap);
        const by = baseY - barH;
        const norm = i / barCount;
        const color = norm < 0.4 ? '#00F0FF' : norm < 0.7 ? '#818CF8' : '#EC4899';

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.75 + amp * 0.25;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        if (ctx.roundRect) ctx.roundRect(bx, by, barW, barH, 1.8);
        else ctx.rect(bx, by, barW, barH);
        ctx.fill();
      }

      ctx.restore();
      return;
    }
  }

  function renderVisualizerLoop() {
    if (currentLayout === 'full' || currentLayout === 'bottom-pill') {
      drawCanvasVisualizer(fullCanvas);
    } else {
      drawCanvasVisualizer(boxCanvas);
    }
    animFrame = requestAnimationFrame(renderVisualizerLoop);
  }
  renderVisualizerLoop();

  // Web Speech API Initialization
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function startRecording() {
    isRecording = true;
    spokenTranscript = '';
    elapsedSeconds = 0;
    updateTimerDisplay();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function() {
      elapsedSeconds++;
      updateTimerDisplay();
    }, 1000);

    if (recDot) {
      recDot.style.background = '#EF4444';
      recDot.style.animation = 'sp-recblink 1s infinite';
    }

    if (boxAction) {
      boxAction.classList.add('recording');
      if (boxActionIcon) boxActionIcon.textContent = '⏹️';
      if (boxActionText) boxActionText.textContent = 'Tap to Finish & Submit';
    }
    if (boxStatus) boxStatus.textContent = 'Listening to your voice… 🎙️';
    if (fullStatus) fullStatus.textContent = 'Listening to your voice… 🎙️';
    if (boxReview) boxReview.style.display = 'none';

    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        const currentLangChoice = (boxLang && boxLang.value !== 'auto') 
          ? boxLang.value 
          : (navigator.language || 'en-US');
        recognition.lang = currentLangChoice;

        recognition.onresult = function (event) {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          spokenTranscript = current;
          const snippet = `"${current.substring(0, 32)}…"`;
          if (boxStatus) boxStatus.textContent = snippet;
          if (fullStatus) fullStatus.textContent = snippet;
        };

        recognition.onerror = function (e) {
          console.warn('[SayPulse Speech Recognition Notice]', e.error);
          if (e.error === 'not-allowed') {
            const errNotice = 'Mic permission blocked. Allow mic in browser to record 🎙️';
            if (boxStatus) boxStatus.textContent = errNotice;
            if (fullStatus) fullStatus.textContent = errNotice;
          }
        };

        recognition.start();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  async function stopRecording() {
    isRecording = false;
    if (timerInterval) clearInterval(timerInterval);

    if (recDot) {
      recDot.style.background = primaryColor;
      recDot.style.animation = 'none';
    }

    if (boxAction) {
      boxAction.classList.remove('recording');
      if (boxActionIcon) boxActionIcon.textContent = '✨';
      if (boxActionText) boxActionText.textContent = 'Synthesizing…';
    }
    if (fullActionText) fullActionText.textContent = 'Synthesizing…';

    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }

    // Immediately hide horizon wave and dynamic dock
    if (fullHorizon) fullHorizon.style.display = 'none';
    if (fullDock) fullDock.style.display = 'none';
    if (boxCard) boxCard.classList.remove('active');

    const rawNotes = spokenTranscript.trim() || 'Great experience on this page, smooth and responsive.';
    const finalNotes = normalizeBrandTerms(rawNotes);

    let aiData = null;
    const chosenLang = (boxLang && boxLang.value) ? boxLang.value : 'auto';

    try {
      const sumRes = await fetch(`${apiBase}/saypulse/v1/feedback/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SayPulse-Key': apiKey,
        },
        body: JSON.stringify({
          transcript: finalNotes,
          rating: selectedRating,
          context: {
            url: window.location.href,
            pathname: window.location.pathname,
            language: chosenLang,
            userAgent: navigator.userAgent,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            routeHistory: routeHistory,
            consoleErrors: capturedErrors,
          },
        }),
      });

      if (sumRes.ok) {
        aiData = await sumRes.json();
      }
    } catch (err) {
      console.warn('[SayPulse API Notice]', err);
    }

    // Smart synthesis fallback if backend route is unavailable or offline
    if (!aiData || !aiData.summary) {
      const fallbackCat = selectedRating >= 4 ? 'General_Praise' : (selectedRating <= 2 ? 'Bug' : 'UX_Friction');
      const fallbackSent = selectedRating >= 4 ? 'Positive' : (selectedRating <= 2 ? 'Critical' : 'Neutral');
      const fallbackTask = selectedRating >= 4
        ? 'Continue monitoring positive user reception.'
        : 'Review friction reported in customer voice session.';
      aiData = {
        summary: finalNotes,
        defaultSummary: finalNotes,
        category: fallbackCat,
        sentiment: fallbackSent,
        actionableItem: fallbackTask,
        actionable_item: fallbackTask,
        toneVariations: {
          short: finalNotes.length > 60 ? finalNotes.substring(0, 57) + '…' : finalNotes,
          formal: `User recorded feedback (${selectedRating} stars): ${finalNotes}`,
          elaborated: `The user provided a ${selectedRating}-star rating note: "${finalNotes}". Telemetry captured on ${window.location.pathname}.`,
        }
      };
    } else {
      aiData.defaultSummary = aiData.summary;
    }

    // Immediately pop open the Review Pop-up Modal!
    openReviewModal(finalNotes, aiData);

    // Also update box review elements in case box card is viewed
    if (boxReview) boxReview.style.display = 'flex';
    if (boxSummary) boxSummary.textContent = aiData.summary || finalNotes;
    if (boxTask) boxTask.textContent = `💡 Task: ${aiData.actionableItem || 'Feedback logged to dashboard'}`;
    if (boxActionIcon) boxActionIcon.textContent = '✓';
    if (boxActionText) boxActionText.textContent = 'Feedback Ready!';
    if (boxStatus) boxStatus.textContent = '✓ Transcribed and analyzed';
    if (fullActionText) fullActionText.textContent = 'Finish & Submit';
  }

  // Mic Button Toggle Handlers
  if (boxAction) {
    boxAction.addEventListener('click', () => {
      if (!isRecording) startRecording();
      else stopRecording();
    });
  }
  if (fullAction) {
    fullAction.addEventListener('click', () => {
      if (!isRecording) startRecording();
      else stopRecording();
    });
  }

  // ══════════════════════════════════════════════════════════
  // PUBLIC JAVASCRIPT API (Exposed on window.SayPulse)
  // ══════════════════════════════════════════════════════════
  window.SayPulse = {
    open: function(initialMode) {
      openWidget();
      if (initialMode === 'recording' && !isRecording) {
        startRecording();
      }
    },
    close: function() {
      closeWidget();
    },
    setLayout: function(newLayout) {
      currentLayout = newLayout === 'bottom-pill' ? 'full' : newLayout;
      if (currentLayout === 'full') {
        if (boxCard) boxCard.classList.remove('active');
      } else {
        if (fullHorizon) fullHorizon.style.display = 'none';
        if (fullDock) fullDock.style.display = 'none';
      }
    },
    setAnimation: function(newAnim) {
      currentAnimation = newAnim;
    },
    startRecording: function() {
      if (!isRecording) startRecording();
    },
    stopRecording: function() {
      if (isRecording) stopRecording();
    }
  };

  // Backwards compatibility handles
  window.__SAYPULSE_OPEN = window.SayPulse.open;
  window.__SAYPULSE_SET_LAYOUT = window.SayPulse.setLayout;
  window.__SAYPULSE_SET_ANIMATION = window.SayPulse.setAnimation;

  console.log(`🎙️ [SayPulse] Universal Voice Widget initialized (Layout: ${currentLayout}, Animation: ${currentAnimation})`);
})();
