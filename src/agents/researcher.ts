import type { Memory } from '../core/memory.js';
import { webSearch } from '../connectors/web.js';
import { geminiComplete } from '../connectors/gemini.js';

export const Researcher = {
  async discover({ task, memory }: { task: string; memory: Memory }) {
    const results = await webSearch(task);
    await memory.append({ type: 'research', task, results });
    let summary = 'No Gemini summary (missing key).';
    try {
      summary = await geminiComplete(`Summarize how these URLs relate to: "${task}"\n` + results.map(r => `${r.title} - ${r.url}`).join('\n'));
    } catch {}
    await memory.append({ type: 'research-summary', task, summary });
    return `[Researcher] Found ${results.length} results.\nSummary: ${summary.slice(0, 500)}...`;
  }
};
