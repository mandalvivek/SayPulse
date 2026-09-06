import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { dispatchApplicationErrorAlert } from '../services/emailAlertService';

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ── Structured output schema ──────────────────────────────────────────────────
const FEEDBACK_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: 'Crisp 1-2 sentence summary of the user feedback',
    },
    category: {
      type: SchemaType.STRING,
      enum: ['Bug', 'UX_Friction', 'Feature_Request', 'Performance', 'Billing', 'General_Praise'],
    },
    sentiment: {
      type: SchemaType.STRING,
      enum: ['Positive', 'Neutral', 'Frustrated', 'Critical'],
    },
    actionable_item: {
      type: SchemaType.STRING,
      description: 'One concrete action the product team should take',
    },
    tone_variations: {
      type: SchemaType.OBJECT,
      properties: {
        short:      { type: SchemaType.STRING, description: 'One sentence max' },
        formal:     { type: SchemaType.STRING, description: 'Professional, concise tone' },
        elaborated: { type: SchemaType.STRING, description: 'Detailed version with context' },
      },
      required: ['short', 'formal', 'elaborated'],
    },
  },
  required: ['summary', 'category', 'sentiment', 'actionable_item', 'tone_variations'],
};

// ── Phonetic & Brand Lexicon Normalizer ─────────────────────────────────────────
const PHONETIC_BRAND_DICTIONARY: ReadonlyArray<{ pattern: RegExp; replacement: string }> = [
  {
    pattern: /\b(sepals?|sepal|safe\s*pulse|say\s*pulse|say\s*pause|c\s*pulse|see\s*pulse|save\s*pulse|say\s*polls|say\s*poles|staples|stay\s*pulse|sayplus|say\s*plus|sapulse)\b/gi,
    replacement: 'SayPulse',
  },
  {
    pattern: /\b(next\s*gen\s*multiverse|nextgen\s*multiverse|next\s*generation\s*multiverse)\b/gi,
    replacement: 'NextGen Multiverse',
  },
  {
    pattern: /\b(exam\s*desk|examdesk)\b/gi,
    replacement: 'ExamDesk',
  },
  {
    pattern: /\b(tekton|tecton\s*enterprise)\b/gi,
    replacement: 'Tecton Enterprise',
  },
];

function normalizeBrandTerms(text: string): string {
  if (!text) return '';
  let result = text;
  for (const { pattern, replacement } of PHONETIC_BRAND_DICTIONARY) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// POST /saypulse/v1/feedback/summarize
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { transcript, context } = req.body as {
    transcript?: string;
    context?: Record<string, unknown>;
  };

  // Determine effective feedback text from transcript or rating & tags
  let rawTranscript = (transcript || '').trim();
  let effectiveTranscript = normalizeBrandTerms(rawTranscript);
  const rating = context?.rating;
  const rawTags = context?.quickTags;
  const tags = Array.isArray(rawTags) ? (rawTags as string[]).join(', ') : '';

  if (
    !effectiveTranscript ||
    effectiveTranscript.length < 3 ||
    effectiveTranscript.startsWith('[')
  ) {
    if (rating || tags) {
      effectiveTranscript = `User gave a ${rating ? `${rating}-star` : ''} rating with tags: "${tags || 'general'}". No spoken words were detected.`;
    } else {
      effectiveTranscript = 'User submitted general application feedback.';
    }
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: FEEDBACK_SCHEMA as any,
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    const contextSummary = context
      ? `Page: ${context.url ?? 'unknown'} | Route: ${context.pathname ?? '/'} | Rating: ${rating ?? 'N/A'} | Tags: [${tags}]`
      : 'No additional context';

    const prompt = `You are a product feedback analyst for SayPulse AI. Analyze this user feedback and return structured JSON.

User feedback: "${effectiveTranscript}"
Context: ${contextSummary}

Domain Glossary & Brand Invariants:
- The product platform is "SayPulse" (AI voice intelligence and telemetry platform).
- Common speech recognition errors include "sepals", "say pulse", "safe pulse", "say pause", "staples", "sepal", "sayplus". Always correct and normalize these to "SayPulse".
- Never generate recommendations or summaries referencing "sepals" or misheard terms.
- Associated brand names: "NextGen Multiverse", "ExamDesk", "Tecton Enterprise".

Instructions:
1. Write a crisp 1-2 sentence summary that captures the core issue/praise.
2. Choose the most fitting category: Bug, UX_Friction, Feature_Request, Performance, Billing, General_Praise.
3. Detect the emotional sentiment: Positive, Neutral, Frustrated, Critical.
4. Suggest one concrete, actionable improvement for the product team.
5. Provide three tone variations: short (1 sentence), formal (professional), elaborated (detailed).

Return ONLY valid JSON matching the schema.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(text);

    // Deterministic post-processing brand sanitizer
    if (parsed.summary) parsed.summary = normalizeBrandTerms(parsed.summary);
    if (parsed.actionable_item) parsed.actionable_item = normalizeBrandTerms(parsed.actionable_item);
    if (parsed.tone_variations) {
      if (parsed.tone_variations.short) parsed.tone_variations.short = normalizeBrandTerms(parsed.tone_variations.short);
      if (parsed.tone_variations.formal) parsed.tone_variations.formal = normalizeBrandTerms(parsed.tone_variations.formal);
      if (parsed.tone_variations.elaborated) parsed.tone_variations.elaborated = normalizeBrandTerms(parsed.tone_variations.elaborated);
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('[SayPulse /summarize error]:', err);

    // Notify company engineering inbox of AI synthesis failure
    dispatchApplicationErrorAlert({
      error: err.message || 'Gemini AI summarization error',
      stack: err.stack,
      component: 'Gemini AI Summarization Engine',
      path: '/saypulse/v1/feedback/summarize',
      method: 'POST',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    }).catch((e) => console.error('[App Error Alert Error]:', e));

    // Fallback response so frontend never gets broken
    const fallbackCategory = (Number(rating) || 3) >= 4 ? 'General_Praise' : 'UX_Friction';
    const fallbackSentiment = (Number(rating) || 3) >= 4 ? 'Positive' : 'Neutral';
    const baseSummary =
      effectiveTranscript.length > 5
        ? effectiveTranscript
        : `User rated ${rating ?? 3} stars with tags: ${tags || 'General'}`;

    res.json({
      summary: baseSummary,
      category: fallbackCategory,
      sentiment: fallbackSentiment,
      actionable_item: 'Review submitted feedback notes.',
      tone_variations: {
        short: baseSummary,
        formal: `The user recorded feedback regarding ${tags || 'general user experience'}.`,
        elaborated: `The user submitted feedback indicating a ${rating ? `${rating}-star` : ''} experience and specified tags: ${tags || 'none'}.`,
      },
    });
  }
});

export default router;
