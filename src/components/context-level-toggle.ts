import { LitElement, html, css, nothing, render } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ContextLevel, HistoryScope } from '../models/chat.js';
import { FileText, Briefcase, Ban, Check } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';

interface ContextOption {
  level: ContextLevel;
  iconData: Array<[string, Record<string, string | number | undefined>]>;
  label: string;
  description: string;
}

const OPTIONS: ContextOption[] = [
  { level: 'none', iconData: Ban, label: 'Off', description: 'No document context.' },
  { level: 'full', iconData: FileText, label: 'Single Doc', description: 'Current document only.' },
  { level: 'all-documents', iconData: Briefcase, label: 'All Docs', description: 'All documents in the session.' },
];

@customElement('context-level-toggle')
export class ContextLevelToggle extends LitElement {
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

    .toggle-btn.on {
      background: var(--ai-color-accent-glow);
      border-color: var(--ai-color-accent-dim);
      color: var(--ai-color-accent-default);
    }

    .toggle-btn.on .ai-icon {
      color: var(--ai-color-accent-default);
    }

    .toggle-btn.off {
      background: transparent;
      border-color: var(--ai-color-border-default);
      color: var(--ai-color-text-muted);
    }

    .toggle-btn svg {
      display: block;
      flex-shrink: 0;
      opacity: 1;
    }

