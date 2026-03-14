import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/index.ts';
import type { StoredPrompt } from '../src/models/chat.js';

const NOW = new Date().toISOString();

const PROMPTS: StoredPrompt[] = [
  { id: 'p1', name: 'Privilege Check', description: 'Evaluate attorney-client privilege', content: 'Analyze privilege claims in this document.', type: 'message', scope: 'personal', tags: ['legal', 'privilege'], createdAt: NOW, updatedAt: NOW },
  { id: 'p2', name: 'Obligation List', description: 'Extract all obligations', content: 'List obligations by party.', type: 'message', scope: 'personal', tags: ['contract'], createdAt: NOW, updatedAt: NOW },
  { id: 'p3', name: 'Risk Summary', description: 'Legal risk overview', content: 'Summarize key risks.', type: 'both', scope: 'personal', tags: ['risk'], createdAt: NOW, updatedAt: NOW },
  { id: 't1', name: 'Standard NDA Review', description: 'Organization NDA template review', content: 'Review this NDA against our standard template and flag deviations.', type: 'message', scope: 'team', tags: ['nda', 'review'], createdAt: NOW, updatedAt: NOW, authorName: 'Legal Ops' },
  { id: 't2', name: 'GDPR Compliance Check', description: 'Check for GDPR compliance', content: 'Identify any GDPR compliance issues in this document.', type: 'message', scope: 'team', tags: ['gdpr', 'compliance'], createdAt: NOW, updatedAt: NOW, authorName: 'Privacy Team' },
  { id: 's1', name: 'Legal Analyst', description: 'Standard legal analyst system prompt', content: 'You are an expert legal analyst specializing in contract review and privilege analysis.', type: 'system', scope: 'system-preset', createdAt: NOW, updatedAt: NOW },
];

const wrapStyle = 'width: 420px; padding: 0; background: var(--ai-color-bg-surface, #0e0e1a); border-radius: 8px; overflow: hidden;';

const meta: Meta = {
  title: 'Chat/Saved Prompts',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const MineTab: Story = {
  name: 'Saved Prompts — Mine tab',
  render: () => html`
    <div style=${wrapStyle}>
      <prompts-drawer .open=${true} .storedPrompts=${PROMPTS}></prompts-drawer>
    </div>
  `,
};

export const TeamTab: Story = {
  name: 'Saved Prompts — Team tab',
  render: () => html`
    <div style=${wrapStyle}>
      <prompts-drawer .open=${true} .storedPrompts=${PROMPTS}></prompts-drawer>
    </div>
  `,
};

export const Creation: Story = {
  name: 'Saved Prompts — creation form',
  render: () => html`
    <div style=${wrapStyle}>
      <prompts-drawer .open=${true} .storedPrompts=${PROMPTS} .prefillContent=${'You are an expert legal analyst...'}></prompts-drawer>
    </div>
  `,
};
