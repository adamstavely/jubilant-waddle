import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/index.ts';
import { DEFAULT_MODELS } from '../src/models/chat.js';
import type { ChatMessage } from '../src/models/chat.js';
import type { AgentTask } from '../src/models/agent-task.js';

const SAMPLE_PROMPTS = [
  { id: '1', name: 'Privilege Analysis', content: 'Analyze privilege claims.', type: 'message' as const, scope: 'personal' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Obligation Extraction', content: 'List all obligations.', type: 'message' as const, scope: 'personal' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const SAMPLE_HISTORY: ChatMessage[] = [
  { id: '1', role: 'user', content: 'What are the indemnification clauses?', timestamp: new Date(Date.now() - 3600000).toISOString(), contextLevel: 'full' },
  { id: '2', role: 'assistant', content: 'Section 12 contains the indemnification clause.', timestamp: new Date(Date.now() - 3500000).toISOString(), contextLevel: 'full' },
];

const SAMPLE_AGENT_TASKS: AgentTask[] = [
  { id: 't1', title: 'Auto-Code Batch 04 — Privilege', description: 'Applying coding suggestions', status: 'running', progress: 0.45, scope: 'batch', scopeId: 'batch-04', startedAt: new Date(Date.now() - 120000).toISOString() },
  { id: 't2', title: 'Entity Extraction', description: 'Extracting entities', status: 'queued', scope: 'batch', scopeId: 'batch-04' },
  { id: 't3', title: 'Privilege Log', description: 'Generated privilege log', status: 'completed', scope: 'document', scopeId: 'doc-001', completedAt: new Date(Date.now() - 300000).toISOString(), resultSummary: '12 entries generated.' },
];

const meta: Meta = {
  title: 'Panel',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (story) => html`
      <div style="min-height: 100vh; background: var(--ai-color-bg-base); padding: var(--ai-spacing-xl);">
        ${story()}
      </div>
    `,
  ],
};

export default meta;
type Story = StoryObj;

export const Closed: Story = {
  name: 'Panel — closed',
  render: () => html`
    <arbor-ai-assist
      document-id="doc-001"
      document-name="Contract A.pdf"
      .availableModels=${DEFAULT_MODELS}
    ></arbor-ai-assist>
    <p style="color: var(--ai-color-text-muted); font-size: var(--ai-font-size-sm); margin-top: 16px;">
      Panel is closed. Add open attribute to show.
    </p>
  `,
};

export const OpenChat: Story = {
  name: 'Panel — open (Chat)',
  render: () => html`
    <arbor-ai-assist
      open
      document-id="doc-001"
      document-name="Contract A.pdf"
      .availableModels=${DEFAULT_MODELS}
      .storedPrompts=${SAMPLE_PROMPTS}
    ></arbor-ai-assist>
  `,
};

export const OpenActions: Story = {
  name: 'Panel — open (Actions)',
  render: () => html`
    <arbor-ai-assist
      open
      active-tab="actions"
      document-id="doc-001"
      batch-id="batch-01"
      .availableModels=${DEFAULT_MODELS}
    ></arbor-ai-assist>
  `,
};

export const OpenAgentTasks: Story = {
  name: 'Panel — open (Agent Tasks)',
  render: () => html`
    <arbor-ai-assist
      open
      active-tab="agent-tasks"
      document-id="doc-001"
      .availableModels=${DEFAULT_MODELS}
      .agentTasks=${SAMPLE_AGENT_TASKS}
    ></arbor-ai-assist>
  `,
};

export const OpenWithHistory: Story = {
  name: 'Panel — open (Chat with history)',
  render: () => html`
    <arbor-ai-assist
      open
      document-id="doc-001"
      document-name="Contract A.pdf"
      .availableModels=${DEFAULT_MODELS}
      .chatHistory=${SAMPLE_HISTORY}
    ></arbor-ai-assist>
  `,
};

export const FullState: Story = {
  name: 'Panel — full state',
  render: () => html`
    <arbor-ai-assist
      open
      document-id="doc-001"
      document-name="Contract A.pdf"
      batch-id="batch-01"
      .availableModels=${DEFAULT_MODELS}
      .storedPrompts=${SAMPLE_PROMPTS}
      .chatHistory=${SAMPLE_HISTORY}
      .agentTasks=${SAMPLE_AGENT_TASKS}
      .tokenUsage=${{
        documentTokens: 8200,
        historyTokens: 3500,
        systemTokens: 640,
        totalUsed: 12340,
        contextLimit: 128000,
        remaining: 115660,
        lastUpdated: new Date().toISOString(),
      }}
    ></arbor-ai-assist>
  `,
};
