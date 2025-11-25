// server.js
// Node + Express server for the "Gen Jargon Translator" web app.
//
// Requirements:
// - Uses express + cors + dotenv.
// - Serves static files from ./public.
// - Defines POST /api/translate that expects JSON:
//     { text: string, mode: "old_to_young" | "young_to_old" | "auto", options?: { max_cringe?: number, include_explanations?: boolean } }
// - Uses the OpenAI Node SDK configured for Perplexity:
//     apiKey: process.env.PERPLEXITY_API_KEY (or HARDCODED_API_KEY below)
//     baseURL: "https://api.perplexity.ai"
// - Calls the chat completions endpoint with messages (system + user).
// - Asks the model to return JSON with shape:
//     { mode, variants: [{ label, text }], explanations?: [{ original?, translated?, note }] }
// - If the response is not valid JSON, falls back to wrapping the raw text.
// - Handles errors gracefully and returns 500 on failure.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// If you intentionally want the key baked into the code, set this string.
// Leaving it empty will rely on PERPLEXITY_API_KEY from env.
const HARDCODED_API_KEY = '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';
const apiKey = process.env.PERPLEXITY_API_KEY || HARDCODED_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Perplexity via OpenAI-compatible SDK
const client = new OpenAI({
  apiKey,
  baseURL: 'https://api.perplexity.ai'
});

// Build messages for the model
function buildMessages({ text, mode, options }) {
  const maxCringe = options?.max_cringe ?? 0.7;
  const includeExplanations = options?.include_explanations ?? true;

  const systemPrompt = `
You are an AI "Generational Jargon Translator."

Your job:
- Convert text between corporate / formal / boomer style and Gen Z / internet slang.
- Preserve meaning but change tone, voice, and vocabulary.
- Modes:
  - "old_to_young": corporate -> Gen Z / internet.
  - "young_to_old": Gen Z / internet -> professional / corporate.
- If mode is "auto", guess which direction makes more sense and choose "old_to_young" or "young_to_old".

Output format:
Return ONLY valid JSON (no markdown, no code fences) with this shape:
{
  "mode": "old_to_young" | "young_to_old",
  "variants": [
    { "label": "string", "text": "string" }
  ],
  "explanations": [
    { "original": "string", "translated": "string", "note": "string" }
  ]
}

Rules:
- Avoid slurs, hate speech, and explicit sexual content.
- If the input is very toxic or harmful, do NOT escalate it. Instead, rewrite it into a respectful, de-escalated version and mention that in "note".
- "max_cringe" is a number from 0 to 1. Higher = more exaggerated slang or formality. Use it to decide how wild the style can get.
- If include_explanations is true, add a few entries explaining key slang or phrasing changes.
  `.trim();

  const userPayload = {
    text,
    mode,
    options: { max_cringe: maxCringe, include_explanations: includeExplanations }
  };

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(userPayload) }
  ];
}

// Extract JSON even if the model wraps it in ```json fences
function parseModelJson(raw, fallbackMode) {
  if (!raw || typeof raw !== 'string') {
    return {
      mode: fallbackMode,
      variants: [{ label: 'Default', text: '' }],
      explanations: []
    };
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : raw;

  try {
    return JSON.parse(candidate);
  } catch (e) {
    console.warn('Model returned non-JSON, falling back:', raw);
    return {
      mode: fallbackMode,
      variants: [{ label: 'Default', text: raw }],
      explanations: []
    };
  }
}

app.post('/api/translate', async (req, res) => {
  try {
    const { text, mode = 'old_to_young', options = {} } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" field.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'No Perplexity API key configured.' });
    }

    const messages = buildMessages({ text, mode, options });

    const completion = await client.chat.completions.create({
      model: 'sonar', // or sonar-pro / other Perplexity model you have access to
      messages,
      temperature: options.max_cringe ?? 0.7
    });

    const raw = completion.choices?.[0]?.message?.content || '';
    const parsed = parseModelJson(raw, mode);

    res.json(parsed);
  } catch (err) {
    console.error('Error in /api/translate:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(port, () => {
  console.log(`Generational Jargon Translator listening on port ${port}`);
});
