import { webSearch, httpGet } from '../connectors/web.js';
import { geminiComplete } from '../connectors/gemini.js';
type Req = { jsonrpc: '2.0'; id: number|string; method: string; params?: any };
type Res = { jsonrpc: '2.0'; id: number|string; result?: any; error?: { code: number; message: string } };

const stdin = process.stdin; const stdout = process.stdout; stdin.setEncoding('utf8');
const methods: Record<string, Function> = {
  'web.search': async (p: { query: string }) => webSearch(p.query),
  'http.get': async (p: { url: string }) => httpGet(p.url),
  'gemini.complete': async (p: { prompt: string, model?: string }) => geminiComplete(p.prompt, p.model),
  'ping': async () => 'pong'
};
let buffer = '';
stdin.on('data', async (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  for (const line of lines.slice(0, -1)) {
    const trimmed = line.trim(); if (!trimmed) continue;
    let req: Req; try { req = JSON.parse(trimmed); } catch { write({ jsonrpc:'2.0', id:null as any, error:{code:-32700,message:'Parse error'}}); continue; }
    const fn = methods[req.method]; if (!fn) { write({ jsonrpc:'2.0', id:req.id, error:{code:-32601,message:'Method not found'}}); continue; }
    try { const result = await fn(req.params||{}); write({ jsonrpc:'2.0', id:req.id, result }); }
    catch (e:any) { write({ jsonrpc:'2.0', id:req.id, error:{code:-32000, message:e.message||'Internal error'}}); }
  }
  buffer = lines[lines.length-1];
});
function write(msg: Res){ stdout.write(JSON.stringify(msg)+'\n'); }
