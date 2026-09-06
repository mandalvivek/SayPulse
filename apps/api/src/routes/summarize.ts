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
      description: 'Crisp 1-2 sentence executive summary of the feedback in professional English',
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
      description: 'One concrete action the product team should take in English',
    },
    detected_language: {
      type: SchemaType.STRING,
      description: 'The spoken language detected e.g. Hindi, Hinglish, Bengali, Bhojpuri, Marathi, Telugu, Tamil, French, Dutch, Chinese, English',
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
  required: ['summary', 'category', 'sentiment', 'actionable_item', 'detected_language', 'tone_variations'],
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

// ── Multilingual Semantic Fallback Engine ──────────────────────────────────────
function generateSmartFallback(transcript: string, rating?: any, tags?: string) {
  const text = transcript.toLowerCase();
  const numRating = Number(rating) || 3;

  // Sentiment and intent heuristics (supports English & Indian multilingual/Hinglish)
  const isPositive =
    numRating >= 4 ||
    /\b(achcha|acha|mast|badhiya|pasand|sundar|great|awesome|love|good|fast|smooth|amazing|best|excellent|helpful|nice|shandaar|khoob)\b/i.test(text);
  const isBugOrIssue =
    numRating <= 2 ||
    /\b(bug|error|slow|crash|broken|fail|issue|problem|kharab|bekar|ruk|atak|phasa|not working|glitch|freeze|chalta nahi)\b/i.test(text);
  const isIntegrationOrFeature =
    /\b(integrate|integration|dalo|lagao|add|feature|system|application|api|sdk|export|download|kya possible hai|kaise karein|help)\b/i.test(text);

  let category = 'UX_Friction';
  let sentiment = 'Neutral';
  let summary = 'The user provided product feedback regarding system usability.';
  let actionableItem = 'Review user workflow telemetry and optimize UX touchpoints.';

  if (isIntegrationOrFeature) {
    category = 'Feature_Request';
    sentiment = isPositive ? 'Positive' : 'Neutral';
    summary = 'User expressed interest in integrating the voice feedback system into their own web application or requested feature enhancements.';
    actionableItem = 'Provide developer SDK documentation and custom platform integration guides.';
  } else if (isPositive) {
    category = 'General_Praise';
    sentiment = 'Positive';
    summary = 'User recorded positive feedback commending the fast, seamless experience and interface design.';
    actionableItem = 'Maintain high system responsiveness and share user praise with the product team.';
  } else if (isBugOrIssue) {
    category = 'Bug';
    sentiment = 'Frustrated';
    summary = 'User encountered operational friction or performance slowdown during workflow execution.';
    actionableItem = 'Investigate client-side performance logs and resolve runtime friction points.';
  }

  // Language heuristic
  let detected_language = 'English';
  if (/[\u0900-\u097F]/.test(transcript) || /\b(hai|aur|kya|bahut|acha|accha|mujhe|hum|aap|kaise|karo|nahi|sahi|mera)\b/i.test(text)) {
    detected_language = /[\u0900-\u097F]/.test(transcript) ? 'Hindi' : 'Hinglish';
  } else if (/[\u0980-\u09FF]/.test(transcript) || /\b(aami|bhalo|kemon|shob|korbo|eta)\b/i.test(text)) {
    detected_language = 'Bengali';
  } else if (/[\u0B80-\u0BFF]/.test(transcript) || /\b(vanakkam|nalla|eppadi|solunga)\b/i.test(text)) {
    detected_language = 'Tamil';
  } else if (/[\u0C00-\u0C7F]/.test(transcript) || /\b(bagundi|cheyandi|ela|unna)\b/i.test(text)) {
    detected_language = 'Telugu';
  } else if (/[\u4E00-\u9FFF]/.test(transcript)) {
    detected_language = 'Chinese';
  } else if (/\b(bonjour|merci|tres|bien|probleme)\b/i.test(text)) {
    detected_language = 'French';
  } else if (/\b(hallo|goed|bedankt|alstublieft)\b/i.test(text)) {
    detected_language = 'Dutch';
  }

  return {
    summary,
    category,
    sentiment,
    actionable_item: actionableItem,
    detected_language,
    tone_variations: {
      short: summary,
      formal: `Executive review: ${summary}`,
      elaborated: `${summary} (Language: ${detected_language} | Captured via SayPulse Telemetry with rating: ${rating ?? 'N/A'}, tags: [${tags || 'general'}])`,
    },
  };
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
        temperature: 0.15,
        maxOutputTokens: 512,
      },
    });

    const contextSummary = context
      ? `Page: ${context.url ?? 'unknown'} | Route: ${context.pathname ?? '/'} | Rating: ${rating ?? 'N/A'} | Tags: [${tags}]`
      : 'No additional context';

    const prompt = `You are the executive product intelligence engine for SayPulse AI.
Analyze this user feedback and output clean structured JSON.

User feedback: "${effectiveTranscript}"
Context: ${contextSummary}

Domain Glossary & Brand Invariants:
- The product platform is "SayPulse" (AI voice intelligence and telemetry platform).
- Normalize speech errors (e.g. "sepals", "say pulse", "safe pulse", "staples", "sepal", "sayplus") to "SayPulse".
- Associated brands: "NextGen Multiverse", "ExamDesk", "Tecton Enterprise".

Multilingual & Translation Invariant:
- The feedback may be in English, Hindi, Hinglish (Hindi written in Roman/English alphabet), Bengali, Bhojpuri, Marathi, Telugu, Tamil, French, Dutch, Chinese, or mixed languages.
- You MUST understand the underlying intent, tone, and nuances in any language, and synthesize the "summary", "actionable_item", and "tone_variations" into CRISP, HIGH-IMPACT, EXECUTIVE-GRADE ENGLISH.
- NEVER repeat or echo raw non-English/Hinglish sentences verbatim in the summary.

Instructions:
1. Write a crisp 1-2 sentence English summary capturing the user's intent.
2. Select category: Bug, UX_Friction, Feature_Request, Performance, Billing, General_Praise.
3. Detect sentiment: Positive, Neutral, Frustrated, Critical.
4. Suggest one concrete, actionable engineering/product task.
5. Provide three tone variations in clean English (short, formal, elaborated).

Return ONLY valid JSON matching the schema.`;

    // 3.5s Circuit Breaker to prevent long UI hang
    const aiTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI Synthesis Timeout (>3500ms)')), 3500)
    );

    const result: any = await Promise.race([
      model.generateContent(prompt),
      aiTimeoutPromise,
    ]);

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
    console.warn('[SayPulse /summarize warning - using smart fallback]:', err.message || err);

    // Notify company engineering inbox of AI synthesis failure in background
    dispatchApplicationErrorAlert({
      error: err.message || 'Gemini AI summarization error',
      stack: err.stack,
      component: 'Gemini AI Summarization Engine',
      path: '/saypulse/v1/feedback/summarize',
      method: 'POST',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    }).catch(() => {});

    // Intelligent local semantic synthesis (never echo verbatim)
    const fallbackResponse = generateSmartFallback(effectiveTranscript, rating, tags);
    res.json(fallbackResponse);
  }
});

export default router;
