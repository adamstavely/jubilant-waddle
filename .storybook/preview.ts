import type { Preview } from '@storybook/web-components';
import '../dist/tokens/tokens.css';
import '../src/index.ts';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
  },
};

export default preview;
