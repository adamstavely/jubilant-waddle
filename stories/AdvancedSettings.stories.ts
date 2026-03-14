import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/index.ts';
import { DEFAULT_SETTINGS } from '../src/models/chat.js';

const meta: Meta = {
  title: 'Chat/Advanced Settings',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const wrapStyle = 'width: 420px; padding: 0; background: var(--ai-color-bg-surface, #0e0e1a); border-radius: 8px; overflow: hidden;';

export const Open: Story = {
  name: 'Advanced Settings — open',
  render: () => html`
    <div style=${wrapStyle}>
      <settings-drawer
        .open=${true}
        .settings=${DEFAULT_SETTINGS}
      ></settings-drawer>
    </div>
  `,
};

export const Modified: Story = {
  name: 'Advanced Settings — modified',
  render: () => html`
    <div style=${wrapStyle}>
      <settings-drawer
        .open=${true}
        .settings=${{ ...DEFAULT_SETTINGS, temperature: 0.9, topP: 0.7, maxOutputTokens: 512 }}
      ></settings-drawer>
    </div>
  `,
};
