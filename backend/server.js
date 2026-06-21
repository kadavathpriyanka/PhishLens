const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { analyzeHeuristics } = require('./heuristics');
const { analyzeLLM } = require('./llmAnalyze');
const { combineScores } = require('./scoreCombiner');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { emailText } = req.body;

  if (!emailText || emailText.trim().length === 0) {
    return res.status(400).json({ error: 'No email text provided' });
  }

  const heuristicResult = analyzeHeuristics(emailText);
  const llmResult = await analyzeLLM(emailText, heuristicResult.flags);
  const finalResult = combineScores(heuristicResult, llmResult);

  res.json(finalResult);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`PhishLens backend running on http://localhost:${PORT}`));