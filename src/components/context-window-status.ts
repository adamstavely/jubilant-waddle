/**
 * context-window-status
 *
 * Compact context window indicator for the control bar. Shows a small donut
 * with usage; hover/click reveals a popover with full donut chart breakdown.
 */
import { LitElement, html, svg, css, nothing, render } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { TokenUsage } from '../models/chat.js';
import { TriangleAlert } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';

const DONUT_R = 16;
const DONUT_STROKE = 4;
const DONUT_C = 2 * Math.PI * DONUT_R;

@customElement('context-window-status')
export class ContextWindowStatus extends LitElement {
  static styles = [
    iconStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        position: relative;
        font-family: var(--ai-font-family-sans);
        overflow-x: hidden;
      }

      .trigger {
        display: flex;
        align-items: center;
        gap: var(--ai-spacing-xs);
        padding: 4px var(--ai-spacing-sm);
        overflow: hidden;
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--ai-radius-sm);
        cursor: pointer;
        color: var(--ai-color-text-secondary);
        font-size: var(--ai-font-size-xs);
        transition: background var(--ai-duration-fast), border-color var(--ai-duration-fast),
          color var(--ai-duration-fast);
        flex-shrink: 0;
      }

      .trigger:hover {
        background: var(--ai-color-bg-overlay);
        color: var(--ai-color-text-primary);
        border-color: var(--ai-color-border-default);
      }

      .trigger:focus-visible {
        outline: 2px solid var(--ai-color-border-focus);
        outline-offset: 2px;
      }

      .donut-mini {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      /* Popover - fixed to avoid control bar overflow clipping */
      .popover {
        position: fixed;
        bottom: auto;
        left: auto;
        background: var(--ai-color-bg-surface);
        border: 1px solid var(--ai-color-border-default);
        border-radius: var(--ai-radius-md);
        box-shadow: var(--ai-shadow-md);
        padding: var(--ai-spacing-sm) var(--ai-spacing-md);
        z-index: var(--ai-z-tooltip);
        width: max-content;
        max-width: min(200px, calc(100vw - 24px));
        pointer-events: auto;
        overflow: hidden;
      }

      .popover::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: var(--ai-color-bg-surface);
      }

      .popover-title {
        font-size: var(--ai-font-size-sm);
        font-weight: 600;
        color: var(--ai-color-text-primary);
        margin-bottom: var(--ai-spacing-sm);
        text-align: center;
      }

      .donut-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--ai-spacing-sm);
        margin-bottom: var(--ai-spacing-sm);
        margin-left: auto;
        margin-right: auto;
      }

      .donut-pct {
        font-size: var(--ai-font-size-sm);
        font-weight: 600;
        color: var(--ai-color-text-primary);
        font-family: var(--ai-font-family-mono);
      }

      .donut-svg {
        width: 32px;
        height: 32px;
        max-width: 32px;
        max-height: 32px;
      }

      .breakdown {
        display: flex;
        flex-direction: column;
        gap: var(--ai-spacing-xs);
      }

      .breakdown-row {
        display: flex;
        align-items: center;
        gap: var(--ai-spacing-sm);
        font-size: var(--ai-font-size-xs);
      }

      .breakdown-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .breakdown-label {
        flex: 1;
        color: var(--ai-color-text-secondary);
      }

      .breakdown-val {
        font-family: var(--ai-font-family-mono);
        color: var(--ai-color-text-primary);
      }

      .warning-banner {
        display: flex;
        align-items: center;
        gap: var(--ai-spacing-xs);
        margin-top: var(--ai-spacing-sm);
        padding: var(--ai-spacing-xs);
        background: rgba(239, 68, 68, 0.1);
        border-radius: var(--ai-radius-sm);
        font-size: var(--ai-font-size-xs);
        color: var(--ai-color-semantic-danger);
      }

      .warning-banner .ai-icon {
        flex-shrink: 0;
      }
    `,
  ];

  @property({ type: Object }) tokenUsage: TokenUsage | null = null;
  @property({ type: Number }) contextLimit = 128000;

  @state() private _open = false;
  @state() private _popoverStyle = '';

  private get _pct(): number {
    const u = this.tokenUsage;
    if (!u) return 0;
    return Math.min(100, (u.totalUsed / u.contextLimit) * 100);
  }

  private get _zone(): 'normal' | 'warning' | 'danger' {
    const p = this._pct;
    if (p >= 90) return 'danger';
    if (p >= 70) return 'warning';
    return 'normal';
  }

  private _fmt(n: number): string {
    return n.toLocaleString();
  }

  private _segments() {
    const u = this.tokenUsage;
    const limit = u?.contextLimit ?? this.contextLimit;
    const total = Math.max(limit, u?.totalUsed ?? 0);
    const doc = u?.documentTokens ?? 0;
    const hist = u?.historyTokens ?? 0;
    const sys = u?.systemTokens ?? 0;
    const rem = Math.max(0, u?.remaining ?? limit);

    return [
      { label: 'Document', value: doc, pct: total ? (doc / total) * 100 : 0, color: '#4f46e5' },
      { label: 'History', value: hist, pct: total ? (hist / total) * 100 : 0, color: '#6366f1' },
      { label: 'System', value: sys, pct: total ? (sys / total) * 100 : 0, color: '#818cf8' },
      { label: 'Remaining', value: rem, pct: total ? (rem / total) * 100 : 100, color: '#e5e7eb' },
    ];
  }

  private _donutSegments() {
    const segs = this._segments();
    const C = 2 * Math.PI * 32;
    let offset = 0;
    return segs.map((s) => {
      const dash = (s.pct / 100) * C;
      const o = -offset;
      offset += dash;
      return { ...s, dash, offset: o };
    });
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('tokenUsage') && this.tokenUsage) {
      const pct = this._pct;
      if (pct >= 90) {
        this.dispatchEvent(new CustomEvent('context-window-warning', {
          detail: {
            percentUsed: pct,
            remaining: this.tokenUsage.remaining,
            totalUsed: this.tokenUsage.totalUsed,
            contextLimit: this.tokenUsage.contextLimit,
          },
          bubbles: true,
          composed: true,
        }));
      }
    }
    if (this._open) {
      this._positionPopover();
      this._boundClose = this._closeOnOutsideClick.bind(this);
      setTimeout(() => document.addEventListener('click', this._boundClose!, true), 10);
      this._renderPortal();
    } else {
      if (this._boundClose) {
        document.removeEventListener('click', this._boundClose, true);
      }
      this._removePortal();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._boundClose) {
      document.removeEventListener('click', this._boundClose, true);
    }
    this._removePortal();
  }

  private _portalRoot: HTMLDivElement | null = null;

  private _removePortal() {
    if (this._portalRoot?.parentNode) {
      this._portalRoot.parentNode.removeChild(this._portalRoot);
      this._portalRoot = null;
    }
  }

  private _boundClose?: (e: MouseEvent) => void;

  private _closeOnOutsideClick(e: MouseEvent) {
    const target = e.target as Node;
    const inTrigger = this.shadowRoot?.contains(target);
    const inPortal = this._portalRoot?.contains(target);
    if (!inTrigger && !inPortal) {
      this._open = false;
      document.removeEventListener('click', this._boundClose!, true);
    }
  }

  private _togglePopover() {
    this._open = !this._open;
  }

  private _positionPopover() {
    const trigger = this.renderRoot.querySelector('.trigger') as HTMLElement;
    if (trigger) {
      const r = trigger.getBoundingClientRect();
      this._popoverStyle = `top: ${r.top - 8}px; left: ${r.left + r.width / 2}px; transform: translate(-50%, -100%);`;
    }
  }

  private static _portalStyles = `
    .ctx-popover-portal .popover {
      position: fixed;
      background: var(--ai-color-bg-surface);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-md);
      box-shadow: var(--ai-shadow-md);
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      z-index: 1100;
      width: max-content;
      max-width: min(200px, calc(100vw - 24px));
      pointer-events: auto;
      overflow: hidden;
    }
    .ctx-popover-portal .popover::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: var(--ai-color-bg-surface);
    }
    .ctx-popover-portal .popover-title {
      font-size: var(--ai-font-size-sm);
      font-weight: 600;
      color: var(--ai-color-text-primary);
      margin-bottom: var(--ai-spacing-sm);
      text-align: center;
    }
    .ctx-popover-portal .donut-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--ai-spacing-sm);
      margin-bottom: var(--ai-spacing-sm);
      margin-left: auto;
      margin-right: auto;
      flex-shrink: 0;
    }
    .ctx-popover-portal .donut-pct {
      font-size: var(--ai-font-size-sm);
      font-weight: 600;
      color: var(--ai-color-text-primary);
      font-family: var(--ai-font-family-mono);
    }
    .ctx-popover-portal .donut-svg {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      max-width: 32px;
      max-height: 32px;
      flex-shrink: 0;
      display: block;
    }
    .ctx-popover-portal .breakdown {
      display: flex;
      flex-direction: column;
      gap: var(--ai-spacing-xs);
    }
    .ctx-popover-portal .breakdown-row {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-sm);
      font-size: var(--ai-font-size-xs);
    }
    .ctx-popover-portal .breakdown-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .ctx-popover-portal .breakdown-label {
      flex: 1;
      color: var(--ai-color-text-secondary);
    }
    .ctx-popover-portal .breakdown-val {
      font-family: var(--ai-font-family-mono);
      color: var(--ai-color-text-primary);
    }
    .ctx-popover-portal .warning-banner {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-xs);
      margin-top: var(--ai-spacing-sm);
      padding: var(--ai-spacing-xs);
      background: rgba(239, 68, 68, 0.1);
      border-radius: var(--ai-radius-sm);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-semantic-danger);
    }
    .ctx-popover-portal .warning-banner .ai-icon {
      flex-shrink: 0;
    }
  `;

  private _renderPortal() {
    if (!this._portalRoot) {
      this._portalRoot = document.createElement('div');
      this._portalRoot.className = 'ctx-popover-portal';
      this._portalRoot.style.cssText = 'position:fixed;inset:0;pointer-events:auto;z-index:9999';
      const style = document.createElement('style');
      style.textContent = ContextWindowStatus._portalStyles;
      this._portalRoot.appendChild(style);
      const overlay = document.createElement('div');
      overlay.className = 'portal-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:0';
      overlay.addEventListener('click', () => {
        this._open = false;
        document.removeEventListener('click', this._boundClose!, true);
      });
      this._portalRoot.appendChild(overlay);
      document.body.appendChild(this._portalRoot);
    }
    const popoverContent = this._renderPopoverContent();
    const wrapper = document.createElement('div');
    wrapper.className = 'portal-content';
    wrapper.style.cssText = 'position:relative;z-index:1;pointer-events:none';
    const popoverHost = document.createElement('div');
    popoverHost.style.pointerEvents = 'auto';
    render(popoverContent, popoverHost);
    wrapper.appendChild(popoverHost);
    const existing = this._portalRoot.querySelector('.portal-content');
    if (existing) existing.remove();
    this._portalRoot.appendChild(wrapper);
  }

  private _onBlur(e: FocusEvent) {
    if (!this.contains(e.relatedTarget as Node)) {
      this._open = false;
    }
  }

  private _renderPopoverContent() {
    const zone = this._zone;
    const segments = this._segments();
    const donutSegs = this._donutSegments();
    return html`
      <div class="popover" role="dialog" aria-label="Context window breakdown" style=${this._popoverStyle}>
        <div class="popover-title">Context Window</div>
        <div class="donut-container">
          <svg class="donut-svg" viewBox="0 0 80 80" width="32" height="32">
            ${donutSegs.map((s) => svg`
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke=${s.color}
                stroke-width="16"
                stroke-dasharray="${s.dash} 999"
                stroke-dashoffset="${s.offset}"
                transform="rotate(-90 40 40)"
              />
            `)}
            ${svg`<circle cx="40" cy="40" r="24" fill="var(--ai-color-bg-surface)" />`}
          </svg>
          <span class="donut-pct">${this._pct.toFixed(1)}%</span>
        </div>
        <div class="breakdown">
          ${segments.map((s) => html`
            <div class="breakdown-row">
              <span class="breakdown-dot" style="background: ${s.color}"></span>
              <span class="breakdown-label">${s.label}</span>
              <span class="breakdown-val">${this._fmt(s.value)}</span>
            </div>
          `)}
        </div>
        ${zone === 'danger' ? html`
          <div class="warning-banner" role="alert">
            ${renderIcon(TriangleAlert, 14, 'danger')}
            Context window nearly full.
          </div>
        ` : nothing}
      </div>
    `;
  }

  render() {
    const u = this.tokenUsage;
    const pct = this._pct;
    const zone = this._zone;
    const limit = u?.contextLimit ?? this.contextLimit;
    const used = u?.totalUsed ?? 0;

    return html`
      <div
        class="trigger"
        role="button"
        tabindex="0"
        aria-haspopup="true"
        aria-expanded=${this._open}
        aria-label="Context window usage"
        title="Context window: ${this._fmt(used)} / ${this._fmt(limit)} tokens"
        @click=${this._togglePopover}
        @blur=${this._onBlur}
      >
        <svg class="donut-mini" viewBox="0 0 36 36" aria-hidden="true">
          <circle
            cx="18"
            cy="18"
            r=${DONUT_R}
            fill="none"
            stroke="var(--ai-color-bg-overlay)"
            stroke-width=${DONUT_STROKE}
          />
          <circle
            cx="18"
            cy="18"
            r=${DONUT_R}
            fill="none"
            stroke=${zone === 'danger' ? 'var(--ai-color-semantic-danger)' : zone === 'warning' ? 'var(--ai-color-semantic-warning)' : 'var(--ai-color-semantic-success)'}
            stroke-width=${DONUT_STROKE}
            stroke-dasharray="${(pct / 100) * DONUT_C} ${DONUT_C}"
            stroke-dashoffset="0"
            transform="rotate(-90 18 18)"
          />
        </svg>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'context-window-status': ContextWindowStatus;
  }
}
