/**
 * SayPulse Transactional Email Alert Service
 * Dispatches high-fidelity HTML email alerts for Critical Bugs & Low Ratings
 */

export interface FeedbackAlertPayload {
  organizationName: string;
  rating: number;
  category: string;
  sentiment: string;
  summary: string;
  actionableItem?: string;
  pagePath: string;
  device?: string;
  browser?: string;
  os?: string;
  recipientEmail: string;
}

export function generateAlertHtml(payload: FeedbackAlertPayload): string {
  const stars = '★'.repeat(payload.rating) + '☆'.repeat(5 - payload.rating);
  const isCritical = payload.sentiment === 'Critical' || payload.rating <= 2;
  const accentColor = isCritical ? '#EF4444' : '#6366F1';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SayPulse Alert</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0B1120; color: #F1F5F9; padding: 24px; margin: 0; }
        .card { background: #0F172A; border: 1px solid #1E293B; border-top: 4px solid ${accentColor}; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: rgba(239,68,68,0.15); color: #EF4444; border: 1px solid rgba(239,68,68,0.3); }
        .stars { color: #FBBF24; font-size: 16px; margin: 10px 0; }
        .summary-box { background: #1E293B; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #E2E8F0; }
        .action-box { background: rgba(99,102,241,0.1); border-left: 3px solid #6366F1; border-radius: 6px; padding: 12px 14px; margin: 16px 0; font-size: 13px; color: #C7D2FE; }
        .btn { display: inline-block; background: #06B6D4; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 8px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">🚨 Critical Voice Feedback Reported</span>
        <h2 style="color: #F8FAFC; margin: 12px 0 4px;">${payload.organizationName} • ${payload.pagePath}</h2>
        <div class="stars">${stars} (${payload.rating}/5 Stars) • ${payload.category}</div>
        
        <div class="summary-box">
          <strong style="color: #38BDF8;">✨ Gemini AI Structured Summary:</strong><br>
          ${payload.summary}
        </div>

        ${payload.actionableItem ? `
        <div class="action-box">
          <strong>💡 Actionable Engineering Task:</strong><br>
          ${payload.actionableItem}
        </div>` : ''}

        <p style="font-size: 12px; color: #64748B; margin: 14px 0 0;">
          📍 Route: ${payload.pagePath} | 💻 Device: ${payload.browser || 'Browser'} (${payload.os || 'OS'})
        </p>

        <a href="http://localhost:7100/admin/feedback" class="btn">Open in SayPulse Admin Panel ➔</a>
      </div>
    </body>
    </html>
  `;
}

export async function dispatchEmailAlert(payload: FeedbackAlertPayload): Promise<{ success: boolean }> {
  console.log(`\n📧 [Email Alert Dispatched] to ${payload.recipientEmail}:`);
  console.log(`   ▸ Subject: 🚨 [SayPulse Alert] ${payload.category} (${payload.rating}★) on ${payload.pagePath}`);
  console.log(`   ▸ Summary: ${payload.summary}`);
  console.log(`   ▸ Action:  ${payload.actionableItem || 'N/A'}\n`);

  return { success: true };
}
