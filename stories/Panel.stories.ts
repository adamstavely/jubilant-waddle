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

/** Long fake chat for timeline view testing (24 user messages = 24 timeline dots) */
function makeLongChatHistory(): ChatMessage[] {
  const userPrompts = [
    'What are the indemnification clauses?',
    'Summarize the key obligations in section 5.',
    'Who are the parties to this agreement?',
    'What is the term and termination notice period?',
    'Are there any exclusivity provisions?',
    'What happens if there is a breach of confidentiality?',
    'Explain the limitation of liability cap.',
    'What governing law applies to this contract?',
    'Are there any force majeure provisions?',
    'What are the payment terms and schedule?',
    'Is there an audit right for the customer?',
    'What IP ownership is assigned vs licensed?',
    'Describe the warranty and support obligations.',
    'What are the renewal and pricing terms?',
    'Is there a non-compete or non-solicit?',
    'How is dispute resolution handled?',
    'What data protection obligations exist?',
    'Are there any sublicense or assignment restrictions?',
    'What is the scope of the license grant?',
    'Describe the acceptance and testing process.',
    'What insurance requirements are specified?',
    'Are there change order or amendment procedures?',
    'What happens to data upon termination?',
    'Summarize the entire agreement in bullet points.',
  ];
  const assistantReplies = [
    'Section 12 contains the indemnification clause. The vendor indemnifies for IP claims; the customer for misuse.',
    'Section 5 outlines delivery milestones, acceptance criteria, and the 30-day cure period for defects.',
    'The parties are Acme Corp (Customer) and VendorCo LLC (Vendor), both duly organized entities.',
    'The term is 3 years from Effective Date, with 90 days written notice required for non-renewal.',
    'Yes, Section 8 grants the customer a 2-year exclusivity in the North American market.',
    'Breach triggers 30-day cure, then termination and return of confidential materials within 14 days.',
    'Liability is capped at the greater of fees paid in the 12 months prior or $500,000.',
    'The agreement is governed by the laws of the State of Delaware, excluding conflicts principles.',
    'Yes, Section 15 covers force majeure with a 30-day notice and extension of performance deadlines.',
    'Payment is net 30 from invoice; annual fees due in advance; late fees at 1.5% per month.',
    'The customer may audit usage once per year with 30 days notice; vendor bears cost if overage exceeds 5%.',
    'Vendor retains all pre-existing IP; customer receives a license. Custom work is work-for-hire to customer.',
    'Vendor provides 99.5% uptime SLA, 24/7 support, and 4-hour response for critical issues.',
    'Auto-renewal for 1-year periods; pricing may increase up to 5% annually with 60 days notice.',
    'Yes, 2-year non-solicit of employees and 18-month non-compete in the defined territory.',
    'Informal escalation first; then mediation; then binding arbitration under AAA rules.',
    'GDPR-compliant DPA; data processing addendum; subprocessor list available on request.',
    'Neither party may assign without consent except to an affiliate or acquirer of substantially all assets.',
    'Non-exclusive, worldwide, perpetual license to use the software for internal business purposes.',
    '30-day UAT period; acceptance deemed if no written objection; vendor remediates material defects.',
    'Vendor must maintain $2M general liability and $1M cyber; certificates on request.',
    'Change orders in writing; pricing adjustments per mutually agreed rate card.',
    'Customer may export data for 30 days post-termination; then vendor deletes within 60 days.',
    'Key points: 3-year term, mutual indemnity, liability cap, Delaware law, 99.5% SLA, net 30 payment.',
  ];
  const now = Date.now();
  const msPerMsg = 180000;
  const out: ChatMessage[] = [];
  for (let i = 0; i < userPrompts.length; i++) {
    const userTs = new Date(now - (userPrompts.length - i) * msPerMsg).toISOString();
    const asstTs = new Date(new Date(userTs).getTime() + 15000).toISOString();
    out.push({
      id: `long-u-${i + 1}`,
      role: 'user',
      content: userPrompts[i],
      timestamp: userTs,
      contextLevel: i % 3 === 0 ? 'visible' : 'full',
      pageRange: i % 3 === 0 ? { start: 1, end: 5 } : undefined,
    });
    out.push({
      id: `long-a-${i + 1}`,
      role: 'assistant',
      content: assistantReplies[i],
      timestamp: asstTs,
      contextLevel: i % 3 === 0 ? 'visible' : 'full',
      pageRange: i % 3 === 0 ? { start: 1, end: 5 } : undefined,
      modelId: 'arbor-4o',
    });
  }
  return out;
}

const LONG_CHAT_HISTORY = makeLongChatHistory();

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

export const OpenWithLongTimeline: Story = {
  name: 'Panel — open (Chat with long timeline)',
  render: () => html`
    <arbor-ai-assist
      open
      document-id="doc-001"
      document-name="Contract A.pdf"
      .availableModels=${DEFAULT_MODELS}
      .chatHistory=${LONG_CHAT_HISTORY}
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
