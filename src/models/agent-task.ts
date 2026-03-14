/**
 * Agent task model for AI Assist Panel Agent Tasks tab
 */

export type AgentTaskStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AgentTaskAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary';
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: AgentTaskStatus;
  progress?: number; // 0.0–1.0, when status === 'running'
  startedAt?: string; // ISO 8601
  completedAt?: string; // ISO 8601
  scope: 'document' | 'batch';
  scopeId: string;
  resultSummary?: string;
  errorMessage?: string;
  actions?: AgentTaskAction[];
}
