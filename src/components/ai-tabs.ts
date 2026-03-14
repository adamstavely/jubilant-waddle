/**
 * ai-tabs
 *
 * Tab bar for Chat, Actions, and Agent Tasks.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type AiTab = 'chat' | 'actions' | 'agent-tasks';

const TAB_LABELS: Record<AiTab, string> = {
  chat: 'Chat',
  actions: 'Actions',
  'agent-tasks': 'Agents',
};

@customElement('ai-tabs')
export class AiTabs extends LitElement {
  static styles = css`
    :host {
      display: flex;
      height: var(--ai-sizing-tabbar-height);
      background: var(--ai-color-bg-raised);
      border-bottom: 1px solid var(--ai-color-border-default);
      flex-shrink: 0;
    }

    [role="tablist"] {
      display: flex;
      flex-direction: row;
      width: 100%;
    }

    .tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--ai-spacing-xs);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--ai-color-text-muted);
      font-family: var(--ai-font-family-sans);
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
      transition: color var(--ai-duration-fast), border-color var(--ai-duration-fast);
    }

    .tab:hover {
      color: var(--ai-color-text-secondary);
    }

    .tab[aria-selected="true"] {
      color: var(--ai-color-accent-default);
      border-bottom-color: var(--ai-color-accent-default);
    }

    .tab:focus-visible {
      outline: 2px solid var(--ai-color-border-focus);
      outline-offset: -2px;
    }

    .badge {
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--ai-radius-full);
      font-size: var(--ai-font-size-xs);
      font-family: var(--ai-font-family-mono);
    }

    .badge.running {
      background: var(--ai-color-accent-glow);
      color: var(--ai-color-accent-default);
    }

    .badge.failed {
      background: rgba(201, 110, 110, 0.2);
      color: var(--ai-color-semantic-danger);
    }
  `;

  @property({ type: String }) activeTab: AiTab = 'chat';
  @property({ type: Number }) agentTasksBadge = 0;
  @property({ type: String }) agentTasksBadgeType: 'running' | 'failed' | '' = '';

  render() {
    return html`
      <div role="tablist" aria-label="Panel tabs">
        ${(['chat', 'actions', 'agent-tasks'] as AiTab[]).map((tab) => this._renderTab(tab))}
      </div>
    `;
  }

  private _renderTab(tab: AiTab) {
    const isActive = this.activeTab === tab;
    const showBadge = tab === 'agent-tasks' && this.agentTasksBadge > 0;
    return html`
      <button
        class="tab"
        role="tab"
        aria-selected=${isActive}
        aria-controls="tabpanel-${tab}"
        id="tab-${tab}"
        @click=${() => this._selectTab(tab)}
        @keydown=${(e: KeyboardEvent) => this._onKeydown(e, tab)}
      >
        ${TAB_LABELS[tab]}
        ${showBadge ? html`
          <span class="badge ${this.agentTasksBadgeType}">${this.agentTasksBadge}</span>
        ` : ''}
      </button>
    `;
  }

  private _selectTab(tab: AiTab) {
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: { tab },
      bubbles: true,
      composed: true,
    }));
  }

  private _onKeydown(e: KeyboardEvent, currentTab: AiTab) {
    const tabs: AiTab[] = ['chat', 'actions', 'agent-tasks'];
    const idx = tabs.indexOf(currentTab);
    if (e.key === 'ArrowRight' && idx < tabs.length - 1) {
      e.preventDefault();
      this._selectTab(tabs[idx + 1]);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      this._selectTab(tabs[idx - 1]);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-tabs': AiTabs;
  }
}
