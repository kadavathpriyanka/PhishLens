async function analyzeLLM(emailText, heuristicFlags) {
  const apiKey = process.env.GROQ_API_KEY;
console.log('Key loaded:', apiKey ? `${apiKey.slice(0, 8)}... length: ${apiKey.length}` : 'MISSING');
  const flagsSummary = heuristicFlags.length > 0
    ? heuristicFlags.map(f => `- ${f.rule}: ${f.detail}`).join('\n')
    : 'None detected by rule-based checks.';

  const prompt = `You are a phishing detection assistant. Analyze the email below for signs of phishing or scam intent. Rule-based checks already found these flags:
${flagsSummary}

Email:
"""
${emailText}
"""

Respond with ONLY valid JSON, no markdown formatting, no extra text, in exactly this shape:
{"llm_risk_score": <integer 0-100>, "reasoning": "<2-3 sentence explanation>", "additional_flags": ["<short phrase>", ...]}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return fallbackResult();
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;

    if (!rawText) {
      console.error('Groq returned no usable text:', JSON.stringify(data));
      return fallbackResult();
    }

    const parsed = JSON.parse(rawText);
    return {
      llm_risk_score: parsed.llm_risk_score ?? 0,
      reasoning: parsed.reasoning ?? 'No reasoning provided.',
      additional_flags: parsed.additional_flags ?? []
    };

  } catch (err) {
    console.error('LLM call failed:', err.message);
    return fallbackResult();
  }
}

function fallbackResult() {
  return {
    llm_risk_score: 0,
    reasoning: 'AI analysis unavailable — showing rule-based results only.',
    additional_flags: []
  };
}

module.exports = { analyzeLLM };