    .icon-off {
      opacity: 0.4;
    }
  `];

  @property({ type: String }) contextLevel: ContextLevel = 'full';
  @property({ type: String }) historyScope: HistoryScope = 'per-document';
  @state() private _flyoutOpen = false;

  private _portalRoot: HTMLDivElement | null = null;
  private _flyoutStyle = '';
  private _boundDocClick = (e: MouseEvent) => this._handleDocClick(e);

  private _handleDocClick(e: MouseEvent) {
    const target = e.target as Node;
    if (!this.contains(target) && !this._portalRoot?.contains(target)) this._flyoutOpen = false;
  }

  private _positionFlyout() {
    const trigger = this.renderRoot.querySelector('.toggle-btn') as HTMLElement;
    if (trigger) {
      const r = trigger.getBoundingClientRect();
      this._flyoutStyle = `bottom: ${window.innerHeight - r.top + 4}px; right: ${window.innerWidth - r.right}px;`;
    }
  }

  override updated(changed: Map<string, unknown>) {
    if (this._flyoutOpen) {
      this._positionFlyout();
      requestAnimationFrame(() => {
        if (this._flyoutOpen) {
          this._renderPortal();
          setTimeout(() => document.addEventListener('click', this._boundDocClick, true), 0);
        }
      });
    } else {
      document.removeEventListener('click', this._boundDocClick, true);
      this._removePortal();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundDocClick, true);
    this._removePortal();
  }

  private static _portalStyles = `
    .context-level-portal .flyout {
      position: fixed;
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-border-bright);
      border-radius: var(--ai-radius-lg);
      box-shadow: var(--ai-shadow-lg);
      z-index: 1100;
      overflow: hidden;
      min-width: 220px;
    }
    .context-level-portal .flyout-option {
      display: flex;
      align-items: flex-start;
      gap: var(--ai-spacing-sm);
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      cursor: pointer;
      transition: background var(--ai-duration-fast);
    }
    .context-level-portal .flyout-option:hover { background: var(--ai-color-bg-overlay); }
    .context-level-portal .flyout-option.selected { background: var(--ai-color-accent-glow); }
    .context-level-portal .flyout-option.selected .ai-icon { color: var(--ai-color-accent-default); }
    .context-level-portal .opt-icon { display: flex; align-items: center; flex-shrink: 0; margin-top: 1px; }
    .context-level-portal .opt-label { font-size: var(--ai-font-size-sm); font-weight: 600; color: var(--ai-color-text-primary); margin-bottom: 2px; }
    .context-level-portal .opt-desc { font-size: var(--ai-font-size-xs); color: var(--ai-color-text-muted); line-height: 1.4; }
    .context-level-portal .check { margin-left: auto; color: var(--ai-color-accent-default); flex-shrink: 0; align-self: center; }
    .context-level-portal .check .ai-icon { color: var(--ai-color-accent-default); }
  `;

  private _renderPortal() {
    if (!this._portalRoot) {
      this._portalRoot = document.createElement('div');
      this._portalRoot.className = 'context-level-portal';
      this._portalRoot.style.cssText = 'position:fixed;inset:0;pointer-events:auto;z-index:2147483647';
      const style = document.createElement('style');
      style.textContent = ContextLevelToggle._portalStyles;
      this._portalRoot.appendChild(style);
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:0;background:transparent';
      overlay.addEventListener('click', () => { this._flyoutOpen = false; });
      this._portalRoot.appendChild(overlay);
      document.body.appendChild(this._portalRoot);
    }
    const content = this._renderFlyoutContent();
    const wrapper = document.createElement('div');
    wrapper.className = 'portal-flyout';
    wrapper.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none';
    const host = document.createElement('div');
    host.style.pointerEvents = 'auto';
    render(content, host);
    wrapper.appendChild(host);
    const existing = this._portalRoot.querySelector('.portal-flyout');
    if (existing) existing.remove();
    this._portalRoot.appendChild(wrapper);
  }

  private _removePortal() {
    if (this._portalRoot?.parentNode) {
      this._portalRoot.parentNode.removeChild(this._portalRoot);
      this._portalRoot = null;
    }
  }

  private _renderFlyoutContent() {
    return html`
      <div class="flyout" role="menu" aria-label="Context scope" style=${this._flyoutStyle}>
        ${OPTIONS.map(opt => html`
          <div
            class="flyout-option ${opt.level === this.contextLevel ? 'selected' : ''}"
            role="menuitemradio"
            aria-checked=${opt.level === this.contextLevel}
            @click=${() => this._selectLevel(opt.level)}
          >
            <span class="opt-icon">${renderIcon(opt.iconData, 16, opt.level === this.contextLevel ? 'accent' : 'default')}</span>
            <div>
              <div class="opt-label">${opt.label}</div>
              <div class="opt-desc">${opt.description}</div>
            </div>
            ${opt.level === this.contextLevel ? html`<span class="check">${renderIcon(Check, 14, 'accent')}</span>` : nothing}
          </div>
        `)}
      </div>
    `;
  }

  private _onToggle() {
    this._flyoutOpen = !this._flyoutOpen;
  }

  private _selectLevel(level: ContextLevel) {
    const prev = this.contextLevel;
    this._flyoutOpen = false;
    this.dispatchEvent(new CustomEvent('context-level-changed', {
      detail: { level, previousLevel: prev },
      bubbles: true,
      composed: true,
    }));
    if (level !== 'none') {
      const scope: HistoryScope = level === 'all-documents' ? 'all-documents' : 'per-document';
      if (scope !== this.historyScope) {
        this.dispatchEvent(new CustomEvent('history-scope-changed', {
          detail: { scope, previousScope: this.historyScope },
          bubbles: true,
          composed: true,
        }));
      }
    }
  }

  render() {
    const isOn = this.contextLevel !== 'none';
    const current = OPTIONS.find(o => o.level === this.contextLevel) ?? OPTIONS[0];

    return html`
      <button
        class="toggle-btn ${isOn ? 'on' : 'off'}"
        title=${current.description}
        aria-label="Document context: ${current.label}"
        @click=${this._onToggle}
        aria-pressed=${isOn}
        aria-haspopup="listbox"
        aria-expanded=${this._flyoutOpen}
      >
        <span class="${isOn ? '' : 'icon-off'}">${renderIcon(current.iconData, 16, isOn ? 'accent' : 'default')}</span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'context-level-toggle': ContextLevelToggle;
  }
}
