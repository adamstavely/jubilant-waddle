import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/index.ts';

const NOW = new Date().toISOString();

const meta: Meta = {
  title: 'Chat/Context Window',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const wrapStyle = 'width: 420px; background: var(--ai-color-bg-surface, #0e0e1a); border-radius: 8px; overflow: hidden;';

export const Normal: Story = {
  name: 'Context Window — normal (32%)',
  render: () => html`
    <div style=${wrapStyle}>
      <context-window-indicator
        .tokenUsage=${{
          documentTokens: 30000,
          historyTokens: 10000,
          systemTokens: 1000,
          totalUsed: 41000,
          contextLimit: 128000,
          remaining: 87000,
          lastUpdated: NOW,
        }}
      ></context-window-indicator>
    </div>
  `,
};

export const Warning: Story = {
  name: 'Context Window — warning (82%)',
  render: () => html`
    <div style=${wrapStyle}>
      <context-window-indicator
        .tokenUsage=${{
          documentTokens: 80000,
          historyTokens: 20000,
          systemTokens: 5000,
          totalUsed: 105000,
          contextLimit: 128000,
          remaining: 23000,
          lastUpdated: NOW,
        }}
      ></context-window-indicator>
    </div>
  `,
};

export const Full: Story = {
  name: 'Context Window — full (95%)',
  render: () => html`
    <div style=${wrapStyle}>
      <context-window-indicator
        .tokenUsage=${{
          documentTokens: 100000,
          historyTokens: 20000,
          systemTokens: 2000,
          totalUsed: 122000,
          contextLimit: 128000,
          remaining: 6000,
          lastUpdated: NOW,
        }}
      ></context-window-indicator>
    </div>
  `,
};
