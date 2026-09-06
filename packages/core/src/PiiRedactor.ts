export interface RedactionResult {
  cleanText: string;
  redactionCount: number;
  typesFound: string[];
}

// PII/PHI patterns to redact before any text leaves the client.
// Covers Indian Aadhaar, PAN, mobile numbers + US SSN, credit cards, emails.
const PATTERNS: ReadonlyArray<{
  name: string;
  re: RegExp;
  label: string;
}> = [
  {
    name: 'AADHAAR',
    re: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    label: '[AADHAAR_REDACTED]',
  },
  {
    name: 'PAN',
    re: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    label: '[PAN_REDACTED]',
  },
  {
    name: 'PHONE_INDIA',
    re: /\b(?:\+91[\s-]?)?[6-9]\d{9}\b/g,
    label: '[PHONE_REDACTED]',
  },
  {
    name: 'PHONE_INTL',
    re: /\b\+?1?[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g,
    label: '[PHONE_REDACTED]',
  },
  {
    name: 'EMAIL',
    re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    label: '[EMAIL_REDACTED]',
  },
  {
    name: 'SSN_US',
    re: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    label: '[SSN_REDACTED]',
  },
  {
    name: 'CREDIT_CARD',
    re: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
    label: '[CARD_REDACTED]',
  },
];

// Phonetic dictionary to correct speech-to-text misrecognitions of brand terms
export const PHONETIC_BRAND_DICTIONARY: ReadonlyArray<{ pattern: RegExp; replacement: string }> = [
  // SayPulse phonetic homophones & speech recognition variations
  {
    pattern: /\b(sepals?|sepal|safe\s*pulse|say\s*pulse|say\s*pause|c\s*pulse|see\s*pulse|save\s*pulse|say\s*polls|say\s*poles|staples|stay\s*pulse|sayplus|say\s*plus|sapulse)\b/gi,
    replacement: 'SayPulse',
  },
  // NextGen Multiverse
  {
    pattern: /\b(next\s*gen\s*multiverse|nextgen\s*multiverse|next\s*generation\s*multiverse)\b/gi,
    replacement: 'NextGen Multiverse',
  },
  // NextGen ExamDesk
  {
    pattern: /\b(exam\s*desk|examdesk)\b/gi,
    replacement: 'ExamDesk',
  },
  // Tecton Enterprise
  {
    pattern: /\b(tekton|tecton\s*enterprise)\b/gi,
    replacement: 'Tecton Enterprise',
  },
];

/**
 * Normalizes speech recognition acoustic artifacts and misheard brand terms
 */
export function normalizeBrandTerms(text: string): string {
  if (!text) return '';
  let result = text;
  for (const { pattern, replacement } of PHONETIC_BRAND_DICTIONARY) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// redactPii
// Runs synchronously on the main thread — text payloads are small enough
// (< 2KB) that a Worker would add overhead without benefit.
// Also normalizes brand lexicon terms.
// ──────────────────────────────────────────────────────────────────────────────
export function redactPii(text: string): RedactionResult {
  // First normalize speech transcription brand homophones
  let cleanText = normalizeBrandTerms(text || '');
  let redactionCount = 0;
  const typesFound: string[] = [];

  for (const { name, re, label } of PATTERNS) {
    // Reset regex state (global flag)
    re.lastIndex = 0;
    const matches = cleanText.match(re);
    if (matches && matches.length > 0) {
      cleanText = cleanText.replace(re, label);
      redactionCount += matches.length;
      typesFound.push(name);
    }
  }

  return { cleanText, redactionCount, typesFound };
}
