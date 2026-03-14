import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { TokenUsage } from '../models/chat.js';
import { TriangleAlert } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';

@customElement('context-window-indicator')
export class ContextWindowIndicator extends LitElement {
  static styles = [
    iconStyles,
    css`
    :host {
      display: block;
      height: 32px;
      background: var(--ai-color-bg-raised);
      font-family: var(--ai-font-family-mono);
      position: relative;
    }

    .strip {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 var(--ai-spacing-md);
      gap: var(--ai-spacing-sm);
      position: relative;
    }

    .progress-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--ai-color-bg-raised);
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      transition: width var(--ai-duration-normal) var(--ai-easing-standard),
                  background-color var(--ai-duration-normal) var(--ai-easing-standard);
    }

    .progress-bar.zone-normal  { background: var(--ai-color-semantic-success); }
    .progress-bar.zone-warning { background: var(--ai-color-semantic-warning); }
    .progress-bar.zone-danger  { background: var(--ai-color-semantic-danger); }

    .pct-label {
      font-size: var(--ai-font-size-xs);
      flex-shrink: 0;
    }

    .pct-label.zone-normal  { color: var(--ai-color-semantic-success); }
    .pct-label.zone-warning { color: var(--ai-color-semantic-warning); }
    .pct-label.zone-danger  { color: var(--ai-color-semantic-danger); }

    .spacer { flex: 1; }

    .token-label {
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-secondary);
      flex-shrink: 0;
    }

    /* Tooltip */
    .tooltip-target {
      position: absolute;
      inset: 0;
      cursor: default;
    }

    .tooltip {
      position: absolute;
      top: calc(100% + 4px);
      right: var(--ai-spacing-md);
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-md);
      box-shadow: var(--ai-shadow-md);
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-secondary);
      white-space: nowrap;
      z-index: var(--ai-z-tooltip);
      pointer-events: none;
    }

    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: var(--ai-spacing-xl);
      line-height: 1.8;
    }

    .tooltip-row .val {
      color: var(--ai-color-text-primary);
    }

    /* Warning banner */
    .warning-banner {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-xs);
      padding: 3px var(--ai-spacing-md);
      background: rgba(239, 68, 68, 0.1);
      border-bottom: 1px solid var(--ai-color-semantic-danger);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-semantic-danger);
      z-index: 10;
    }

    .warning-banner .warning-icon {
      flex-shrink: 0;
      display: flex;
    }

    .warning-banner .ai-icon {
      color: var(--ai-color-semantic-danger);
    }
  `];

  @property({ type: Object }) tokenUsage: TokenUsage | null = null;
  @property({ type: Number }) contextLimit = 128000;

  @state() private _showTooltip = false;

  private get _pct(): number {
    const usage = this.tokenUsage;
    if (!usage) return 0;
    return Math.min(100, (usage.totalUsed / usage.contextLimit) * 100);
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

  updated(changed: Map<string, unknown>) {
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
  }

  render() {
    const usage = this.tokenUsage;
    const pct = this._pct;
    const zone = this._zone;
    const estimated = !usage;
    const limit = usage?.contextLimit ?? this.contextLimit;
    const used = usage?.totalUsed ?? 0;
    const pctLabel = estimated ? `~${Math.round(pct)}% used` : `${Math.round(pct)}% used`;
    const tokenLabel = estimated
      ? `~${this._fmt(used)} / ${this._fmt(limit)} tokens`
      : `${this._fmt(used)} / ${this._fmt(limit)} tokens`;

    return html`
      <div
        class="strip"
        @mouseenter=${() => (this._showTooltip = true)}
        @mouseleave=${() => (this._showTooltip = false)}
      >
        <span class="pct-label zone-${zone}">${pctLabel}</span>
        <span class="spacer"></span>
        <span class="token-label">${tokenLabel}</span>

        ${this._showTooltip && usage ? html`
          <div class="tooltip" role="tooltip">
            <div class="tooltip-row">
              <span>Document</span>
              <span class="val">${this._fmt(usage.documentTokens)}</span>
            </div>
            <div class="tooltip-row">
              <span>History</span>
              <span class="val">${this._fmt(usage.historyTokens)}</span>
            </div>
            <div class="tooltip-row">
              <span>System</span>
              <span class="val">${this._fmt(usage.systemTokens)}</span>
            </div>
            <div class="tooltip-row">
              <span>Remaining</span>
              <span class="val">${this._fmt(usage.remaining)}</span>
            </div>
          </div>
        ` : nothing}

        <div class="progress-container">
          <div
            class="progress-bar zone-${zone}"
            style="width: ${pct}%"
            role="progressbar"
            aria-valuenow=${Math.round(pct)}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      ${zone === 'danger' ? html`
        <div class="warning-banner" role="alert">
          <span class="warning-icon">${renderIcon(TriangleAlert, 14, 'danger')}</span>
          Context window nearly full. Oldest messages may be truncated.
        </div>
      ` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'context-window-indicator': ContextWindowIndicator;
  }
}
