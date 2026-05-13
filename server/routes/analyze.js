const express = require('express');
const router = express.Router();
const { buildAnalysisPrompt } = require('../prompts/analysisPrompt');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

async function callOllama(prompt, model = OLLAMA_MODEL) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,   // Low temperature for consistent structured output
        top_p: 0.9,
        num_predict: 4096
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.response;
}

function extractJSON(raw) {
  // Strategy 1: direct parse
  try {
    return JSON.parse(raw.trim());
  } catch (_) {}

  // Strategy 2: strip markdown fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {}
  }

  // Strategy 3: find first { ... last }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch (_) {}
  }

  return null;
}

function validateAnalysis(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.score || typeof obj.score.value !== 'number') return false;
  if (!Array.isArray(obj.evidence)) return false;
  if (!Array.isArray(obj.followUpQuestions)) return false;
  return true;
}

// GET /api/analyze/models — list available Ollama models
router.get('/models', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) throw new Error('Cannot reach Ollama');
    const data = await response.json();
    const models = (data.models || []).map(m => m.name);
    res.json({ models, currentModel: OLLAMA_MODEL });
  } catch (err) {
    res.status(503).json({ error: 'Ollama not reachable', detail: err.message });
  }
});

// POST /api/analyze — main analysis endpoint
router.post('/', async (req, res) => {
  const { transcript, model } = req.body;

  if (!transcript || transcript.trim().length < 50) {
    return res.status(400).json({ error: 'Transcript too short or missing.' });
  }

  const selectedModel = model || OLLAMA_MODEL;
  const prompt = buildAnalysisPrompt(transcript.trim());

  let lastError = null;

  // Two attempts: first try, then retry with stronger JSON instruction
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const finalPrompt = attempt === 1
        ? prompt
        : prompt + '\n\nIMPORTANT: Your previous response could not be parsed as JSON. Return ONLY the raw JSON object. Do not include any text, explanation, or markdown formatting. Start your response with { and end with }.';

      const raw = await callOllama(finalPrompt, selectedModel);
      const parsed = extractJSON(raw);

      if (!parsed) {
        lastError = `Attempt ${attempt}: Could not extract JSON from model response`;
        continue;
      }

      if (!validateAnalysis(parsed)) {
        lastError = `Attempt ${attempt}: JSON missing required fields (score.value, evidence, followUpQuestions)`;
        continue;
      }

      // Enrich with metadata
      return res.json({
        success: true,
        model: selectedModel,
        attempt,
        analysis: parsed,
        rawLength: raw.length
      });

    } catch (err) {
      lastError = `Attempt ${attempt}: ${err.message}`;
    }
  }

  // Both attempts failed
  return res.status(500).json({
    error: 'Analysis failed after 2 attempts.',
    detail: lastError,
    suggestion: 'Check that Ollama is running and the model is downloaded.'
  });
});

module.exports = router;
