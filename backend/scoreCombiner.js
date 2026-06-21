function getVerdict(score) {
  if (score >= 66) return 'Dangerous';
  if (score >= 31) return 'Suspicious';
  return 'Safe';
}

function combineScores(heuristicResult, llmResult) {
  const blendedScore = Math.round(
    0.6 * heuristicResult.score + 0.4 * llmResult.llm_risk_score
  );

  // Hard floor: a confirmed lookalike domain should never read as fully "Safe",
  // even if the blended average drifts low
  const hasLookalike = heuristicResult.flags.some(f => f.rule === 'lookalike_domain');
  const finalScore = hasLookalike ? Math.max(blendedScore, 60) : blendedScore;
  const cappedScore = Math.min(finalScore, 100);

  return {
    score: cappedScore,
    verdict: getVerdict(cappedScore),
    heuristic_flags: heuristicResult.flags,
    ai_reasoning: llmResult.reasoning,
    ai_additional_flags: llmResult.additional_flags
  };
}

module.exports = { combineScores };