import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/index.ts';
import { DEFAULT_MODELS } from '../src/models/chat.js';
import type { ChatMessage } from '../src/models/chat.js';

const NOW = new Date().toISOString();
const HOUR_AGO = new Date(Date.now() - 3600000).toISOString();

const HISTORY: ChatMessage[] = [
  { id: 'h1', role: 'user', content: 'What indemnification obligations exist in section 12?', timestamp: HOUR_AGO, contextLevel: 'full' },
  { id: 'h2', role: 'assistant', content: 'Section 12 establishes mutual indemnification obligations. The vendor must indemnify the customer for IP infringement claims, and the customer must indemnify the vendor for misuse of the software.', timestamp: HOUR_AGO, contextLevel: 'full', modelId: 'arbor-4o' },
];

const meta: Meta = {
  title: 'Chat/Session',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const HistoryRestored: Story = {
  name: 'Session — history restored',
  render: () => html`
    <arbor-ai-assist
      open
      document-id="doc-001"
      document-name="Contract A.pdf"
      .availableModels=${DEFAULT_MODELS}
      .chatHistory=${HISTORY}
    ></arbor-ai-assist>
  `,
};

export const ClearConfirmation: Story = {
  name: 'Session — clear confirmation',
  render: () => html`
    <div style="padding: var(--ai-spacing-xl);">
      <arbor-ai-assist
        open
        document-id="doc-001"
        document-name="Contract A.pdf"
        .availableModels=${DEFAULT_MODELS}
        .chatHistory=${HISTORY}
      ></arbor-ai-assist>
      <p style="color: var(--ai-color-text-muted); font-family: var(--ai-font-family-mono); font-size: var(--ai-font-size-xs); margin-top: 16px;">
        Click the History button chevron and select "Clear history…" to trigger the confirmation toast.
      </p>
    </div>
  `,
};
