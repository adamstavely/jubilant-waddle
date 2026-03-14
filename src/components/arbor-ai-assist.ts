/**
 * arbor-ai-assist
 *
 * Root web component for the ARBOR AI Assist Panel. Flyout panel with Chat,
 * Actions, and Agent Tasks tabs.
 *
 * Usage:
 *   <arbor-ai-assist
 *     open
 *     model-label="ARBOR-4o"
 *     document-id="doc-123"
 *     document-name="Contract A.pdf"
 *   ></arbor-ai-assist>
 */
import { LitElement, html, css } from 'lit';
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
import type { AiTab } from './ai-tabs.js';
import './ai-header.js';
import './ai-tabs.js';
import './chat-tab.js';
import './actions-tab.js';
import './agent-tasks-tab.js';

@customElement('arbor-ai-assist')
export class ArborAiAssist extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: var(--ai-z-drawer);
      pointer-events: none;
    }

    :host([open]) {
      pointer-events: auto;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: var(--ai-z-backdrop);
      opacity: 0;
      transition: opacity var(--ai-duration-slow) var(--ai-easing-decelerate);
      pointer-events: none;
    }

    :host([open]) .backdrop {
      opacity: 1;
      pointer-events: auto;
    }

    @media (prefers-reduced-motion: reduce) {
      .backdrop { transition: none; }
    }

    .panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--ai-sizing-panel-width);
      background: var(--ai-color-bg-surface);
      border-left: 1px solid var(--ai-color-border-default);
      box-shadow: var(--ai-shadow-lg);
      display: flex;
      flex-direction: column;
      font-family: var(--ai-font-family-sans);
      transform: translateX(100%);
      transition: transform var(--ai-duration-slow) var(--ai-easing-decelerate);
      z-index: var(--ai-z-drawer);
      overflow: hidden;
    }

    :host([open]) .panel {
      transform: translateX(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .panel { transition: none; }
    }

    .tab-content {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    chat-tab,
    actions-tab,
    agent-tasks-tab {
      flex: 1;
      min-height: 0;
      display: none;
    }

    chat-tab[data-active],
    actions-tab[data-active],
    agent-tasks-tab[data-active] {
      display: flex;
    }
  `;

  // ── Public API ─────────────────────────────────────────────────────────────
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String, attribute: 'active-tab' }) activeTab: AiTab = 'chat';
  @property({ type: String, attribute: 'model-label' }) modelLabel = 'ARBOR-4';
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
  @property({ type: String }) historyScope: HistoryScope = 'per-document';
  @property({ type: Array }) chatHistory: ChatMessage[] = [];
  @property({ type: Array }) quickPrompts: string[] = [];
  @property({ type: String }) streamingToken: string | null = null;
  @property({ type: String }) batchId = '';
  @property({ type: Object }) actionResult: { actionId: string; title: string; content: string; status: 'success' | 'error' } | null = null;
  @property({ type: Array }) agentTasks: Array<{ id: string; status: string }> = [];

  @state() private _agentTasksBadge = 0;
  @state() private _agentTasksBadgeType: 'running' | 'failed' | '' = '';

  updated(changed: Map<string, unknown>) {
    if (changed.has('agentTasks')) {
      const running = this.agentTasks.filter((t: { status: string }) => t.status === 'running').length;
      const failed = this.agentTasks.filter((t: { status: string }) => t.status === 'failed').length;
      this._agentTasksBadge = running > 0 ? running : failed;
      this._agentTasksBadgeType = running > 0 ? 'running' : (failed > 0 ? 'failed' : '');
    }
    if (changed.has('open')) {
      document.body.style.overflow = this.open ? 'hidden' : '';
      if (this.open) {
        document.addEventListener('keydown', this._onKeydown);
      } else {
        document.removeEventListener('keydown', this._onKeydown);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onKeydown);
  }

  private _onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this._close();
    }
  };

  private _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('open-change', {
      detail: { open: false },
      bubbles: true,
      composed: true,
    }));
  }

  private _onBackdropClick() {
    this._close();
  }

  private _onTabChange(e: CustomEvent<{ tab: AiTab }>) {
    this.activeTab = e.detail.tab;
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: { tab: e.detail.tab },
      bubbles: true,
      composed: true,
    }));
  }

  private _modelLabelForHeader(): string {
    const model = this.availableModels.find(m => m.id === this.selectedModelId);
    return model?.label ?? this.modelLabel ?? 'ARBOR-4';
  }

  render() {
    return html`
      <div class="backdrop" @click=${this._onBackdropClick} aria-hidden="true"></div>

      <div class="panel" role="dialog" aria-modal="true" aria-label="AI Assist Panel">
        <ai-header
          .documentName=${this.documentName}
          .modelLabel=${this._modelLabelForHeader()}
          @close=${this._close}
        ></ai-header>

        <ai-tabs
          .activeTab=${this.activeTab}
          .agentTasksBadge=${this._agentTasksBadge}
          .agentTasksBadgeType=${this._agentTasksBadgeType}
          @tab-change=${this._onTabChange}
        ></ai-tabs>

        <div class="tab-content">
          <chat-tab
            id="tabpanel-chat"
            role="tabpanel"
            aria-labelledby="tab-chat"
            ?data-active=${this.activeTab === 'chat'}
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
            .quickPrompts=${this.quickPrompts}
            .streamingToken=${this.streamingToken}
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

          <actions-tab
            id="tabpanel-actions"
            role="tabpanel"
            aria-labelledby="tab-actions"
            ?data-active=${this.activeTab === 'actions'}
            .documentId=${this.documentId}
            .batchId=${this.batchId}
            .actionResult=${this.actionResult}
            @action-triggered=${this._relay}
            @result-dismissed=${() => { this.actionResult = null; }}
          ></actions-tab>

          <agent-tasks-tab
            id="tabpanel-agent-tasks"
            role="tabpanel"
            aria-labelledby="tab-agent-tasks"
            ?data-active=${this.activeTab === 'agent-tasks'}
            .agentTasks=${this.agentTasks}
            @agent-task-dismissed=${this._relay}
          ></agent-tasks-tab>
        </div>
      </div>
    `;
  }

  private _relay = (e: Event) => {
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
