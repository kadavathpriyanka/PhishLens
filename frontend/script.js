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
const resetBtn = document.getElementById('resetBtn');

const EXAMPLES = {
  microsoft: `Dear User, we noticed a sign-in attempt to your Microsoft account from an unfamiliar device. To secure your account, please verify your identity immediately at: http://micros0ft-secure.xyz/verify-account\nFailure to verify within 24 hours will result in account suspension.\nMicrosoft Security Team`,
  bank: `Dear Valued Customer, your Chase bank account has been temporarily limited.\nTo restore full access click here: http://192.168.4.23/chase/restore\nWe need your social security number and pin number to confirm your identity.\nChase Customer Support`,
  clean: `Hi Priya, your order #45123 has been shipped and will arrive by Thursday.\nTrack your package at amazon.com/orders. Thanks for shopping with us!\nAmazon Customer Service`
};

document.querySelectorAll('.example-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    emailInput.value = EXAMPLES[btn.dataset.example];
    resultCard.classList.add('hidden');
    resetBtn.classList.add('hidden');
  });
});

resetBtn.addEventListener('click', () => {
  emailInput.value = '';
  resultCard.classList.add('hidden');
  resetBtn.classList.add('hidden');
  emailInput.focus();
});

analyzeBtn.addEventListener('click', async () => {
  const emailText = emailInput.value;
  if (!emailText.trim()) return;

  resultCard.classList.add('hidden');
  resetBtn.classList.add('hidden');
  loadingState.classList.remove('hidden');
  loadingState.textContent = 'Scanning email for risk signals...';
  analyzeBtn.textContent = 'Analyzing...';
  analyzeBtn.disabled = true;
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
    resetBtn.classList.remove('hidden');
  } catch (err) {
    loadingState.textContent = 'Error connecting to server. Is the backend running?';
  } finally {
    inputWrapper.classList.remove('scanning');
    analyzeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/><line x1="15.3" y1="15.3" x2="21" y2="21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> Analyze Email`;
    analyzeBtn.disabled = false;
  }
});

function renderResult(data) {
  scoreNumber.textContent = data.score;
  scoreCircle.style.setProperty('--score-percent', data.score);

  const verdictClass = data.verdict.toLowerCase();
  scoreCircle.className = 'score-circle ' + verdictClass;
  verdictLabel.className = 'verdict ' + verdictClass;
  verdictLabel.textContent = data.verdict;

  flagsList.innerHTML = '';

  if (!data.heuristic_flags || data.heuristic_flags.length === 0) {
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

  if (data.ai_additional_flags && data.ai_additional_flags.length > 0) {
    data.ai_additional_flags.forEach(flag => {
      const li = document.createElement('li');
      li.className = 'ai-flag';
      li.textContent = '✦ ' + flag.replace(/_/g, ' ');
      flagsList.appendChild(li);
    });
  }

  aiReasoning.textContent = data.ai_reasoning;
}