import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HistoryScope } from '../models/chat.js';

@customElement('history-toggle')
export class HistoryToggle extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      position: relative;
      font-family: var(--ai-font-family-sans);
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-xs);
      padding: 6px var(--ai-spacing-sm);
      border-radius: var(--ai-radius-md);
      border: 1px solid;
      cursor: pointer;
      font-size: var(--ai-font-size-sm);
      white-space: nowrap;
      transition: background var(--ai-duration-fast), border-color var(--ai-duration-fast);
    }

    .toggle-btn.save {
      background: var(--ai-color-accent-glow);
      border-color: var(--ai-color-accent-dim);
      color: var(--ai-color-accent-default);
    }

    .toggle-btn.discard {
      background: transparent;
      border-color: var(--ai-color-border-default);
      color: var(--ai-color-text-muted);
    }

    .chevron {
      font-size: 10px;
      opacity: 0.7;
    }

    /* Flyout */
    .flyout {
      position: absolute;
      bottom: calc(100% + 4px);
      right: 0;
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-border-bright);
      border-radius: var(--ai-radius-lg);
      box-shadow: var(--ai-shadow-lg);
      z-index: var(--ai-z-tooltip);
      overflow: hidden;
      min-width: 220px;
    }

    .flyout-option {
      display: flex;
      align-items: flex-start;
      gap: var(--ai-spacing-sm);
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      cursor: pointer;
      transition: background var(--ai-duration-fast);
    }

    .flyout-option:hover {
      background: var(--ai-color-bg-overlay);
    }

    .flyout-option.selected {
      background: var(--ai-color-accent-glow);
    }

    .opt-icon {
      font-size: var(--ai-font-size-base);
      flex-shrink: 0;
      margin-top: 1px;
    }

    .opt-label {
      font-size: var(--ai-font-size-sm);
      font-weight: 600;
      color: var(--ai-color-text-primary);
      margin-bottom: 2px;
    }

    .opt-desc {
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      line-height: 1.4;
    }

    .divider {
      height: 1px;
      background: var(--ai-color-border-default);
      margin: 4px 0;
    }

    .danger-option {
      color: var(--ai-color-semantic-danger);
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      cursor: pointer;
      font-size: var(--ai-font-size-sm);
      transition: background var(--ai-duration-fast);
    }

    .danger-option:hover {
      background: rgba(239, 68, 68, 0.08);
    }

    /* Confirmation toast */
    .toast {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-semantic-danger);
      border-radius: var(--ai-radius-lg);
      box-shadow: var(--ai-shadow-lg);
      padding: var(--ai-spacing-md) var(--ai-spacing-lg);
      z-index: var(--ai-z-modal);
      min-width: 280px;
      text-align: center;
    }

    .toast-msg {
      font-size: var(--ai-font-size-sm);
      color: var(--ai-color-text-primary);
      margin-bottom: var(--ai-spacing-md);
    }

    .toast-actions {
      display: flex;
      gap: var(--ai-spacing-sm);
      justify-content: center;
    }

    .toast-confirm {
      padding: var(--ai-spacing-xs) var(--ai-spacing-md);
      background: var(--ai-color-semantic-danger);
      border: none;
      border-radius: var(--ai-radius-sm);
      color: white;
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
    }

    .toast-cancel {
      padding: var(--ai-spacing-xs) var(--ai-spacing-md);
      background: transparent;
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-secondary);
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
    }
  `;

  @property({ type: Boolean }) historyPersist = true;
  @property({ type: String }) historyScope: HistoryScope = 'per-document';
  @property({ type: String }) documentName = '';

  @state() private _flyoutOpen = false;
  @state() private _showClearConfirm = false;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._handleDocClick.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleDocClick.bind(this));
  }

  private _handleDocClick(e: MouseEvent) {
    if (!this.contains(e.target as Node)) this._flyoutOpen = false;
  }

  private _onToggle(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains('chevron') || target.closest('.chevron')) {
      this._flyoutOpen = !this._flyoutOpen;
    } else if (this._flyoutOpen) {
      this._flyoutOpen = false;
    } else {
      this._togglePersist();
    }
  }

  private _togglePersist() {
    this.dispatchEvent(new CustomEvent('history-persistence-changed', {
      detail: { save: !this.historyPersist },
      bubbles: true,
      composed: true,
    }));
  }

  private _selectScope(scope: HistoryScope) {
    const prev = this.historyScope;
    this._flyoutOpen = false;
    if (scope !== prev) {
      this.dispatchEvent(new CustomEvent('history-scope-changed', {
        detail: { scope, previousScope: prev },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private _requestClear() {
    this._flyoutOpen = false;
    this._showClearConfirm = true;
  }

  private _confirmClear() {
    this._showClearConfirm = false;
    this.dispatchEvent(new CustomEvent('chat-history-cleared', {
      detail: { documentId: '' },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const label = this.historyPersist ? 'Saved' : 'Off';
    const modeClass = this.historyPersist ? 'save' : 'discard';

    return html`
      <button
        class="toggle-btn ${modeClass}"
        title=${this.historyPersist ? 'Chat history is saved per document.' : 'Chat history is not saved — clears on panel close.'}
        @click=${this._onToggle}
        aria-pressed=${this.historyPersist}
        aria-haspopup="true"
        aria-expanded=${this._flyoutOpen}
      >
        <span>💾</span>
        <span>${label}</span>
        <span class="chevron">▾</span>
      </button>

      ${this._flyoutOpen ? html`
        <div class="flyout" role="menu" aria-label="History options">
          <div
            class="flyout-option ${this.historyScope === 'per-document' ? 'selected' : ''}"
            role="menuitemradio"
            aria-checked=${this.historyScope === 'per-document'}
            @click=${() => this._selectScope('per-document')}
          >
            <span class="opt-icon">📄</span>
            <div>
              <div class="opt-label">Per Document</div>
              <div class="opt-desc">Each document has its own conversation thread.</div>
            </div>
          </div>
          <div
            class="flyout-option ${this.historyScope === 'all-documents' ? 'selected' : ''}"
            role="menuitemradio"
            aria-checked=${this.historyScope === 'all-documents'}
            @click=${() => this._selectScope('all-documents')}
          >
            <span class="opt-icon">💼</span>
            <div>
              <div class="opt-label">All Documents</div>
              <div class="opt-desc">Single thread spans all documents in the session.</div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="danger-option" role="menuitem" @click=${this._requestClear}>
            🗑 Clear history…
          </div>
        </div>
      ` : nothing}

      ${this._showClearConfirm ? html`
        <div class="toast" role="dialog" aria-modal="true" aria-label="Clear history confirmation">
          <div class="toast-msg">
            Clear chat history${this.documentName ? ` for ${this.documentName}` : ''}? This cannot be undone.
          </div>
          <div class="toast-actions">
            <button class="toast-cancel" @click=${() => (this._showClearConfirm = false)}>Cancel</button>
            <button class="toast-confirm" @click=${this._confirmClear}>Clear</button>
          </div>
        </div>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'history-toggle': HistoryToggle;
  }
}
