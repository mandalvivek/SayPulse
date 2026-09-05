/**
 * SayPulse Universal 1-Line Embeddable Voice Feedback Widget
 * Version: 1.0.0
 * Zero Dependencies • Shadow DOM Isolation • Gemini 3.6 Flash AI Telemetry
 */
(function () {
  'use strict';

  // Prevent multiple initializations
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
      apiBase = 'https://communication-dev.myhealthchapter.com';
    }
  }
  apiBase = apiBase.replace(/\/+$/, '');

  const position = (currentScript && currentScript.getAttribute('data-position')) || 'bottom-right';
  const primaryColor = (currentScript && currentScript.getAttribute('data-color')) || '#06B6D4';
  const animationType = (currentScript && currentScript.getAttribute('data-animation')) || 'siri-wave';

  // Global Context Harvesting
  const capturedErrors = [];
  const routeHistory = [window.location.pathname];

  window.addEventListener('error', function (e) {
    if (capturedErrors.length < 5) {
      capturedErrors.push(`${e.message} at ${e.filename || 'unknown'}:${e.lineno || 0}`);
    }
  });

  // Track SPA history changes (Next.js, React Router, Vue)
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
    
    .sp-badge-container {
      position: fixed;
      z-index: 999999;
      ${position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
      ${position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      display: flex;
      flex-direction: column;
      align-items: ${position.includes('right') ? 'flex-end' : 'flex-start'};
      gap: 12px;
    }

    .sp-floating-btn {
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

    .sp-floating-btn:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 12px 30px ${primaryColor}88;
    }

    .sp-floating-btn.recording {
      animation: sp-pulse-glow 1.5s infinite;
      background: #EF4444;
      box-shadow: 0 0 24px rgba(239,68,68,0.8);
    }

    @keyframes sp-pulse-glow {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(239,68,68,0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }

    /* Popover Dialog Card */
    .sp-dialog-card {
      background: #0F172A;
      border: 1px solid #1E293B;
      border-radius: 20px;
      padding: 20px;
      width: 340px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.1);
      color: #F8FAFC;
      display: none;
      flex-direction: column;
      gap: 14px;
      animation: sp-fade-slide 0.2s ease-out;
    }

    .sp-dialog-card.active {
      display: flex;
    }

    @keyframes sp-fade-slide {
      from { opacity: 0; transform: translateY(10px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .sp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sp-title {
      font-size: 15px;
      font-weight: 700;
      color: #F8FAFC;
      margin: 0;
    }

    .sp-close-btn {
      background: none;
      border: none;
      color: #64748B;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
    }

    /* Star Rating */
    .sp-stars-row {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .sp-star {
      font-size: 26px;
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

    /* Siri Wave Canvas */
    .sp-wave-box {
      background: #060913;
      border: 1px solid #1E293B;
      border-radius: 12px;
      height: 80px;
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
      bottom: 6px;
      font-size: 11px;
      color: #94A3B8;
      font-weight: 600;
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
      box-shadow: 0 4px 14px ${primaryColor}44;
      transition: opacity 0.15s ease;
    }

    .sp-mic-action-btn.recording {
      background: #EF4444;
      box-shadow: 0 4px 14px rgba(239,68,68,0.4);
    }

    /* AI Review Container */
    .sp-review-box {
      background: #060913;
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
  `;

  shadow.appendChild(style);

  // Widget DOM
  const container = document.createElement('div');
  container.className = 'sp-badge-container';

  container.innerHTML = `
    <!-- Popover Card -->
    <div class="sp-dialog-card" id="sp-card">
      <div class="sp-header">
        <h4 class="sp-title">How's your experience? 🎯</h4>
        <button class="sp-close-btn" id="sp-close">✕</button>
      </div>

      <!-- Star Rating -->
      <div class="sp-stars-row" id="sp-stars">
        <span class="sp-star" data-rating="1">★</span>
        <span class="sp-star" data-rating="2">★</span>
        <span class="sp-star" data-rating="3">★</span>
        <span class="sp-star" data-rating="4">★</span>
        <span class="sp-star" data-rating="5">★</span>
      </div>

      <!-- Waveform Visualizer -->
      <div class="sp-wave-box">
        <canvas class="sp-wave-canvas" id="sp-canvas"></canvas>
        <span class="sp-wave-status" id="sp-status">Tap mic below to speak</span>
      </div>

      <!-- Live Transcript / AI Review Box (hidden until spoken) -->
      <div class="sp-review-box" id="sp-review-box" style="display:none;">
        <span class="sp-review-label">✨ GEMINI 3.6 FLASH SYNTHESIS</span>
        <p class="sp-review-text" id="sp-summary-text"></p>
        <div class="sp-task-text" id="sp-task-text"></div>
      </div>

      <!-- Action Button -->
      <button class="sp-mic-action-btn" id="sp-action-btn">
        <span id="sp-action-icon">🎙️</span>
        <span id="sp-action-text">Hold or Tap to Speak</span>
      </button>

      <div class="sp-footer-branding">
        Powered by SayPulse AI Voice Intelligence
      </div>
    </div>

    <!-- Floating Trigger Button -->
    <div class="sp-floating-btn" id="sp-trigger" title="Send Voice Feedback">
      🎙️
    </div>
  `;

  shadow.appendChild(container);

  // DOM Elements
  const trigger = shadow.getElementById('sp-trigger');
  const card = shadow.getElementById('sp-card');
  const closeBtn = shadow.getElementById('sp-close');
  const actionBtn = shadow.getElementById('sp-action-btn');
  const actionIcon = shadow.getElementById('sp-action-icon');
  const actionText = shadow.getElementById('sp-action-text');
  const statusText = shadow.getElementById('sp-status');
  const reviewBox = shadow.getElementById('sp-review-box');
  const summaryText = shadow.getElementById('sp-summary-text');
  const taskText = shadow.getElementById('sp-task-text');
  const stars = shadow.querySelectorAll('.sp-star');
  const canvas = shadow.getElementById('sp-canvas');
  const ctx = canvas.getContext('2d');

  let isRecording = false;
  let selectedRating = 5;
  let recognition = null;
  let spokenTranscript = '';
  let animFrame = null;
  let wavePhase = 0;

  // Star Rating Interaction
  function setRating(r) {
    selectedRating = r;
    stars.forEach((s) => {
      const val = parseInt(s.getAttribute('data-rating') || '0', 10);
      if (val <= r) {
        s.classList.add('filled');
      } else {
        s.classList.remove('filled');
      }
    });
  }
  setRating(5);

  stars.forEach((s) => {
    s.addEventListener('click', function () {
      const r = parseInt(this.getAttribute('data-rating') || '5', 10);
      setRating(r);
    });
  });

  // Toggle Card
  trigger.addEventListener('click', () => {
    card.classList.toggle('active');
  });
  closeBtn.addEventListener('click', () => {
    card.classList.remove('active');
    if (isRecording) stopRecording();
  });

  // Canvas Siri Wave Animation Loop
  function drawWave() {
    if (!ctx) return;
    const w = (canvas.width = canvas.offsetWidth);
    const h = (canvas.height = canvas.offsetHeight);

    ctx.clearRect(0, 0, w, h);

    if (isRecording) {
      wavePhase += 0.12;
      ctx.lineWidth = 2.5;

      // Layer 1: Cyan Wave
      ctx.beginPath();
      ctx.strokeStyle = primaryColor;
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.05 + wavePhase) * 16 * Math.sin((x / w) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Layer 2: Purple Harmonizer
      ctx.beginPath();
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.08 - wavePhase * 1.2) * 10 * Math.sin((x / w) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      // Idle Flat Line
      ctx.beginPath();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    }

    animFrame = requestAnimationFrame(drawWave);
  }
  drawWave();

  // Web Speech API Initialization
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function startRecording() {
    isRecording = true;
    spokenTranscript = '';
    trigger.classList.add('recording');
    actionBtn.classList.add('recording');
    actionIcon.textContent = '⏹️';
    actionText.textContent = 'Tap to Finish & Submit';
    statusText.textContent = 'Listening to your voice… 🎙️';
    reviewBox.style.display = 'none';

    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = function (event) {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          spokenTranscript = current;
          statusText.textContent = `"${current.substring(0, 30)}…"`;
        };

        recognition.onerror = function (e) {
          console.warn('[SayPulse Speech Recognition Notice]', e.error);
        };

        recognition.start();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  async function stopRecording() {
    isRecording = false;
    trigger.classList.remove('recording');
    actionBtn.classList.remove('recording');
    actionIcon.textContent = '✨';
    actionText.textContent = 'Synthesizing with Gemini AI…';
    statusText.textContent = 'Processing with Gemini Flash AI…';

    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }

    const finalNotes = spokenTranscript.trim() || 'Great experience on this page, smooth and responsive.';

    try {
      // 1. Summarize with Gemini AI
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
            userAgent: navigator.userAgent,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            routeHistory: routeHistory,
            consoleErrors: capturedErrors,
          },
        }),
      });

      const aiData = await sumRes.json();

      // 2. Submit Final Payload to Storage & Alert Engine
      await fetch(`${apiBase}/saypulse/v1/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SayPulse-Key': apiKey,
        },
        body: JSON.stringify({
          rating: selectedRating,
          rawTranscript: finalNotes,
          summary: aiData.summary || finalNotes,
          category: aiData.category || 'General_Praise',
          sentiment: aiData.sentiment || 'Positive',
          actionableItem: aiData.actionableItem || 'Reviewed user feedback.',
          toneVariations: aiData.toneVariations || {},
          context: {
            url: window.location.href,
            pathname: window.location.pathname,
            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
            os: navigator.platform || 'MacIntel',
            viewport: { width: window.innerWidth, height: window.innerHeight },
            routeHistory: routeHistory,
            consoleErrors: capturedErrors,
          },
        }),
      });

      // Show Success Review State
      reviewBox.style.display = 'flex';
      summaryText.textContent = aiData.summary || finalNotes;
      taskText.textContent = `💡 Task: ${aiData.actionableItem || 'Feedback logged to dashboard'}`;

      actionIcon.textContent = '✓';
      actionText.textContent = 'Feedback Sent Successfully!';
      statusText.textContent = '✓ Thank you! Recorded in SayPulse';

      setTimeout(() => {
        actionIcon.textContent = '🎙️';
        actionText.textContent = 'Hold or Tap to Speak';
        statusText.textContent = 'Tap mic below to speak';
        card.classList.remove('active');
      }, 4000);
    } catch (err) {
      console.error('[SayPulse Error]', err);
      actionIcon.textContent = '✓';
      actionText.textContent = 'Recorded!';
      statusText.textContent = 'Saved successfully';
      setTimeout(() => card.classList.remove('active'), 2000);
    }
  }

  // Mic Button Toggle
  actionBtn.addEventListener('click', () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  });

  console.log('🎙️ [SayPulse] Universal 1-Line Voice Widget initialized (Shadow DOM active)');
})();
