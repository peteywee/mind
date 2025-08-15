import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { orchestrate } from './core/orchestrator.js';
import { webSearch, httpGet } from './connectors/web.js';
import { geminiComplete } from './connectors/gemini.js';
import { createMemory } from './core/memory.js';
import compliance from './routes/compliance.js';
import docs from './routes/docs.js';
import envcheck from './routes/envcheck.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Global security headers for ALL routes
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; form-action 'self'");
  next();
});

// Mount compliance and docs
app.use('/', compliance);
app.use('/', docs);
app.use('/', envcheck);

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Orchestrate
app.post('/orchestrate/run', async (req, res) => {
  try {
    const { task } = req.body || {};
    if (!task || typeof task !== 'string') return res.status(400).json({ error: 'Missing task' });
    const memory = createMemory({ filename: '.data/memory.json' });
    const before = await memory.readAll();
    await orchestrate({ task, memory });
    const after = await memory.readAll();
    const diff = after.slice(before.length);
    res.json({ task, outputs: diff, runId: Date.now().toString(), ts: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
});

// Web search
app.get('/web/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toString();
    if (!q) return res.status(400).json({ error: 'Missing q' });
    const provider = req.query.provider ? (req.query.provider as 'serpapi' | 'duckduckgo') : undefined;
    const results = await webSearch(q, { provider });
    res.json(results);
  } catch (e: any) { res.status(500).json({ error: e?.message || 'Internal error' }); }
});

// HTTP fetch
app.get('/http/get', async (req, res) => {
  try {
    const url = (req.query.url || '').toString();
    if (!url) return res.status(400).json({ error: 'Missing url' });
    const out = await httpGet(url);
    res.json(out);
  } catch (e: any) { res.status(500).json({ error: e?.message || 'Internal error' }); }
});

// Gemini
app.post('/llm/gemini/complete', async (req, res) => {
  try {
    const { prompt, model } = req.body || {};
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Missing prompt' });
    const text = await geminiComplete(prompt, model);
    res.json({ text });
  } catch (e: any) { res.status(500).json({ error: e?.message || 'Internal error' }); }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
