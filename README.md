# PhishLens 🔍

A real-time phishing email detection tool that combines rule-based heuristics with AI analysis to score and explain email threats instantly.

**Live Demo:** https://phishlens.netlify.app

---

## What it does

Paste any suspicious email and PhishLens returns:
- A **0–100 risk score** with a visual gauge
- A **verdict** — Safe, Suspicious, or Dangerous
- A breakdown of **exactly why** it flagged the email
- An **AI-generated explanation** of the threat in plain English

---

## How it works

PhishLens uses a two-layer detection engine:

**Layer 1 — Heuristic engine (rule-based)**
- Lookalike domain detection (e.g. `paypa1.com` mimicking `paypal.com`) using Levenshtein distance
- Raw IP address links instead of real domains
- URL shorteners hiding real destinations
- Suspicious TLDs (`.xyz`, `.tk`, `.top` etc.)
- Urgency and pressure language detection
- Generic greeting detection ("Dear Customer")
- Sensitive information requests (password, OTP, SSN, card number)

**Layer 2 — AI analysis (Groq + LLaMA 3.1)**
- Sends the email text plus heuristic flags as context to an LLM
- Returns an independent risk score, plain-English reasoning, and additional flags the rules may have missed
- Falls back gracefully if the API is unavailable

**Score combiner**
Final score = `0.6 × heuristic score + 0.4 × AI score`
Certain high-confidence flags (like a confirmed lookalike domain) enforce a minimum score floor regardless of the blend.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| AI | Groq API (LLaMA 3.1 8B Instant) |
| Deployment | Netlify (frontend), Render (backend) |

---

## Features

- Live demo-friendly — paste any real email and get scored in seconds
- Explainable results — every flag shows exactly what triggered it and why
- Hybrid detection — rules catch known patterns, AI catches novel social engineering
- Graceful fallback — if AI is unavailable, heuristic results still display
- Pre-loaded examples — one-click test with Microsoft phish, bank phish, or a legit email

---

## Run locally

**Prerequisites:** Node.js installed

```bash
# Clone the repo
git clone https://github.com/kadavathpriyanka/PhishLens.git
cd PhishLens/backend

# Install dependencies
npm install

# Create .env file
echo "GROQ_API_KEY=your_key_here" > .env

# Start the backend
npm run dev
```

Then open `frontend/index.html` with Live Server in VS Code.

Get a free Groq API key at https://console.groq.com

---

## Project structure
phishlens/

├── backend/

│   ├── server.js          # Express server, POST /analyze route

│   ├── heuristics.js      # Rule-based detection engine

│   ├── llmAnalyze.js      # Groq API integration

│   ├── scoreCombiner.js   # Weighted score merger

│   └── .env               # API keys (not committed)

└── frontend/

├── index.html         # UI structure

├── style.css          # Dark theme design system

└── script.js          # Fetch, render, example buttons


---

## Built by

Kadavath Priyanka — B.Tech CSE, BVRIT Hyderabad