import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// POST /saypulse/v1/feedback/tone
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { summary, tone } = req.body as {
    summary: string;
    tone: 'short' | 'formal' | 'elaborated';
  };

  if (!summary || !tone) {
    res.status(400).json({ error: 'summary and tone are required' });
    return;
  }

  const TONE_INSTRUCTIONS: Record<string, string> = {
    short:      'Rewrite this in ONE sentence. Be extremely concise. Keep the core meaning.',
    formal:     'Rewrite this in a professional, business-appropriate tone suitable for a product manager report.',
    elaborated: 'Expand this with more detail, including context and impact. Keep it under 4 sentences.',
  };

  const instruction = TONE_INSTRUCTIONS[tone];
  if (!instruction) {
    res.status(400).json({ error: 'tone must be one of: short, formal, elaborated' });
    return;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
    });

    const prompt = `${instruction}\n\nOriginal: "${summary}"\n\nReturn ONLY the rewritten text, no quotes, no explanation.`;
    const result = await model.generateContent(prompt);
    const rewritten = result.response.text().trim();

    res.json({ result: rewritten || summary });
  } catch (err) {
    console.error('[SayPulse /tone error]:', err);
    // Fallback: return original summary if rewrite fails
    res.json({ result: summary });
  }
});

export default router;
