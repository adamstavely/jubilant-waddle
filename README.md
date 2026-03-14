# ARBOR AI Assist Panel

A web component library that provides an AI-powered assist panel for document review workflows. Built with [Lit](https://lit.dev/) and designed for integration into document management and legal tech applications.

## Overview

The ARBOR AI Assist Panel is a slide-out flyout panel with three main tabs:

- **Chat** — Document-aware AI chat with model selection, context controls, and a timeline navigator for long conversations
- **Actions** — One-click AI actions for document analysis (PII redaction, privilege logs, issue spotting, etc.)
- **Agent Tasks** — Monitor and manage background AI tasks (batch processing, entity extraction, etc.)

The panel is framework-agnostic and can be embedded in any web application via standard HTML and JavaScript.

## Installation

```bash
npm install
npm run build
```

The build produces:

- `dist/arbor-ai-assist.js` — ES module bundle
- `dist/tokens/tokens.css` — Design tokens (colors, spacing, typography)

## Quick Start

### 1. Include the script and styles

```html
<link rel="stylesheet" href="path/to/dist/tokens/tokens.css" />
<script type="module" src="path/to/dist/arbor-ai-assist.js"></script>
```

### 2. Add the component

```html
<arbor-ai-assist
  id="panel"
  document-id="doc-123"
  document-name="Contract A.pdf"
></arbor-ai-assist>
```

### 3. Configure and open

```javascript
const panel = document.getElementById('panel');

// Provide available models
panel.availableModels = [
  { id: 'arbor-4o', label: 'ARBOR-4o', tier: 'balanced', tierLabel: '4o', 
    contextWindowTokens: 128000, available: true, default: true },
  // ...
];

// Open the panel
panel.open = true;

// Listen for events
panel.addEventListener('open-change', (e) => {
  panel.open = e.detail.open;
});
panel.addEventListener('chat-message-sent', (e) => {
  console.log('Message sent', e.detail);
});
```

## Development

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (demo at http://localhost:5173) |
| `npm run build` | Build the library and design tokens |
| `npm run storybook` | Start Storybook (http://localhost:6006) |
| `npm run build-storybook` | Build static Storybook |

### Design Tokens

Design tokens are defined in `tokens/**/*.json` and built with Style Dictionary. Run `npm run tokens` to regenerate `dist/tokens/tokens.css`, `tokens.ts`, and `tailwind-tokens.js`.

## API Reference

### Root Component: `<arbor-ai-assist>`

| Attribute / Property | Type | Description |
|----------------------|------|-------------|
| `open` | `boolean` | Whether the panel is visible |
| `active-tab` | `'chat' \| 'actions' \| 'agent-tasks'` | Active tab |
| `document-id` | `string` | Current document identifier |
| `document-name` | `string` | Display name for the document |
| `model-label` | `string` | Fallback model label in header |
| `availableModels` | `AgentModel[]` | Models to show in picker |
| `selectedModelId` | `string` | Currently selected model |
| `tokenUsage` | `TokenUsage \| null` | Context window usage stats |
| `chatSettings` | `ChatSettings` | Temperature, topK, etc. |
| `storedPrompts` | `StoredPrompt[]` | Saved prompts |
| `chatHistory` | `ChatMessage[]` | Restored chat messages |
| `quickPrompts` | `string[]` | Quick prompt suggestions |
| `streamingToken` | `string \| null` | For streaming responses |
| `contextLevel` | `'full' \| 'visible' \| 'none' \| 'all-documents'` | Context scope |
| `visiblePageRange` | `{ start, end } \| null` | When context is visible |
| `historyPersist` | `boolean` | Whether to persist chat |
| `historyScope` | `'per-document' \| 'all-documents'` | History scope |
| `batchId` | `string` | For batch actions |
| `actionResult` | `object \| null` | Last action result |
| `agentTasks` | `AgentTask[]` | Background tasks |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open-change` | `{ open: boolean }` | Panel opened or closed |
| `tab-change` | `{ tab: AiTab }` | Tab switched |
| `model-changed` | `{ modelId, modelLabel, contextWindowTokens }` | Model selected |
| `settings-changed` | `{ settings: ChatSettings }` | Settings updated |
| `settings-reset` | `{ settings: ChatSettings }` | Settings reset |
| `context-level-changed` | `{ level: ContextLevel }` | Context level changed |
| `history-persistence-changed` | `{ save: boolean }` | Persist toggle |
| `history-scope-changed` | `{ scope, previousScope }` | History scope changed |
| `chat-history-changed` | `{ documentId, messages }` | Chat history updated |
| `chat-history-cleared` | `{ documentId }` | Chat cleared |
| `chat-message-sent` | `{ message, settings, documentId }` | Message sent |
| `action-triggered` | `ActionEvent` | Action invoked |
| `result-dismissed` | — | Action result dismissed |
| `agent-task-dismissed` | — | Agent task dismissed |

## Project Structure

```
src/
├── index.ts              # Public exports
├── components/           # Web components
│   ├── arbor-ai-assist.ts    # Root panel
│   ├── chat-tab.ts          # Chat UI + timeline navigator
│   ├── actions-tab.ts       # Actions grid
│   ├── agent-tasks-tab.ts   # Task list
│   ├── ai-header.ts
│   ├── ai-tabs.ts
│   ├── arbor-model-picker.ts
│   ├── context-level-toggle.ts
│   ├── context-window-status.ts
│   ├── history-toggle.ts
│   ├── settings-drawer.ts
│   ├── prompts-drawer.ts
│   └── ...
├── models/               # Data types
│   ├── chat.ts
│   ├── action.ts
│   ├── agent-task.ts
│   ├── analysis.ts
│   └── document.ts
tokens/                   # Design tokens (JSON)
stories/                  # Storybook stories
```

## Chat Tab Features

- **Model picker** — Switch between ARBOR models (4-mini, 4o, 4.5, o3, turbo)
- **Context level** — Full document, visible pages only, or no context
- **Advanced settings** — Temperature, topK, topP, penalties, max tokens
- **Saved prompts** — Reusable prompts (personal, team, system)
- **Timeline navigator** — Fixed jump-to landmarks for user messages; click a dot to scroll to that message with alignment and a brief highlight animation
- **History scope** — Per-document or all-documents history
- **Quote reply** — Reply to a specific message

## Actions Tab

Predefined AI actions for document and batch workflows:

**Document actions:** Redact PII, Privilege Log, Build Timeline, Deposition Prep, Issue Spotting, Compare Documents

**Batch actions:** Batch Summary, Entity Relationship Map, Hot Document Detection, Auto-Code Batch

The host application listens for `action-triggered` and performs the actual AI calls.

## Agent Tasks Tab

Displays background AI tasks (queued, running, completed, failed). The host provides `agentTasks` and updates status; the panel shows progress and results.

## Design Tokens

The panel uses CSS custom properties from `tokens.css`. Key tokens:

- `--ai-color-bg-base`, `--ai-color-bg-surface`, `--ai-color-bg-raised`
- `--ai-color-accent-default`, `--ai-color-accent-glow`
- `--ai-spacing-*`, `--ai-radius-*`, `--ai-font-*`
- `--ai-sizing-panel-width`, `--ai-shadow-lg`

Override these in your app to theme the panel.

## Browser Support

Modern browsers with ES modules and Web Components support (Chrome, Firefox, Safari, Edge).

## License

ISC
