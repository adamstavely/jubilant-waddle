import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/index.ts';
import { DEFAULT_MODELS } from '../src/models/chat.js';

const meta: Meta = {
  title: 'Chat/Model Picker',
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj;

export const Open: Story = {
  name: 'Model Picker — open',
  render: () => {
    const el = html`
      <div style="padding: 20px; background: var(--ai-color-bg-surface, #0e0e1a); border-radius: 8px; position: relative;">
        <arbor-model-picker
          .availableModels=${DEFAULT_MODELS}
          selected-model-id="arbor-4o"
          .selectedModelId=${'arbor-4o'}
        ></arbor-model-picker>
      </div>
    `;
    return el;
  },
};
