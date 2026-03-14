/**
 * arbor-ai-assist
 *
 * Root web component for the ARBOR AI Assist Panel. Hosts the Chat tab with all
 * configuration and session features from spec v2.1.
 *
 * Usage:
 *   <arbor-ai-assist
 *     model-label="ARBOR-4o"
 *     document-id="doc-123"
 *     document-name="Contract A.pdf"
 *   ></arbor-ai-assist>
 */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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
import './chat-tab.js';

@customElement('arbor-ai-assist')
export class ArborAiAssist extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 400px;
      background: var(--ai-color-bg-surface, #0e0e1a);
      border-radius: var(--ai-radius-lg);
      overflow: hidden;
      box-shadow: var(--ai-shadow-lg);
    }

    .panel-header {
      display: flex;
      align-items: center;
      padding: 0 var(--ai-spacing-md);
      height: 40px;
      background: var(--ai-color-bg-raised);
      border-bottom: 1px solid var(--ai-color-border-default);
      flex-shrink: 0;
    }

    .panel-title {
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-sm);
      color: var(--ai-color-text-secondary);
      letter-spacing: 0.05em;
    }

    .panel-title strong {
      color: var(--ai-color-accent-default);
    }

    chat-tab {
      flex: 1;
      min-height: 0;
    }
  `;

  // ── Public API ─────────────────────────────────────────────────────────────
  @property({ type: Array }) availableModels: AgentModel[] = DEFAULT_MODELS;
  @property({ type: String, attribute: 'selected-model-id' }) selectedModelId = '';
  @property({ type: Object }) tokenUsage: TokenUsage | null = null;
  @property({ type: Object }) chatSettings: ChatSettings = { ...DEFAULT_SETTINGS };
  @property({ type: Array }) storedPrompts: StoredPrompt[] = [];
  @property({ type: String }) contextLevel: ContextLevel = 'full';
  @property({ type: Object }) visiblePageRange: { start: number; end: number } | null = null;
  @property({ type: Boolean }) historyPersist = true;
  @property({ type: String, attribute: 'system-prompt' }) systemPrompt = '';
  @property({ type: String, attribute: 'document-id' }) documentId = '';
  @property({ type: String, attribute: 'document-name' }) documentName = '';
  @property({ type: String, attribute: 'model-label' }) modelLabel = '';
  @property({ type: String }) historyScope: HistoryScope = 'per-document';
  @property({ type: Array }) chatHistory: ChatMessage[] = [];

  render() {
    return html`
      <div class="panel-header">
        <span class="panel-title"><strong>ARBOR</strong> AI Assist</span>
      </div>

      <chat-tab
        .availableModels=${this.availableModels}
        .selectedModelId=${this.selectedModelId}
        .tokenUsage=${this.tokenUsage}
        .chatSettings=${this.chatSettings}
        .storedPrompts=${this.storedPrompts}
        .contextLevel=${this.contextLevel}
        .visiblePageRange=${this.visiblePageRange}
        .historyPersist=${this.historyPersist}
        .systemPrompt=${this.systemPrompt}
        .documentId=${this.documentId}
        .documentName=${this.documentName}
        .historyScope=${this.historyScope}
        .chatHistory=${this.chatHistory}
        @model-changed=${(e: CustomEvent) => { this.selectedModelId = e.detail.modelId; this._relay(e); }}
        @settings-changed=${(e: CustomEvent) => { this.chatSettings = e.detail.settings; this._relay(e); }}
        @settings-reset=${(e: CustomEvent) => { this.chatSettings = e.detail.settings; this._relay(e); }}
        @prompt-selected=${this._relay}
        @prompt-create-requested=${this._relay}
        @prompt-delete-requested=${this._relay}
        @context-level-changed=${(e: CustomEvent) => { this.contextLevel = e.detail.level; this._relay(e); }}
        @context-window-warning=${this._relay}
        @history-persistence-changed=${(e: CustomEvent) => { this.historyPersist = e.detail.save; this._relay(e); }}
        @history-scope-changed=${(e: CustomEvent) => { this.historyScope = e.detail.scope; this._relay(e); }}
        @chat-history-changed=${this._relay}
        @chat-history-cleared=${this._relay}
        @chat-message-sent=${this._relay}
      ></chat-tab>
    `;
  }

  private _relay = (e: Event) => {
    // Re-dispatch so host can listen on <arbor-ai-assist> directly
    this.dispatchEvent(new CustomEvent(e.type, {
      detail: (e as CustomEvent).detail,
      bubbles: false,
    }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'arbor-ai-assist': ArborAiAssist;
  }
}
