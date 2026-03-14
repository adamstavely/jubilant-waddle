import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/index.ts';
import { DEFAULT_MODELS, DEFAULT_SETTINGS } from '../src/models/chat.js';
import type { ChatMessage } from '../src/models/chat.js';

const SAMPLE_PROMPTS = [
  { id: '1', name: 'Privilege Analysis', description: 'Analyze privilege claims', content: 'Review this document for attorney-client privilege assertions and evaluate their validity.', type: 'message' as const, scope: 'personal' as const, tags: ['legal', 'privilege'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Obligation Extraction', description: 'Extract obligations', content: 'List all obligations in this contract with party responsible and deadline.', type: 'message' as const, scope: 'personal' as const, tags: ['contract'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Risk Summary', description: 'Summarize legal risks', content: 'Summarize the key legal risks in this document.', type: 'both' as const, scope: 'team' as const, tags: ['risk'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const SAMPLE_HISTORY: ChatMessage[] = [
  { id: '1', role: 'user', content: 'What are the indemnification clauses in this contract?', timestamp: new Date(Date.now() - 3600000).toISOString(), contextLevel: 'full' },
  { id: '2', role: 'assistant', content: 'Section 12 contains the indemnification clause. The vendor agrees to indemnify the customer for losses arising from gross negligence or willful misconduct.', timestamp: new Date(Date.now() - 3500000).toISOString(), contextLevel: 'full' },
];

const meta: Meta = {
  title: 'Chat/Control Bar',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Control Bar — default',
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

export const ContextOff: Story = {
  name: 'Control Bar — context off',
  render: () => html`
    <arbor-ai-assist
      open
      document-id="doc-001"
      document-name="Contract A.pdf"
      context-level="none"
      .contextLevel=${'none'}
      .availableModels=${DEFAULT_MODELS}
    ></arbor-ai-assist>
  `,
};

export const HistoryOff: Story = {
  name: 'Control Bar — history off',
  render: () => html`
    <arbor-ai-assist
      open
      document-id="doc-001"
      document-name="Contract A.pdf"
      .historyPersist=${false}
      .availableModels=${DEFAULT_MODELS}
    ></arbor-ai-assist>
  `,
};

export const FullState: Story = {
  name: 'Control Bar — full state',
  render: () => html`
    <arbor-ai-assist
      open
      document-id="doc-001"
      document-name="Contract A.pdf"
      .availableModels=${DEFAULT_MODELS}
      .storedPrompts=${SAMPLE_PROMPTS}
      .chatHistory=${SAMPLE_HISTORY}
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
