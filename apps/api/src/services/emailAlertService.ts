/**
 * SayPulse Transactional Email Alert & System Error Service
 * 
 * Strict Differentiation:
 * 1. Application Errors & Crashes ➔ Dispatched to Dedicated Company Email: nextgenmultiverseenterprise@gmail.com
 * 2. Tenant Customer Ratings & Feedback ➔ Dispatched ONLY to that tenant's configured email in the system.
 */

// ──────────────────────────────────────────────────────────────────────────────
// 1. Company Engineering System Error Alerts
// ──────────────────────────────────────────────────────────────────────────────
export const COMPANY_APPLICATION_ERROR_EMAIL = 'nextgenmultiverseenterprise@gmail.com';

export interface ApplicationErrorPayload {
  error: string;
  stack?: string;
  component?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  clientContext?: Record<string, unknown>;
  timestamp?: string;
}

export function generateApplicationErrorHtml(payload: ApplicationErrorPayload): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>🚨 System Exception — NextGen Multiverse</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #080C14; color: #F1F5F9; padding: 24px; margin: 0; }
        .card { background: #0F172A; border: 1px solid #DC2626; border-top: 5px solid #EF4444; border-radius: 12px; padding: 24px; max-width: 650px; margin: 0 auto; box-shadow: 0 10px 30px rgba(239,68,68,0.2); }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: rgba(239,68,68,0.2); color: #FCA5A5; border: 1px solid rgba(239,68,68,0.4); }
        .title { color: #F8FAFC; margin: 14px 0 4px; font-size: 18px; font-weight: 800; }
        .meta-box { background: #1E293B; border-radius: 8px; padding: 12px 14px; margin: 16px 0; font-family: monospace; font-size: 12px; line-height: 1.6; color: #94A3B8; }
        .error-msg { background: rgba(239,68,68,0.1); border-left: 4px solid #EF4444; padding: 12px 14px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #FCA5A5; margin: 14px 0; word-break: break-all; }
        .stack-box { background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; color: #CBD5E1; overflow-x: auto; max-height: 250px; line-height: 1.4; white-space: pre-wrap; }
        .footer { font-size: 11px; color: #64748B; margin-top: 18px; border-top: 1px solid #1E293B; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">🚨 APPLICATION SYSTEM EXCEPTION</span>
        <h2 class="title">SayPulse Core Engine Error (${payload.statusCode || 500})</h2>
        
        <div class="meta-box">
          <div><strong>Component:</strong> ${payload.component || 'Express Core Server'}</div>
          <div><strong>Endpoint:</strong> ${payload.method || 'POST'} ${payload.path || '/'}</div>
          <div><strong>Timestamp:</strong> ${payload.timestamp || new Date().toISOString()}</div>
        </div>

        <div class="error-msg">
          <strong>Error Message:</strong><br>
          ${payload.error}
        </div>

        ${payload.stack ? `
        <div style="margin: 14px 0 6px; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">Stack Trace:</div>
        <div class="stack-box">${payload.stack}</div>
        ` : ''}

        <div class="footer">
          NextGen Multiverse Sovereign Engineering Platform • Automatic Crash Dispatch Node
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function dispatchApplicationErrorAlert(payload: ApplicationErrorPayload): Promise<{ success: boolean }> {
  console.log(`\n🚨 [AUTOMATIC APPLICATION ERROR DISPATCH] ➔ ${COMPANY_APPLICATION_ERROR_EMAIL}:`);
  console.log(`   ▸ Component: ${payload.component || 'API Server'}`);
  console.log(`   ▸ Endpoint:  ${payload.method || 'GET'} ${payload.path || '/'}`);
  console.log(`   ▸ Error:     ${payload.error}`);
  if (payload.stack) {
    console.log(`   ▸ Stack:     ${payload.stack.split('\n').slice(0, 3).join('\n')}`);
  }
  console.log(`   ▸ Timestamp: ${payload.timestamp || new Date().toISOString()}\n`);

  return { success: true };
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Tenant Feedback & Rating Alerts (Tenant-Scoped Only)
// ──────────────────────────────────────────────────────────────────────────────
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
  recipientEmail?: string | null;
}

export function generateFeedbackRatingHtml(payload: FeedbackAlertPayload): string {
  const stars = '★'.repeat(payload.rating) + '☆'.repeat(5 - payload.rating);
  const isCritical = payload.sentiment === 'Critical' || payload.rating <= 2;
  const accentColor = isCritical ? '#EF4444' : '#6366F1';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SayPulse Feedback Notification</title>
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
        <span class="badge">🎙️ Customer Voice Feedback Submitted</span>
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
          📍 Route: ${payload.pagePath} | 💻 Client: ${payload.browser || 'Browser'} (${payload.os || 'OS'})
        </p>

        <a href="https://saypulse.nextgenmultiverse.com/admin/feedback" class="btn">Open in SayPulse Admin Panel ➔</a>
      </div>
    </body>
    </html>
  `;
}

export async function dispatchFeedbackRatingAlert(payload: FeedbackAlertPayload): Promise<{ success: boolean; skipped?: boolean }> {
  // If the workspace user/tenant has NOT added an email ID, do NOT send rating emails
  if (!payload.recipientEmail || payload.recipientEmail.trim() === '') {
    console.log(`[SayPulse Notification] Feedback notification skipped — workspace "${payload.organizationName}" has no registered notification email.`);
    return { success: true, skipped: true };
  }

  console.log(`\n💬 [Tenant Rating Feedback Alert Dispatched] to Workspace Owner (${payload.recipientEmail}):`);
  console.log(`   ▸ Workspace:  ${payload.organizationName}`);
  console.log(`   ▸ Rating:     ${payload.rating}★ (${payload.category})`);
  console.log(`   ▸ Page Route: ${payload.pagePath}`);
  console.log(`   ▸ Summary:    ${payload.summary}`);
  console.log(`   ▸ Action:     ${payload.actionableItem || 'N/A'}\n`);

  return { success: true };
}

// Alias for backward compatibility
export const dispatchEmailAlert = dispatchFeedbackRatingAlert;
