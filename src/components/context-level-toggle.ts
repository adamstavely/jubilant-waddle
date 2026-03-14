import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ContextLevel } from '../models/chat.js';

interface ContextOption {
  level: ContextLevel;
  icon: string;
  label: string;
  description: string;
}

const OPTIONS: ContextOption[] = [
  { level: 'full', icon: '📄', label: 'Full Document', description: 'Complete document text up to context limit.' },
  { level: 'visible', icon: '📏', label: 'Visible Pages', description: 'Only pages currently visible in the viewer.' },
  { level: 'none', icon: '🚫', label: 'No Context', description: 'No document text — generic assistant mode.' },
];

@customElement('context-level-toggle')
export class ContextLevelToggle extends LitElement {
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

    .toggle-btn.on {
      background: var(--ai-color-accent-glow);
      border-color: var(--ai-color-accent-dim);
      color: var(--ai-color-accent-default);
    }

    .toggle-btn.off {
      background: transparent;
      border-color: var(--ai-color-border-default);
      color: var(--ai-color-text-muted);
    }

    .icon-off {
      opacity: 0.4;
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

    .check {
      margin-left: auto;
      color: var(--ai-color-accent-default);
      flex-shrink: 0;
      align-self: center;
    }
  `;

  @property({ type: String }) contextLevel: ContextLevel = 'full';
  @state() private _flyoutOpen = false;

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
    // Left click on main area toggles full/none; chevron opens flyout
    const target = e.target as HTMLElement;
    if (target.classList.contains('chevron') || target.closest('.chevron')) {
      this._flyoutOpen = !this._flyoutOpen;
    } else if (this._flyoutOpen) {
      this._flyoutOpen = false;
    } else {
      const next: ContextLevel = this.contextLevel === 'none' ? 'full' : 'none';
      this._selectLevel(next);
    }
  }

  private _selectLevel(level: ContextLevel) {
    const prev = this.contextLevel;
    this._flyoutOpen = false;
    this.dispatchEvent(new CustomEvent('context-level-changed', {
      detail: { level, previousLevel: prev },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const isOn = this.contextLevel !== 'none';
    const current = OPTIONS.find(o => o.level === this.contextLevel)!;

    return html`
      <button
        class="toggle-btn ${isOn ? 'on' : 'off'}"
        title=${isOn ? 'Document context is included in requests.' : 'Document context is excluded.'}
        @click=${this._onToggle}
        aria-pressed=${isOn}
        aria-haspopup="true"
        aria-expanded=${this._flyoutOpen}
      >
        <span class="${isOn ? '' : 'icon-off'}">${current.icon}</span>
        <span>Doc</span>
        <span class="chevron">▾</span>
      </button>

      ${this._flyoutOpen ? html`
        <div class="flyout" role="menu" aria-label="Context scope">
          ${OPTIONS.map(opt => html`
            <div
              class="flyout-option ${opt.level === this.contextLevel ? 'selected' : ''}"
              role="menuitemradio"
              aria-checked=${opt.level === this.contextLevel}
              @click=${() => this._selectLevel(opt.level)}
            >
              <span class="opt-icon">${opt.icon}</span>
              <div>
                <div class="opt-label">${opt.label}</div>
                <div class="opt-desc">${opt.description}</div>
              </div>
              ${opt.level === this.contextLevel ? html`<span class="check">✓</span>` : nothing}
            </div>
          `)}
        </div>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'context-level-toggle': ContextLevelToggle;
  }
}
