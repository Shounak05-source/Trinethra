# Trinethra — Fellow Performance Analyzer

> AI-assisted supervisor feedback analysis tool for DeepThought's Trinethra module.  
> The AI suggests. The intern decides.

---

## What This Does

A psychology intern pastes a supervisor transcript (10-15 min call about a Fellow's performance) into the left panel and clicks **Run Analysis**. The tool sends it to a local Ollama LLM, which returns a structured draft assessment:

- **Rubric Score** (1–10) with justification and confidence level
- **Extracted Evidence** — specific quotes tagged by signal (positive/negative), layer (execution vs. systems), and dimension
- **KPI Mapping** — which business outcomes the Fellow's work connects to
- **Gap Analysis** — which of the 4 assessment dimensions the transcript didn't cover
- **Follow-up Questions** — 3–5 targeted questions for the next supervisor call

The intern can edit the score directly and copy questions. The UI is designed to prevent automation bias — it's clearly labeled "AI Draft · Review Required" throughout.

---

## Setup Instructions

### Prerequisites

- Node.js v18+
- [Ollama](https://ollama.com) installed and running

### Step 1: Install and start Ollama

```bash
# Download from https://ollama.com and install
# Then pull a model (llama3.2 is recommended — fast and good enough):
ollama pull llama3.2

# Ollama starts automatically after install. If not:
ollama serve
```

### Step 2: Clone and install dependencies

```bash
git clone <your-repo-url>
cd trinethra

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 3: Start the backend

```bash
cd server
npm start
# Server runs at http://localhost:3001
```

### Step 4: Start the frontend

```bash
cd client
npm run dev
# App runs at http://localhost:5173
```

### Step 5: Open the app

Go to `http://localhost:5173`. Click **Load sample** to try one of the 3 test transcripts.if load sample doesnt show reduce the window to 75% and then you can see the sample transcript. otherwise you can manually write the transcript in the textbox and analyze

---

## Which Ollama Model and Why

**Default: `llama3.2` (3B)**

Chosen for three reasons:
1. **Speed** — runs in ~30s on a laptop with 8GB RAM. A 10-min transcript analysis should take under 60 seconds.
2. **Instruction following** — reliably returns JSON when explicitly instructed to.
3. **Reasoning quality** — the 3B model is sufficient for evidence extraction and rubric mapping when the prompt does the heavy lifting.

If your machine is slow: try `phi3` (3.8B) or `gemma:2b`.  
If you want higher quality: try `mistral` (7B) — better at nuanced reasoning but slower.

You can switch models from the dropdown in the top-right header. The UI auto-detects all models you have installed.

---

## Architecture Overview

```
Browser (React, Vite, port 5173)
        ↕  /api/* (proxied by Vite)
Express Server (Node.js, port 3001)
        ↕  POST http://localhost:11434/api/generate
Ollama (local LLM daemon)
```

- **Frontend** (`client/src/`): React with Vite. Split-panel layout — transcript input on left, results on right. Pure CSS (no Tailwind). Fonts from Google Fonts (DM Serif Display, DM Mono, DM Sans).
- **Backend** (`server/`): Express.js with two routes — `POST /api/analyze` (main) and `GET /api/analyze/models` (Ollama health + model list). No database.
- **Prompt** (`server/prompts/analysisPrompt.js`): The rubric JSON is injected inline. Bias correction instructions are explicit. Output schema is strict.
- **Data** (`server/data/`): `rubric.json` and `sample-transcripts.json` loaded at runtime.

---

## Design Challenges Tackled

### Challenge 1: One Prompt vs Many — Decision: One Prompt

A single prompt with the full rubric injected inline. Reasoning:
- The 5 output sections (score, evidence, KPIs, gaps, questions) are interdependent — the follow-up questions should reference the same gaps found during evidence extraction. Splitting into multiple prompts would require passing state between calls.
- For a 10–15 min transcript (typically 400–800 words), a single prompt gives the model full context at once.
- Tradeoff acknowledged in the prompt: temperature is set to 0.2 (not 0) to balance consistency with some flexibility in evidence interpretation.

### Challenge 4: Showing Uncertainty — Decision: Three signals

The UI communicates "this is a draft" in three ways:
1. **Header badge**: "AI DRAFT · REVIEW REQUIRED" always visible
2. **Yellow notice bar** at top of results panel, every time
3. **Confidence field** on the score card (high/medium/low) — the model is explicitly asked to self-assess confidence, and low confidence scores are flagged with additional text
4. **Editable score** — the intern can type a different score directly; an "Edited" badge appears when they've overridden the AI

This is deliberate UX for preventing automation bias.

---

## What I'd Improve With More Time

1. **Side-by-side transcript + evidence linking** — highlight the exact transcript passage when a quote is hovered in the Evidence section
2. **Structured output via Ollama's native JSON mode** — newer Ollama versions support `format: "json"` which would eliminate the JSON extraction fallback logic
3. **Multi-turn correction** — if the intern changes the score, send a second prompt: "The intern disagrees with your score of 6 and says it should be 7. Explain what evidence supports a 7." This creates a dialogue instead of a one-shot analysis
4. **History panel** — store the last 5 analyses in localStorage so the intern can compare transcripts for the same Fellow across calls
5. **Confidence-weighted gap detection** — currently the model is asked to detect gaps (absence of information). This is hard for LLMs. A more reliable approach: check the output `gaps` array against a deterministic rule (e.g., if no evidence item has `dimension: "change_management"`, force a gap for that dimension)

---

## Project Structure

```
trinethra/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx / App.css
│       ├── index.css          ← design tokens, global styles
│       └── components/
│           ├── Header.jsx         ← Ollama status, model selector, draft badge
│           ├── TranscriptInput.jsx ← textarea + sample loader
│           ├── AnalysisPanel.jsx  ← orchestrates all result sections
│           ├── ScoreCard.jsx      ← editable score, bias alerts
│           ├── EvidenceList.jsx   ← quotes with layer/signal tags
│           ├── KpiMapping.jsx     ← KPI impact display
│           ├── GapAnalysis.jsx    ← missing dimensions
│           └── FollowUpQuestions.jsx ← copyable questions
├── server/
│   ├── index.js               ← Express entry point
│   ├── routes/
│   │   └── analyze.js         ← /api/analyze + /api/analyze/models
│   ├── prompts/
│   │   └── analysisPrompt.js  ← the full analysis prompt (most important file)
│   └── data/
│       ├── rubric.json
│       └── sample-transcripts.json
└── README.md
```

---

## Testing Against Sample Transcripts

The 3 sample transcripts are loaded via the "Load sample" button. Expected behavior:

| Fellow | Expected Score | Common Trap |
|--------|--------------|-------------|
| Karthik (Veerabhadra Auto) | 6–7 | Warm supervisor → lazy tool gives 8. Correct score: 6 (one Layer 2 signal) |
| Meena (Lakshmi Textiles) | 7–8 | Critical supervisor → lazy tool gives 4. Correct score: 7 (real systems, presence bias masking) |
| Anil (Prabhat Foods) | 5–6 | Glowing supervisor → lazy tool gives 9. Correct score: 5–6 (task absorption, dependency trap) |

If the tool gets all three roughly right (±1), the prompt engineering is working.
