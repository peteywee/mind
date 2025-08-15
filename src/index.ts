import 'dotenv/config';
import { orchestrate } from './core/orchestrator.js';
import { createMemory } from './core/memory.js';

const taskFlag = process.argv.indexOf('--task');
const task = taskFlag >= 0 ? process.argv[taskFlag + 1] : 'Run sample evaluation plan.';
const memory = createMemory({ filename: '.data/memory.json' });

(async () => { await orchestrate({ task, memory }); })().catch((e) => { console.error(e); process.exit(1); });
