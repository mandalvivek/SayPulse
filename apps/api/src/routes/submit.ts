import { Router, Request, Response } from 'express';
import { saveFeedback, getOrganizationAlertEmail } from '../db/sqlite';
import {
  dispatchFeedbackRatingAlert,
  dispatchApplicationErrorAlert,
} from '../services/emailAlertService';

const router = Router();

// POST /saypulse/v1/feedback/submit
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    summary,
    rating,
    quickTags,
    category,
    sentiment,
    actionable_item,
    actionableItem,
    rawTranscript,
    toneVariations,
    context,
  } = req.body as {
    summary: string;
    rating?: number;
    quickTags?: string[];
    category?: string;
    sentiment?: string;
    actionable_item?: string;
    actionableItem?: string;
    rawTranscript?: string;
    toneVariations?: Record<string, string>;
    context?: Record<string, unknown>;
  };

  if (!summary) {
    res.status(400).json({ error: 'summary is required' });
    return;
  }

  const finalActionItem = actionableItem || actionable_item;

  try {
    const id = saveFeedback({
      apiKey: req.saypulse?.apiKey ?? 'sp_dev_local_master',
      organizationId: req.saypulse?.organizationId,
      apiKeyId: req.saypulse?.apiKeyId,
      partner: req.saypulse?.partner ?? 'SayPulse Client',
      sessionId: (context as any)?.sessionId,
      rating,
      quickTags,
      rawTranscript: rawTranscript || summary,
      summary,
      category,
      sentiment,
      actionableItem: finalActionItem,
      toneVariations,
      context,
    });

    console.log(`[SayPulse] Feedback saved: ${id} | ${category} | ${sentiment} | rating: ${rating}`);

    // If critical issue or 1-2 stars, trigger tenant-scoped rating alert ONLY if tenant has an email in the system
    if (rating && (rating <= 2 || sentiment === 'Critical' || category === 'Bug')) {
      const tenantEmail = req.saypulse?.organizationId
        ? getOrganizationAlertEmail(req.saypulse.organizationId)
        : null;

      if (tenantEmail) {
        dispatchFeedbackRatingAlert({
          organizationName: req.saypulse?.partner ?? 'SayPulse Client',
          rating: rating || 1,
          category: category ?? 'Bug',
          sentiment: sentiment ?? 'Critical',
          summary,
          actionableItem: finalActionItem,
          pagePath: ((context as any)?.pathname as string) || '/',
          browser: ((context as any)?.browser as string) || 'Chrome',
          os: ((context as any)?.os as string) || 'macOS',
          recipientEmail: tenantEmail,
        }).catch((e) => console.error('[Tenant Rating Alert Error]:', e));
      } else {
        console.log(`[SayPulse] Rating alert skipped — workspace "${req.saypulse?.partner}" has no registered tenant email in system.`);
      }
    }

    res.json({ id, success: true });
  } catch (err: any) {
    console.error('[SayPulse /submit error]:', err);

    // Dispatch application exception to dedicated company email
    dispatchApplicationErrorAlert({
      error: err.message || 'Failed saving feedback record to database',
      stack: err.stack,
      component: 'Feedback Submit Route',
      path: '/saypulse/v1/feedback/submit',
      method: 'POST',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    }).catch((e) => console.error('[App Error Alert Error]:', e));

    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

export default router;
