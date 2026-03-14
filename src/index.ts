// ─── ARBOR AI Assist Panel — Public Exports ───────────────────────────────────

// Register all custom elements
export { ArborAiAssist } from './components/arbor-ai-assist.js';
export { ChatTab } from './components/chat-tab.js';
export { ArborModelPicker } from './components/arbor-model-picker.js';
export { ContextWindowIndicator } from './components/context-window-indicator.js';
export { ArborRangeSlider } from './components/range-slider.js';
export { SettingsDrawer } from './components/settings-drawer.js';
export { PromptsDrawer } from './components/prompts-drawer.js';
export { ContextLevelToggle } from './components/context-level-toggle.js';
export { HistoryToggle } from './components/history-toggle.js';

// Export types and constants
export type {
  AgentModel,
  ModelTier,
  TokenUsage,
  ChatSettings,
  SettingsParamMeta,
  StoredPrompt,
  PromptType,
  PromptScope,
  ContextLevel,
  HistoryScope,
  ChatMessage,
  MessageRole,
} from './models/chat.js';

export { DEFAULT_MODELS, DEFAULT_SETTINGS, SETTINGS_PARAMS } from './models/chat.js';
