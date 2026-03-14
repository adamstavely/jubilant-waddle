// ─── ARBOR Chat Tab Data Model ───────────────────────────────────────────────
// Spec v2.1 — Section 10.1 consolidated types

// ─── Model Picker ─────────────────────────────────────────────────────────────

export type ModelTier = 'fast' | 'balanced' | 'reasoning' | 'extended';

export interface AgentModel {
  id: string;                   // e.g. "arbor-4o-2025-03"
  label: string;                // display name, e.g. "ARBOR-4o"
  tier: ModelTier;
  tierLabel: string;            // short badge label, e.g. "4o"
  contextWindowTokens: number;  // max tokens for this model
  available: boolean;           // false = dimmed in picker
  default?: boolean;            // true = host's preferred default
}

export const DEFAULT_MODELS: AgentModel[] = [
  { id: 'arbor-4-mini', label: 'ARBOR-4-mini', tier: 'fast', tierLabel: '4m', contextWindowTokens: 32000, available: true },
  { id: 'arbor-4.5-mini', label: 'ARBOR-4.5-mini', tier: 'fast', tierLabel: '4.5m', contextWindowTokens: 32000, available: false },
  { id: 'arbor-4o', label: 'ARBOR-4o', tier: 'balanced', tierLabel: '4o', contextWindowTokens: 128000, available: true, default: true },
  { id: 'arbor-4.5', label: 'ARBOR-4.5', tier: 'balanced', tierLabel: '4.5', contextWindowTokens: 128000, available: true },
  { id: 'arbor-o3', label: 'ARBOR-o3', tier: 'reasoning', tierLabel: 'o3', contextWindowTokens: 200000, available: true },
  { id: 'arbor-o4', label: 'ARBOR-o4', tier: 'reasoning', tierLabel: 'o4', contextWindowTokens: 200000, available: false },
  { id: 'arbor-4.5-turbo', label: 'ARBOR-4.5-turbo', tier: 'extended', tierLabel: 'turbo', contextWindowTokens: 1000000, available: true },
];

// ─── Context Window ───────────────────────────────────────────────────────────

export interface TokenUsage {
  documentTokens: number;   // tokens consumed by current document context
  historyTokens: number;    // tokens consumed by chat history messages
  systemTokens: number;     // tokens consumed by system prompt
  totalUsed: number;        // sum of the above
  contextLimit: number;     // model's full context window size
  remaining: number;        // contextLimit - totalUsed
  lastUpdated: string;      // ISO 8601 timestamp
}

// ─── Advanced Settings ────────────────────────────────────────────────────────

export interface ChatSettings {
  temperature: number;      // 0.0 – 2.0
  topK: number;             // 1 – 200
  topP: number;             // 0.0 – 1.0
  presencePenalty: number;  // -2.0 – 2.0
  frequencyPenalty: number; // -2.0 – 2.0
  maxOutputTokens: number;  // 1 – 8192
  systemPrompt: string;     // user-editable system prompt
}

export const DEFAULT_SETTINGS: Readonly<ChatSettings> = {
  temperature: 0.3,
  topK: 40,
  topP: 0.9,
  presencePenalty: 0.0,
  frequencyPenalty: 0.0,
  maxOutputTokens: 2048,
  systemPrompt: '',
};

export interface SettingsParamMeta {
  key: keyof ChatSettings;
  label: string;
  description: string;
  type: 'float' | 'integer' | 'text';
  min?: number;
  max?: number;
  step?: number;
}

export const SETTINGS_PARAMS: SettingsParamMeta[] = [
  { key: 'temperature', label: 'Temperature', description: 'Controls output randomness. Lower = more deterministic.', type: 'float', min: 0.0, max: 2.0, step: 0.05 },
  { key: 'topK', label: 'Top-K', description: 'Limits the token candidate pool to the K most likely tokens.', type: 'integer', min: 1, max: 200, step: 1 },
  { key: 'topP', label: 'Top-P', description: 'Nucleus sampling — considers only top P probability mass.', type: 'float', min: 0.0, max: 1.0, step: 0.05 },
  { key: 'presencePenalty', label: 'Presence Penalty', description: 'Penalizes tokens that have already appeared, reducing repetition.', type: 'float', min: -2.0, max: 2.0, step: 0.1 },
  { key: 'frequencyPenalty', label: 'Frequency Penalty', description: 'Penalizes tokens proportional to how often they have appeared.', type: 'float', min: -2.0, max: 2.0, step: 0.1 },
  { key: 'maxOutputTokens', label: 'Max Output Tokens', description: 'Hard cap on response length in tokens.', type: 'integer', min: 1, max: 8192, step: 1 },
];

// ─── Saved Prompts ────────────────────────────────────────────────────────────

export type PromptType = 'message' | 'system' | 'both';
export type PromptScope = 'personal' | 'team' | 'system-preset';

export interface StoredPrompt {
  id: string;
  name: string;
  description?: string;
  content: string;          // the prompt text
  type: PromptType;
  scope: PromptScope;
  tags?: string[];
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  authorId?: string;        // for team prompts
  authorName?: string;
}

// ─── Context Awareness ────────────────────────────────────────────────────────

export type ContextLevel = 'full' | 'visible' | 'none' | 'all-documents';

// ─── History / Persistence ────────────────────────────────────────────────────

export type HistoryScope = 'per-document' | 'all-documents';

// ─── Chat Messages ────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;              // ISO 8601
  contextLevel?: ContextLevel;    // what context was sent with this message
  pageRange?: { start: number; end: number }; // if contextLevel === 'visible'
  modelId?: string;               // model used for assistant messages
  documentId?: string;            // active document when message was sent
  documentName?: string;          // for 'all-documents' scope display
  isModelSwitchSeparator?: boolean;
  switchedToModel?: string;
}
