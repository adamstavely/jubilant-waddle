/**
 * action-tile
 *
 * Single action tile for the Actions tab grid/list.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ActionConfig } from '../models/action.js';
import { FileText } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';

@customElement('action-tile')
export class ActionTile extends LitElement {
  static styles = [
    iconStyles,
    css`
      :host {
        display: block;
      }

      .tile {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--ai-spacing-xs);
        padding: var(--ai-spacing-md);
        background: var(--ai-color-bg-raised);
        border: 1px solid var(--ai-color-border-default);
        border-radius: var(--ai-radius-md);
        cursor: pointer;
        transition: border-color var(--ai-duration-fast), background var(--ai-duration-fast);
      }

      .tile:hover {
        border-color: var(--ai-color-accent-default);
        background: var(--ai-color-bg-overlay);
      }

      .tile:hover .tile-title {
        color: var(--ai-color-accent-default);
      }

      .tile[data-running] {
        border-color: var(--ai-color-accent-default);
      }

      .tile[data-running] .tile-icon {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .tile[data-running] .tile-icon { animation: none; }
      }

      .tile-icon {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }

      .tile-title {
        font-family: var(--ai-font-family-mono);
        font-size: var(--ai-font-size-sm);
        color: var(--ai-color-text-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tile-desc {
        font-family: var(--ai-font-family-sans);
        font-size: var(--ai-font-size-xs);
        color: var(--ai-color-text-muted);
        line-height: 1.4;
      }
    `,
  ];

  @property({ type: Object }) action!: ActionConfig;
  @property({ type: Boolean }) running = false;

  render() {
    return html`
      <div
        class="tile"
        ?data-running=${this.running}
        role="button"
        tabindex="0"
        @click=${this._onClick}
        @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._onClick()}
      >
        <span class="tile-icon">${renderIcon(FileText, 22, 'default')}</span>
        <span class="tile-title">${this.action.label}</span>
        <span class="tile-desc">${this.action.description}</span>
      </div>
    `;
  }

  private _onClick() {
    if (this.running) return;
    this.dispatchEvent(new CustomEvent('action-triggered', {
      detail: { actionId: this.action.id, scope: this.action.scope },
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'action-tile': ActionTile;
  }
}
