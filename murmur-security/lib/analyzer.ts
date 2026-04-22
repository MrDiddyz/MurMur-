export type RiskLevel = 'low' | 'medium' | 'high';

export interface AnalysisResult {
  riskLevel: RiskLevel;
  score: number;
  summary: string;
  flags: string[];
  advice: string[];
}

interface Rule {
  label: string;
  pattern: RegExp;
  weight: number;
}

const RULES: Rule[] = [
  { label: 'Requests gift card payment', pattern: /gift\s*card/i, weight: 16 },
  { label: 'Requests wire transfer', pattern: /wire\s*transfer/i, weight: 16 },
  { label: 'Mentions crypto payment', pattern: /crypto|bitcoin|usdt/i, weight: 14 },
  { label: 'Pushes urgent action', pattern: /urgent(?:ly)?\s+act|immediately/i, weight: 10 },
  { label: 'Asks to verify account credentials', pattern: /verify\s+your\s+(?:account|password|identity)/i, weight: 14 },
  { label: 'Requests one-time code or password', pattern: /one[-\s]?time\s+(?:password|code)|otp/i, weight: 14 },
  { label: 'Contains "click here" language', pattern: /click\s+here/i, weight: 10 },
  { label: 'Claims account suspension', pattern: /suspended\s+account|account\s+locked/i, weight: 11 },
  { label: 'Promises tax refund or rebate', pattern: /tax\s+refund|rebate/i, weight: 9 },
  { label: 'Contains prize/lottery claim', pattern: /congratulations\s+you\s+won|lottery|prize/i, weight: 9 },
  { label: 'Requests attachment download', pattern: /download\s+attachment|open\s+attachment/i, weight: 8 },
  { label: 'Mentions unusual account activity', pattern: /unusual\s+activity|suspicious\s+login/i, weight: 8 }
];

const URL_PATTERN = /(https?:\/\/|www\.)\S+/i;
const SHORTENER_PATTERN = /(bit\.ly|tinyurl\.com|t\.co|rb\.gy|goo\.gl)\//i;

export function analyzeMessage(input: string): AnalysisResult {
  const text = input.trim();

  if (!text) {
    return {
      riskLevel: 'low',
      score: 0,
      summary: 'Add message content to run an analysis.',
      flags: [],
      advice: ['Paste the full text, including links and requests for payment.']
    };
  }

  const flags: string[] = [];
  let score = 0;

  if (URL_PATTERN.test(text)) {
    score += 16;
    flags.push('Contains a link.');
  }

  if (SHORTENER_PATTERN.test(text)) {
    score += 15;
    flags.push('Uses a URL shortener (destination is hidden).');
  }

  const upperRatio = (text.match(/[A-Z]/g)?.length ?? 0) / Math.max(text.length, 1);
  if (upperRatio > 0.2 && text.length > 40) {
    score += 8;
    flags.push('Heavy use of uppercase urgency language.');
  }

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      score += rule.weight;
      flags.push(rule.label);
    }
  }

  if (/\d{4,}/.test(text)) {
    score += 5;
    flags.push('Contains long number strings (possibly fabricated claim or code request).');
  }

  score = Math.min(100, score);

  const riskLevel: RiskLevel = score >= 55 ? 'high' : score >= 25 ? 'medium' : 'low';

  const advice =
    riskLevel === 'high'
      ? [
          'Do not click links, call numbers, or reply.',
          'Verify independently using the organization’s official website or app.',
          'Report and block the sender if untrusted.'
        ]
      : riskLevel === 'medium'
        ? [
            'Pause before acting and independently verify the claim.',
            'Do not share passwords, OTPs, payment details, or personal identifiers by message.'
          ]
        : [
            'No major scam signals found, but still verify unknown senders.',
            'If money or sensitive data is requested, validate through trusted channels first.'
          ];

  const summary =
    riskLevel === 'high'
      ? 'High scam likelihood based on social engineering, payment, or link-based signals.'
      : riskLevel === 'medium'
        ? 'Several suspicious elements detected. Verify details before taking action.'
        : 'Message appears relatively low risk from language patterns alone.';

  return {
    riskLevel,
    score,
    summary,
    flags: Array.from(new Set(flags)),
    advice
  };
}
