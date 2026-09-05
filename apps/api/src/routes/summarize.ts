import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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

// POST /saypulse/v1/feedback/summarize
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { transcript, context } = req.body as {
    transcript?: string;
    context?: Record<string, unknown>;
  };

  // Determine effective feedback text from transcript or rating & tags
  let effectiveTranscript = (transcript || '').trim();
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
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const contextSummary = context
      ? `Page: ${context.url ?? 'unknown'} | Route: ${context.pathname ?? '/'} | Rating: ${rating ?? 'N/A'} | Tags: [${tags}]`
      : 'No additional context';

    const prompt = `You are a product feedback analyst. Analyze this user feedback and return structured JSON.

User feedback: "${effectiveTranscript}"
Context: ${contextSummary}

Instructions:
1. Write a crisp 1-2 sentence summary that captures the core issue/praise.
2. Choose the most fitting category: Bug, UX_Friction, Feature_Request, Performance, Billing, General_Praise.
3. Detect the emotional sentiment: Positive, Neutral, Frustrated, Critical.
4. Suggest one concrete, actionable improvement for the product team.
5. Provide three tone variations: short (1 sentence), formal (professional), elaborated (detailed).

Return ONLY valid JSON matching the schema.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip markdown wrappers if any
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);
    text = text.trim();

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error('[SayPulse /summarize error]:', err);

    // Fallback response so frontend never gets 500
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
