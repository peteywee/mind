import type { Memory } from '../core/memory.js';

import { ViabilityAnalyst } from './viability.js';
import { ExecutionDesigner } from './executionDesigner.js';
import { PMO } from './pmo.js';
import { OperationsArchitect } from './operationsArchitect.js';
import { CommunicationStrategist } from './communicationStrategist.js';
import { ExecutionAuditor } from './executionAuditor.js';
import { Researcher } from './researcher.js';

export type AgentFn = (ctx: { task: string; memory: Memory }) => Promise<string>;
export type Agent = Record<string, AgentFn>;

export const agents: Record<string, Agent> = {
  Researcher,
  ViabilityAnalyst,
  ExecutionDesigner,
  PMO,
  OperationsArchitect,
  CommunicationStrategist,
  ExecutionAuditor,
};

export { Researcher, ViabilityAnalyst, ExecutionDesigner, PMO, OperationsArchitect, CommunicationStrategist, ExecutionAuditor };
