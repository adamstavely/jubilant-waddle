import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HistoryScope } from '../models/chat.js';
import { Save } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';

@customElement('history-toggle')
export class HistoryToggle extends LitElement {
  static styles = [
    iconStyles,
    css`
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

    .toggle-btn.save .ai-icon {
      color: var(--ai-color-accent-default);
    }

    .toggle-btn.discard {
      background: transparent;
      border-color: var(--ai-color-border-default);
      color: var(--ai-color-text-muted);
    }

    .toggle-btn svg {
      display: block;
      flex-shrink: 0;
      opacity: 1;
    }

  `];

  @property({ type: Boolean }) historyPersist = true;
  @property({ type: String }) historyScope: HistoryScope = 'per-document';
  @property({ type: String }) documentName = '';


  private _onToggle() {
    this._togglePersist();
  }

  private _togglePersist() {
    this.dispatchEvent(new CustomEvent('history-persistence-changed', {
      detail: { save: !this.historyPersist },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const modeClass = this.historyPersist ? 'save' : 'discard';

    return html`
      <button
        class="toggle-btn ${modeClass}"
        title=${this.historyPersist ? 'Chat history is saved.' : 'Chat history is not saved — clears on panel close.'}
        aria-label=${this.historyPersist ? 'History saved' : 'History off'}
        @click=${this._onToggle}
        aria-pressed=${this.historyPersist}
      >
        <span class="icon-wrap">${renderIcon(Save, 16, this.historyPersist ? 'accent' : 'default')}</span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'history-toggle': HistoryToggle;
  }
}
