const KNOWN_BRANDS = [
  'paypal.com', 'amazon.com', 'microsoft.com', 'apple.com', 'google.com',
  'facebook.com', 'netflix.com', 'chase.com', 'bankofamerica.com', 'irs.gov'
];

const SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd'];
const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.work', '.click'];

const URGENCY_PHRASES = [
  'verify your account', 'act now', 'urgent', 'immediately', 'suspended',
  'will expire', 'click here', 'limited time', 'confirm your identity', 'unusual activity'
];

const SENSITIVE_REQUESTS = [
  'password', 'otp', 'one-time password', 'social security', 'ssn',
  'credit card number', 'cvv', 'pin number', 'bank account number'
];

// Simple Levenshtein distance — measures how many letter edits apart two strings are
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^\s)>'"]+/g) || [];
  return matches.map(url => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function checkLookalikeDomain(domains) {
  for (const domain of domains) {
    for (const brand of KNOWN_BRANDS) {
      const dist = levenshtein(domain, brand);
      if (dist > 0 && dist <= 2) {
        return { rule: 'lookalike_domain', triggered: true, weight: 30,
          detail: `"${domain}" closely mimics "${brand}"` };
      }
    }
  }
  return { rule: 'lookalike_domain', triggered: false, weight: 0, detail: null };
}

function checkSuspiciousUrls(domains) {
  for (const domain of domains) {
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      return { rule: 'ip_based_url', triggered: true, weight: 25, detail: `Raw IP address used as link: ${domain}` };
    }
    if (SHORTENERS.some(s => domain.includes(s))) {
      return { rule: 'url_shortener', triggered: true, weight: 15, detail: `Shortened link hides real destination: ${domain}` };
    }
    if (SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld))) {
      return { rule: 'suspicious_tld', triggered: true, weight: 15, detail: `Unusual domain ending: ${domain}` };
    }
  }
  return { rule: 'suspicious_url', triggered: false, weight: 0, detail: null };
}

function checkUrgencyLanguage(text) {
  const lower = text.toLowerCase();
  const found = URGENCY_PHRASES.filter(p => lower.includes(p));
  if (found.length > 0) {
    return { rule: 'urgency_language', triggered: true, weight: Math.min(found.length * 8, 20),
      detail: `Pressure language detected: "${found[0]}"` };
  }
  return { rule: 'urgency_language', triggered: false, weight: 0, detail: null };
}

function checkGenericGreeting(text) {
  if (/dear (customer|user|valued customer|sir\/madam|member)/i.test(text)) {
    return { rule: 'generic_greeting', triggered: true, weight: 10, detail: 'Generic greeting instead of your name' };
  }
  return { rule: 'generic_greeting', triggered: false, weight: 0, detail: null };
}

function checkSensitiveInfoRequest(text) {
  const lower = text.toLowerCase();
  const found = SENSITIVE_REQUESTS.filter(p => lower.includes(p));
  if (found.length > 0) {
    return { rule: 'sensitive_info_request', triggered: true, weight: 20,
      detail: `Asks for sensitive info: "${found[0]}"` };
  }
  return { rule: 'sensitive_info_request', triggered: false, weight: 0, detail: null };
}

function getVerdict(score) {
  if (score >= 66) return 'Dangerous';
  if (score >= 31) return 'Suspicious';
  return 'Safe';
}

function analyzeHeuristics(emailText) {
  const domains = extractUrls(emailText);

  const results = [
    checkLookalikeDomain(domains),
    checkSuspiciousUrls(domains),
    checkUrgencyLanguage(emailText),
    checkGenericGreeting(emailText),
    checkSensitiveInfoRequest(emailText)
  ];

  const triggeredFlags = results.filter(r => r.triggered);
  const score = Math.min(triggeredFlags.reduce((sum, r) => sum + r.weight, 0), 100);

  return {
    score,
    verdict: getVerdict(score),
    flags: triggeredFlags
  };
}

module.exports = { analyzeHeuristics };