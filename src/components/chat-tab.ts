import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type {
  AgentModel,
  ChatMessage,
  ChatSettings,
  ContextLevel,
  HistoryScope,
  StoredPrompt,
  TokenUsage,
} from '../models/chat.js';
import { DEFAULT_MODELS, DEFAULT_SETTINGS } from '../models/chat.js';
import { Settings, ClipboardList, Send, FileText, Ruler, Ban, Zap } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';
import './arbor-model-picker.js';
import './context-window-indicator.js';
import './settings-drawer.js';
import './prompts-drawer.js';
import './context-level-toggle.js';
import './history-toggle.js';

type ActiveDrawer = 'settings' | 'prompts' | null;

@customElement('chat-tab')
export class ChatTab extends LitElement {
  static styles = [
    iconStyles,
    css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--ai-color-bg-surface);
      font-family: var(--ai-font-family-sans);
      color: var(--ai-color-text-primary);
      overflow: hidden;
    }

    /* Zone 1: Context Window Indicator */
    context-window-indicator {
      flex-shrink: 0;
    }

    /* Zone 2: Message Thread */
    .message-thread {
      flex: 1;
      overflow-y: auto;
      padding: var(--ai-spacing-md);
      display: flex;
      flex-direction: column;
      gap: var(--ai-spacing-sm);
    }

    .message-thread::-webkit-scrollbar {
      width: 4px;
    }

    .message-thread::-webkit-scrollbar-track {
      background: transparent;
    }

    .message-thread::-webkit-scrollbar-thumb {
      background: var(--ai-color-border-default);
      border-radius: var(--ai-radius-full);
    }

    /* History indicator */
    .history-indicator {
      text-align: center;
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      padding: var(--ai-spacing-sm);
      border-bottom: 1px solid var(--ai-color-border-default);
      margin-bottom: var(--ai-spacing-sm);
    }

    .start-fresh-link {
      color: var(--ai-color-accent-default);
      cursor: pointer;
      text-decoration: underline;
      background: none;
      border: none;
      font-size: var(--ai-font-size-xs);
      padding: 0;
      font-family: inherit;
    }

    /* Model switch separator */
    .model-switch-sep {
      text-align: center;
      font-style: italic;
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      padding: var(--ai-spacing-xs) 0;
    }

    /* Messages */
    .message {
      display: flex;
      flex-direction: column;
      max-width: 80%;
    }

    .message.user {
      align-self: flex-end;
    }

    .message.assistant {
      align-self: flex-start;
    }

    .bubble {
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      border-radius: var(--ai-radius-lg);
      line-height: 1.5;
      font-size: var(--ai-font-size-base);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .message.user .bubble {
      background: var(--ai-color-accent-default);
      color: white;
      border-bottom-right-radius: var(--ai-radius-sm);
    }

    .message.assistant .bubble {
      background: var(--ai-color-bg-raised);
      color: var(--ai-color-text-primary);
      border-bottom-left-radius: var(--ai-radius-sm);
    }

    .message-meta {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-xs);
      margin-top: 4px;
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      font-family: var(--ai-font-family-mono);
    }

    .message.user .message-meta {
      justify-content: flex-end;
    }

    .context-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 5px;
      border-radius: var(--ai-radius-full);
      font-size: var(--ai-font-size-xs);
      font-family: var(--ai-font-family-mono);
    }

    .context-badge svg {
      flex-shrink: 0;
    }

    .context-badge.full .ai-icon { color: var(--ai-color-gold); }
    .context-badge.visible .ai-icon { color: var(--ai-color-teal); }
    .context-badge.none .ai-icon { color: var(--ai-color-text-muted); }

    .context-badge.full {
      background: rgba(251, 191, 36, 0.12);
      color: var(--ai-color-gold);
    }

    .context-badge.visible {
      background: rgba(20, 184, 166, 0.15);
      color: var(--ai-color-teal);
    }

    .context-badge.none {
      background: var(--ai-color-bg-raised);
      color: var(--ai-color-text-muted);
    }

    .doc-chip {
      display: inline-flex;
      align-items: center;
      padding: 1px 5px;
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-full);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-secondary);
    }

    /* Zone 3: Input Area */
    .input-area {
      flex-shrink: 0;
      min-width: 0;
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      border-top: 1px solid var(--ai-color-border-default);
      background: var(--ai-color-bg-raised);
    }

    .input-row {
      display: flex;
      align-items: flex-end;
      gap: var(--ai-spacing-sm);
    }

    textarea.chat-input {
      flex: 1;
      min-height: 36px;
      max-height: 160px;
      resize: none;
      background: var(--ai-color-bg-surface);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-md);
      color: var(--ai-color-text-primary);
      font-family: var(--ai-font-family-sans);
      font-size: var(--ai-font-size-base);
      padding: var(--ai-spacing-sm);
      line-height: 1.5;
      overflow-y: auto;
    }

    textarea.chat-input:focus {
      outline: 2px solid var(--ai-color-border-focus);
      border-color: transparent;
    }

    .send-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: var(--ai-color-accent-default);
      border: none;
      border-radius: var(--ai-radius-md);
      color: white;
      cursor: pointer;
      font-size: 16px;
      transition: opacity var(--ai-duration-fast);
      position: relative;
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .send-btn:hover:not(:disabled) {
      opacity: 0.85;
    }

    .send-btn .ai-icon {
      color: white;
    }

    .send-warning-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 12px;
      height: 12px;
      background: var(--ai-color-semantic-danger);
      border-radius: 50%;
      font-size: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Drawers (expand upward from Zone 4) */
    .drawers-region {
      flex-shrink: 0;
      min-width: 0;
      overflow: hidden;
    }

    /* Zone 4: Control Bar */
    .control-bar {
      flex-shrink: 0;
      height: 44px;
      min-width: 0;
      max-width: 100%;
      display: flex;
      align-items: center;
      padding: 0 var(--ai-spacing-md);
      gap: var(--ai-spacing-sm);
      background: var(--ai-color-bg-raised);
      border-top: 1px solid var(--ai-color-border-default);
      overflow-x: auto;
      overflow-y: hidden;
    }

    .control-bar .cb-btn,
    .control-bar .cb-settings-cluster {
      flex-shrink: 0;
    }

    .control-bar svg,
    .input-area svg {
      color: var(--ai-color-text-primary);
    }

    .control-bar .cb-btn.active svg {
      color: var(--ai-color-accent-default);
    }

    .send-btn svg {
      color: var(--ai-color-accent-on-accent);
    }

    .cb-separator {
      width: 2px;
      height: 20px;
      background: var(--ai-color-border-default);
      border-radius: 1px;
      flex-shrink: 0;
    }

    .cb-btn {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-xs);
      padding: 5px var(--ai-spacing-sm);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-secondary);
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
      white-space: nowrap;
      transition: color var(--ai-duration-fast), border-color var(--ai-duration-fast), background var(--ai-duration-fast);
      font-family: var(--ai-font-family-sans);
    }

    .cb-btn.cb-btn-icon {
      padding: 6px;
    }

    .cb-btn.cb-btn-icon svg,
    .send-btn svg {
      display: block;
      flex-shrink: 0;
      opacity: 1;
      visibility: visible;
    }

    .cb-btn:hover {
      color: var(--ai-color-text-primary);
      background: var(--ai-color-bg-overlay);
    }

    .cb-btn.active {
      border-color: var(--ai-color-accent-default);
      color: var(--ai-color-accent-default);
    }

    .cb-btn.active .ai-icon {
      color: var(--ai-color-accent-default);
    }

    .cb-settings-cluster {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-xs);
    }

    .cb-spacer {
      flex: 1;
    }

    .cb-token-hint {
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-xs);
      cursor: default;
    }

    .cb-token-hint.zone-normal  { color: var(--ai-color-semantic-success); }
    .cb-token-hint.zone-warning { color: var(--ai-color-semantic-warning); }
    .cb-token-hint.zone-danger  { color: var(--ai-color-semantic-danger); }

    /* Empty thread */
    .empty-thread {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ai-color-text-muted);
      font-size: var(--ai-font-size-sm);
    }

    /* Welcome state */
    .welcome-card {
      background: linear-gradient(135deg, var(--ai-color-accent-glow) 0%, rgba(200,169,110,0.06) 100%);
      border: 1px solid var(--ai-color-accent-dim);
      border-radius: var(--ai-radius-lg);
      padding: var(--ai-spacing-lg);
      margin-bottom: var(--ai-spacing-md);
      text-align: center;
    }

    .welcome-card .welcome-icon {
      margin-bottom: var(--ai-spacing-sm);
    }

    .welcome-card h2 {
      font-size: var(--ai-font-size-lg);
      font-weight: 600;
      color: var(--ai-color-text-primary);
      margin: 0 0 var(--ai-spacing-xs);
    }

    .welcome-card .doc-subtitle {
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      margin-bottom: var(--ai-spacing-md);
    }

    .quick-prompts {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ai-spacing-sm);
      justify-content: center;
    }

    .quick-prompt-btn {
      padding: var(--ai-spacing-xs) var(--ai-spacing-sm);
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-md);
      color: var(--ai-color-text-secondary);
      font-size: var(--ai-font-size-sm);
      font-family: var(--ai-font-family-sans);
      cursor: pointer;
      transition: border-color var(--ai-duration-fast), color var(--ai-duration-fast);
    }

    .quick-prompt-btn:hover {
      border-color: var(--ai-color-accent-default);
      color: var(--ai-color-accent-default);
    }

    /* Streaming */
    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      align-self: flex-start;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--ai-color-text-muted);
      animation: bounce 1.4s ease-in-out infinite both;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .typing-dot { animation: none; }
    }

    @media (max-width: 480px) {
      .model-name-text { display: none; }
    }
  `];

  // ── Component Properties (Section 10.1) ───────────────────────────────────
  @property({ type: Array }) availableModels: AgentModel[] = DEFAULT_MODELS;
  @property({ type: String }) selectedModelId = '';
  @property({ type: Object }) tokenUsage: TokenUsage | null = null;
  @property({ type: Object }) chatSettings: ChatSettings = { ...DEFAULT_SETTINGS };
  @property({ type: Array }) storedPrompts: StoredPrompt[] = [];
  @property({ type: String }) contextLevel: ContextLevel = 'full';
  @property({ type: Object }) visiblePageRange: { start: number; end: number } | null = null;
  @property({ type: Boolean }) historyPersist = true;
  @property({ type: String }) systemPrompt = '';
  @property({ type: String }) documentId = '';
  @property({ type: String }) documentName = '';
  @property({ type: String }) historyScope: HistoryScope = 'per-document';
  @property({ type: Array }) chatHistory: ChatMessage[] = [];
  @property({ type: Array }) quickPrompts: string[] = [
    'What are the binding obligations in this document?',
    'Summarize the financial terms and amounts',
    "What's missing from this draft that should be there?",
    'Who are the key parties and their roles?',
  ];
  @property({ type: String }) streamingToken: string | null = null;

  // ── Internal State ─────────────────────────────────────────────────────────
  @state() private _messages: ChatMessage[] = [];
  @state() private _inputValue = '';
  @state() private _activeDrawer: ActiveDrawer = null;
  @state() private _promptsPromptPrefill = '';
  @state() private _hasSentOnce = false;
  @state() private _streamingContent = '';

  override updated(changed: Map<string, unknown>) {
    super.updated(changed);
    // Streaming: accumulate tokens, finalize when null
    if (changed.has('streamingToken')) {
      if (this.streamingToken !== null) {
        this._streamingContent += this.streamingToken;
      } else if (this._streamingContent) {
        this._messages = [
          ...this._messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: this._streamingContent,
            timestamp: new Date().toISOString(),
            contextLevel: this.contextLevel,
            modelId: this.selectedModelId,
          },
        ];
        this._streamingContent = '';
        if (this.historyPersist) {
          this.dispatchEvent(new CustomEvent('chat-history-changed', {
            detail: { documentId: this.documentId, messages: this._messages },
            bubbles: true,
            composed: true,
          }));
        }
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // Initialize from chatHistory prop
    if (this.chatHistory.length) {
      this._messages = [...this.chatHistory];
      this._hasSentOnce = true;
    }
    // Default model
    if (!this.selectedModelId) {
      const def = this.availableModels.find(m => m.default) ?? this.availableModels.find(m => m.tier === 'balanced') ?? this.availableModels[0];
      if (def) this.selectedModelId = def.id;
    }
    document.addEventListener('keydown', this._onGlobalKeydown.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onGlobalKeydown.bind(this));
  }

  private _onGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this._activeDrawer) {
      this._activeDrawer = null;
    }
  }

  private _toggleDrawer(drawer: 'settings' | 'prompts') {
    this._activeDrawer = this._activeDrawer === drawer ? null : drawer;
  }

  private _onModelChanged(e: CustomEvent) {
    const { modelId, modelLabel, contextWindowTokens } = e.detail;
    const prev = this.selectedModelId;
    if (prev && prev !== modelId && this._messages.length) {
      this._messages = [
        ...this._messages,
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: `Switched to ${modelLabel}`,
          timestamp: new Date().toISOString(),
          isModelSwitchSeparator: true,
          switchedToModel: modelLabel,
        },
      ];
    }
    this.selectedModelId = modelId;
    this.dispatchEvent(new CustomEvent('model-changed', {
      detail: { modelId, modelLabel, contextWindowTokens },
      bubbles: true,
      composed: true,
    }));
  }

  private _onSettingsChanged(e: CustomEvent) {
    this.chatSettings = e.detail.settings;
    this.dispatchEvent(new CustomEvent('settings-changed', { detail: e.detail, bubbles: true, composed: true }));
  }

  private _onSettingsReset(e: CustomEvent) {
    this.chatSettings = e.detail.settings;
    this.dispatchEvent(new CustomEvent('settings-reset', { detail: e.detail, bubbles: true, composed: true }));
  }

  private _onPromptSelected(e: CustomEvent) {
    const { prompt, insertAs } = e.detail;
    this._activeDrawer = null;
    if (insertAs === 'message') {
      this._inputValue = prompt.content;
    } else {
      this.chatSettings = { ...this.chatSettings, systemPrompt: prompt.content };
      this._activeDrawer = 'settings';
    }
    this.dispatchEvent(new CustomEvent('prompt-selected', { detail: e.detail, bubbles: true, composed: true }));
  }

  private _onSaveAsPromptRequested(e: CustomEvent) {
    this._promptsPromptPrefill = e.detail.systemPrompt;
    this._activeDrawer = 'prompts';
  }

  private _onContextLevelChanged(e: CustomEvent) {
    this.contextLevel = e.detail.level;
    this.dispatchEvent(new CustomEvent('context-level-changed', { detail: e.detail, bubbles: true, composed: true }));
  }

  private _onHistoryPersistChanged(e: CustomEvent) {
    this.historyPersist = e.detail.save;
    this.dispatchEvent(new CustomEvent('history-persistence-changed', { detail: e.detail, bubbles: true, composed: true }));
  }

  private _onHistoryScopeChanged(e: CustomEvent) {
    this.historyScope = e.detail.scope;
    this.dispatchEvent(new CustomEvent('history-scope-changed', { detail: e.detail, bubbles: true, composed: true }));
  }

  private _onHistoryCleared(e: CustomEvent) {
    this._messages = [];
    this.dispatchEvent(new CustomEvent('chat-history-cleared', {
      detail: { documentId: this.documentId },
      bubbles: true,
      composed: true,
    }));
  }

  private _onContextWindowWarning(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('context-window-warning', { detail: e.detail, bubbles: true, composed: true }));
  }

  private _onInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this._send();
    }
  }

  private _send(contentOverride?: string) {
    const content = (contentOverride ?? this._inputValue).trim();
    if (!content) return;

    this._hasSentOnce = true;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      contextLevel: this.contextLevel,
      pageRange: this.contextLevel === 'visible' && this.visiblePageRange ? this.visiblePageRange : undefined,
      documentId: this.documentId,
      documentName: this.documentName,
    };

    this._messages = [...this._messages, msg];
    if (!contentOverride) this._inputValue = '';

    this.dispatchEvent(new CustomEvent('chat-message-sent', {
      detail: {
        message: msg,
        settings: this.chatSettings,
        modelId: this.selectedModelId,
        contextLevel: this.contextLevel,
        visiblePageRange: this.visiblePageRange,
      },
      bubbles: true,
      composed: true,
    }));

    if (this.historyPersist) {
      this.dispatchEvent(new CustomEvent('chat-history-changed', {
        detail: { documentId: this.documentId, messages: this._messages },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private _startFresh() {
    this._messages = [];
    this._hasSentOnce = false;
    this._streamingContent = '';
    this.dispatchEvent(new CustomEvent('chat-history-cleared', {
      detail: { documentId: this.documentId },
      bubbles: true,
      composed: true,
    }));
  }

  private _tokenZone(): 'normal' | 'warning' | 'danger' {
    if (!this.tokenUsage) return 'normal';
    const pct = (this.tokenUsage.totalUsed / this.tokenUsage.contextLimit) * 100;
    if (pct >= 90) return 'danger';
    if (pct >= 70) return 'warning';
    return 'normal';
  }

  private _tokenHintLabel(): string {
    if (!this.tokenUsage) return '';
    const n = this.tokenUsage.totalUsed;
    if (n >= 1000) return `~${(n / 1000).toFixed(1)}k`;
    return String(n);
  }

  private _contextBadgeIcon(msg: ChatMessage) {
    if (!msg.contextLevel || msg.contextLevel === 'none') return renderIcon(Ban, 12, 'muted');
    if (msg.contextLevel === 'visible' && msg.pageRange) return renderIcon(Ruler, 12, 'teal');
    return renderIcon(FileText, 12, 'gold');
  }

  private _contextBadgeLabel(msg: ChatMessage): string {
    if (!msg.contextLevel || msg.contextLevel === 'none') return 'No context';
    if (msg.contextLevel === 'visible' && msg.pageRange) {
      return `${msg.pageRange.start}–${msg.pageRange.end}`;
    }
    return 'Full';
  }

  private _selectedModel(): AgentModel | undefined {
    return this.availableModels.find(m => m.id === this.selectedModelId);
  }

  private _renderMessage(msg: ChatMessage) {
    if (msg.isModelSwitchSeparator) {
      return html`<div class="model-switch-sep">— Switched to ${msg.switchedToModel} —</div>`;
    }

    if (msg.role === 'system') return nothing;

    return html`
      <div class="message ${msg.role}">
        <div class="bubble">${msg.content}</div>
        ${msg.role === 'assistant' ? html`
          <div class="message-meta">
            <span class="context-badge ${msg.contextLevel ?? 'none'}">
              ${this._contextBadgeIcon(msg)}
              ${this._contextBadgeLabel(msg)}
            </span>
            ${this.historyScope === 'all-documents' && msg.documentName ? html`
              <span class="doc-chip">${msg.documentName}</span>
            ` : nothing}
          </div>
        ` : html`
          <div class="message-meta">
            ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        `}
      </div>
    `;
  }

  private _renderWelcome() {
    const prompts = this.quickPrompts.slice(0, 4);
    return html`
      <div class="welcome-card">
        <div class="welcome-icon">${renderIcon(Zap, 32, 'gold')}</div>
        <h2>Ask anything about this document</h2>
        ${this.documentName ? html`<div class="doc-subtitle">${this.documentName}</div>` : ''}
        ${!this._hasSentOnce && prompts.length ? html`
          <div class="quick-prompts">
            ${prompts.map(p => html`
              <button class="quick-prompt-btn" @click=${() => this._send(p)}>${p}</button>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  private _renderStreamingOrTyping() {
    const lastMsg = this._messages[this._messages.length - 1];
    const waitingForResponse = lastMsg?.role === 'user';
    if (!waitingForResponse && !this._streamingContent) return nothing;
    if (this._streamingContent) {
      return html`
        <div class="message assistant">
          <div class="bubble">${this._streamingContent}</div>
        </div>
      `;
    }
    return html`
      <div class="typing-indicator" aria-live="polite" aria-label="AI is typing">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
  }

  private _renderHistoryIndicator() {
    if (!this._messages.length || !this.chatHistory.length) return nothing;
    const first = this._messages[0];
    const relTime = first ? this._relativeTime(first.timestamp) : '';
    return html`
      <div class="history-indicator">
        Continuing previous conversation · ${this._messages.length} messages · Started ${relTime}
        · <button class="start-fresh-link" @click=${this._startFresh}>Start fresh</button>
      </div>
    `;
  }

  private _relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  render() {
    const zone = this._tokenZone();
    const nearFull = zone === 'danger';
    const model = this._selectedModel();

    return html`
      <!-- Zone 1: Context Window Indicator -->
      <context-window-indicator
        .tokenUsage=${this.tokenUsage}
        .contextLimit=${model?.contextWindowTokens ?? 128000}
        @context-window-warning=${this._onContextWindowWarning}
      ></context-window-indicator>

      <!-- Zone 2: Message Thread -->
      <div class="message-thread" role="log" aria-live="polite" aria-label="Chat messages">
        ${this._renderHistoryIndicator()}
        ${this._messages.length === 0 && !this._streamingContent
          ? this._renderWelcome()
          : html`
            ${this._messages.map(m => this._renderMessage(m))}
            ${this._renderStreamingOrTyping()}
          `
        }
      </div>

      <!-- Zone 3: Input Area -->
      <div class="input-area">
        <div class="input-row">
          <textarea
            class="chat-input"
            rows="1"
            placeholder="Ask about this document…"
            .value=${this._inputValue}
            @input=${(e: Event) => (this._inputValue = (e.target as HTMLTextAreaElement).value)}
            @keydown=${this._onInputKeydown}
            aria-label="Chat message input"
          ></textarea>
          <button
            class="send-btn"
            ?disabled=${!this._inputValue.trim() || this.streamingToken !== null}
            @click=${() => this._send()}
            aria-label="Send message"
            title=${nearFull ? 'Context window nearly full — oldest messages may be truncated' : 'Send'}
          >
            ${renderIcon(Send, 18, 'white')}
            ${nearFull ? html`<span class="send-warning-badge" aria-hidden="true">!</span>` : nothing}
          </button>
        </div>
      </div>

      <!-- Drawers (expand upward from control bar) -->
      <div class="drawers-region">
        <settings-drawer
          ?open=${this._activeDrawer === 'settings'}
          .settings=${this.chatSettings}
          .defaultSystemPrompt=${this.systemPrompt}
          @settings-changed=${this._onSettingsChanged}
          @settings-reset=${this._onSettingsReset}
          @save-as-prompt-requested=${this._onSaveAsPromptRequested}
        ></settings-drawer>

        <prompts-drawer
          ?open=${this._activeDrawer === 'prompts'}
          .storedPrompts=${this.storedPrompts}
          .prefillContent=${this._promptsPromptPrefill}
          @prompt-selected=${this._onPromptSelected}
          @prompt-create-requested=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('prompt-create-requested', { detail: e.detail, bubbles: true, composed: true }))}
          @prompt-delete-requested=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('prompt-delete-requested', { detail: e.detail, bubbles: true, composed: true }))}
        ></prompts-drawer>
      </div>

      <!-- Zone 4: Control Bar -->
      <div class="control-bar" role="toolbar" aria-label="Chat controls">
        <!-- Left: Model Picker -->
        <arbor-model-picker
          .availableModels=${this.availableModels}
          .selectedModelId=${this.selectedModelId}
          @model-changed=${this._onModelChanged}
        ></arbor-model-picker>

        <div class="cb-separator" aria-hidden="true"></div>

        <!-- Settings cluster -->
        <div class="cb-settings-cluster">
          <button
            class="cb-btn cb-btn-icon ${this._activeDrawer === 'settings' ? 'active' : ''}"
            @click=${() => this._toggleDrawer('settings')}
            aria-expanded=${this._activeDrawer === 'settings'}
            aria-controls="settings-drawer"
            aria-label="Advanced Settings"
            title="Advanced Settings"
          >
            ${renderIcon(Settings, 16)}
          </button>
          <button
            class="cb-btn cb-btn-icon ${this._activeDrawer === 'prompts' ? 'active' : ''}"
            @click=${() => this._toggleDrawer('prompts')}
            aria-expanded=${this._activeDrawer === 'prompts'}
            aria-controls="prompts-drawer"
            aria-label="Saved Prompts"
            title="Saved Prompts"
          >
            ${renderIcon(ClipboardList, 16)}
          </button>
        </div>

        <!-- Optional token hint -->
        ${this.tokenUsage ? html`
          <span class="cb-token-hint zone-${zone}" title="Approximate token usage">
            ${this._tokenHintLabel()}
          </span>
        ` : nothing}

        <div class="cb-spacer"></div>

        <!-- Context Toggle -->
        <context-level-toggle
          .contextLevel=${this.contextLevel}
          @context-level-changed=${this._onContextLevelChanged}
        ></context-level-toggle>

        <!-- History Toggle -->
        <history-toggle
          style="margin-left: var(--ai-spacing-sm)"
          .historyPersist=${this.historyPersist}
          .historyScope=${this.historyScope}
          .documentName=${this.documentName}
          @history-persistence-changed=${this._onHistoryPersistChanged}
          @history-scope-changed=${this._onHistoryScopeChanged}
          @chat-history-cleared=${this._onHistoryCleared}
        ></history-toggle>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-tab': ChatTab;
  }
}
