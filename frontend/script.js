const analyzeBtn = document.getElementById('analyzeBtn');
const emailInput = document.getElementById('emailInput');
const loadingState = document.getElementById('loadingState');
const resultCard = document.getElementById('resultCard');
const scoreNumber = document.getElementById('scoreNumber');
const scoreCircle = document.getElementById('scoreCircle');
const verdictLabel = document.getElementById('verdictLabel');
const flagsList = document.getElementById('flagsList');
const aiReasoning = document.getElementById('aiReasoning');

const inputWrapper = document.getElementById('inputWrapper');

analyzeBtn.addEventListener('click', async () => {
  const emailText = emailInput.value;
  if (!emailText.trim()) return;

  resultCard.classList.add('hidden');
  loadingState.classList.remove('hidden');
  inputWrapper.classList.add('scanning');

  try {
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailText })
    });
    const data = await response.json();
    renderResult(data);
    loadingState.classList.add('hidden');
    resultCard.classList.remove('hidden');
  } catch (err) {
    loadingState.textContent = 'Error: ' + err.message;
  } finally {
    inputWrapper.classList.remove('scanning');
  }
});
 

function renderResult(data) {
  scoreNumber.textContent = data.score;
  scoreCircle.style.setProperty('--score-percent', data.score);
  verdictLabel.textContent = data.verdict;

  const verdictClass = data.verdict.toLowerCase();
  scoreCircle.className = 'score-circle ' + verdictClass;
  verdictLabel.className = 'verdict ' + verdictClass;

  flagsList.innerHTML = '';

  if (data.heuristic_flags.length === 0) {
    const li = document.createElement('li');
    li.className = 'no-flags';
    li.textContent = 'No rule-based red flags detected';
    flagsList.appendChild(li);
  } else {
    data.heuristic_flags.forEach(flag => {
      const li = document.createElement('li');
      li.textContent = flag.detail;
      flagsList.appendChild(li);
    });
  }

  if (data.ai_additional_flags) {
    data.ai_additional_flags.forEach(flag => {
      const li = document.createElement('li');
      li.className = 'ai-flag';
      li.textContent = flag.replace(/_/g, ' ');
      flagsList.appendChild(li);
    });
  }

  aiReasoning.textContent = data.ai_reasoning;
}