/**
 * ai-header
 *
 * Panel header with logo, title, document name, model badge, and close button.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { X } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';

@customElement('ai-header')
export class AiHeader extends LitElement {
  static styles = [
    iconStyles,
    css`
      :host {
        display: flex;
        align-items: center;
        padding: 0 var(--ai-spacing-md);
        height: var(--ai-sizing-header-height);
        background: var(--ai-color-bg-raised);
        border-bottom: 1px solid var(--ai-color-border-default);
        flex-shrink: 0;
        gap: var(--ai-spacing-sm);
      }

      .logo {
        width: 24px;
        height: 24px;
        border-radius: var(--ai-radius-sm);
        background: conic-gradient(
          from 0deg,
          var(--ai-color-accent-default) 0deg,
          var(--ai-color-accent-dim) 120deg,
          var(--ai-color-accent-default) 240deg,
          var(--ai-color-accent-dim) 360deg
        );
        animation: logo-spin 3s linear infinite;
      }

      @keyframes logo-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .logo { animation: none; }
      }

      .title-block {
        flex: 1;
        min-width: 0;
      }

      .title {
        font-family: var(--ai-font-family-serif);
        font-size: var(--ai-font-size-md);
        color: var(--ai-color-text-primary);
      }

      .title strong {
        color: var(--ai-color-accent-default);
      }

      .doc-name {
        font-family: var(--ai-font-family-mono);
        font-size: var(--ai-font-size-xs);
        color: var(--ai-color-text-muted);
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .model-badge {
        flex-shrink: 0;
        padding: 2px var(--ai-spacing-xs);
        background: var(--ai-color-accent-glow);
        border: 1px solid var(--ai-color-accent-dim);
        border-radius: var(--ai-radius-full);
        font-family: var(--ai-font-family-mono);
        font-size: var(--ai-font-size-xs);
        color: var(--ai-color-accent-default);
      }

      .close-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        border-radius: var(--ai-radius-sm);
        color: var(--ai-color-text-secondary);
        cursor: pointer;
        transition: background var(--ai-duration-fast), color var(--ai-duration-fast);
      }

      .close-btn:hover {
        background: var(--ai-color-bg-overlay);
        color: var(--ai-color-text-primary);
      }

      .close-btn:focus-visible {
        outline: 2px solid var(--ai-color-border-focus);
        outline-offset: 2px;
      }
    `,
  ];

  @property({ type: String }) documentName = '';
  @property({ type: String, attribute: 'model-label' }) modelLabel = 'ARBOR-4';

  render() {
    return html`
      <div class="logo" aria-hidden="true"></div>
      <div class="title-block">
        <div class="title"><strong>ARBOR</strong> AI Assist</div>
        ${this.documentName ? html`<div class="doc-name">${this.documentName}</div>` : ''}
      </div>
      ${this.modelLabel ? html`<span class="model-badge">${this.modelLabel}</span>` : ''}
      <button
        class="close-btn"
        aria-label="Close panel"
        @click=${this._onClose}
      >
        ${renderIcon(X, 18, 'default')}
      </button>
    `;
  }

  private _onClose() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-header': AiHeader;
  }
}
