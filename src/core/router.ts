import { agents } from '../agents/index.js';
import type { Memory } from './memory.js';

type AgentFn = (ctx: { task: string; memory: Memory }) => Promise<string>;
type Agent = Record<string, AgentFn>;
const agentMap: Record<string, Agent> = agents as unknown as Record<string, Agent>;

export async function routeToAgent(agentName: string, action: string, ctx: { task: string; memory: Memory }) {
  const agent = agentMap[agentName];
  if (!agent) return `[${agentName}] not implemented`;
  const fn = agent[action] as AgentFn | undefined;
  if (typeof fn !== 'function') return `[${agentName}] action '${action}' not implemented`;
  return await fn(ctx);
}
