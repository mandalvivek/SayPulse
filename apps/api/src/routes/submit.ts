import { Router, Request, Response } from 'express';
import { saveFeedback } from '../db/sqlite';
import { dispatchEmailAlert } from '../services/emailAlertService';

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
      partner: req.saypulse?.partner ?? 'Acme Analytics',
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

    // If critical issue or 1-2 stars, trigger transactional email alert
    if (rating && (rating <= 2 || sentiment === 'Critical' || category === 'Bug')) {
      dispatchEmailAlert({
        organizationName: req.saypulse?.partner ?? 'Acme Analytics',
        rating: rating || 1,
        category: category ?? 'Bug',
        sentiment: sentiment ?? 'Critical',
        summary,
        actionableItem: finalActionItem,
        pagePath: ((context as any)?.pathname as string) || '/',
        browser: ((context as any)?.browser as string) || 'Chrome',
        os: ((context as any)?.os as string) || 'macOS',
        recipientEmail: 'alerts@acmeanalytics.com',
      }).catch((e) => console.error('[Email Alert Error]:', e));
    }

    res.json({ id, success: true });
  } catch (err) {
    console.error('[SayPulse /submit error]:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

export default router;
