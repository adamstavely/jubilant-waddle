/**
 * agent-task-item
 *
 * Single task card for the Agent Tasks tab.
 */
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AgentTask } from '../models/agent-task.js';
import { X } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';

@customElement('agent-task-item')
export class AgentTaskItem extends LitElement {
  static styles = [
    iconStyles,
    css`
      :host {
        display: block;
      }

      .card {
        padding: var(--ai-spacing-md);
        background: var(--ai-color-bg-raised);
        border: 1px solid var(--ai-color-border-default);
        border-radius: var(--ai-radius-md);
        margin-bottom: var(--ai-spacing-sm);
      }

      .card-header {
        display: flex;
        align-items: flex-start;
        gap: var(--ai-spacing-sm);
        margin-bottom: var(--ai-spacing-xs);
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 6px;
      }

      .status-dot.running {
        background: var(--ai-color-semantic-warning);
        animation: pulse 1.5s ease-in-out infinite;
      }

      .status-dot.queued { background: var(--ai-color-semantic-info); }
      .status-dot.completed { background: var(--ai-color-semantic-success); }
      .status-dot.failed { background: var(--ai-color-semantic-danger); }
      .status-dot.paused { background: var(--ai-color-text-muted); }
      .status-dot.cancelled { background: var(--ai-color-text-muted); }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      @media (prefers-reduced-motion: reduce) {
        .status-dot.running { animation: none; }
      }

      .title-block {
        flex: 1;
        min-width: 0;
      }

      .title {
        font-size: var(--ai-font-size-base);
        font-weight: 600;
        color: var(--ai-color-text-primary);
      }

      .scope-chip {
        display: inline-block;
        padding: 1px 4px;
        font-family: var(--ai-font-family-mono);
        font-size: var(--ai-font-size-xs);
        color: var(--ai-color-text-muted);
        margin-top: 2px;
      }

      .progress-bar {
        height: 4px;
        background: var(--ai-color-bg-overlay);
        border-radius: var(--ai-radius-full);
        overflow: hidden;
        margin: var(--ai-spacing-xs) 0;
      }

      .progress-fill {
        height: 100%;
        background: var(--ai-color-accent-default);
        transition: width var(--ai-duration-normal);
      }

      .timing {
        font-family: var(--ai-font-family-mono);
        font-size: var(--ai-font-size-xs);
        color: var(--ai-color-text-muted);
      }

      .result-summary {
        font-style: italic;
        font-size: var(--ai-font-size-sm);
        color: var(--ai-color-text-secondary);
        margin-top: var(--ai-spacing-xs);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .error-msg {
        font-size: var(--ai-font-size-sm);
        color: var(--ai-color-semantic-danger);
        margin-top: var(--ai-spacing-xs);
      }

      .actions-row {
        display: flex;
        gap: var(--ai-spacing-xs);
        margin-top: var(--ai-spacing-sm);
      }

      .action-btn {
        padding: 3px var(--ai-spacing-sm);
        font-size: var(--ai-font-size-xs);
        border-radius: var(--ai-radius-sm);
        background: transparent;
        border: 1px solid var(--ai-color-border-default);
        color: var(--ai-color-text-secondary);
        cursor: pointer;
        font-family: var(--ai-font-family-sans);
      }

      .action-btn.primary {
        background: var(--ai-color-accent-default);
        border-color: var(--ai-color-accent-default);
        color: var(--ai-color-accent-on-accent);
      }

      .action-btn:hover {
        border-color: var(--ai-color-accent-default);
        color: var(--ai-color-accent-default);
      }

      .dismiss-btn {
        flex-shrink: 0;
        padding: 4px;
        background: transparent;
        border: none;
        border-radius: var(--ai-radius-sm);
        color: var(--ai-color-text-muted);
        cursor: pointer;
        opacity: 0.6;
      }

      .card:hover .dismiss-btn {
        opacity: 1;
      }

      .dismiss-btn:hover {
        color: var(--ai-color-semantic-danger);
      }
    `,
  ];

  @property({ type: Object }) task!: AgentTask;
  @property({ type: String }) elapsedLabel = '';

  render() {
    const t = this.task;
    const showProgress = t.status === 'running' && t.progress != null;
    const dismissible = ['completed', 'failed', 'cancelled'].includes(t.status);

    return html`
      <div class="card">
        <div class="card-header">
          <span class="status-dot ${t.status}"></span>
          <div class="title-block">
            <div class="title">${t.title}</div>
            <span class="scope-chip">${t.scope === 'document' ? 'Document' : 'Batch'}</span>
          </div>
          ${dismissible ? html`
            <button class="dismiss-btn" aria-label="Dismiss" @click=${this._onDismiss}>
              ${renderIcon(X, 14, 'default')}
            </button>
          ` : nothing}
        </div>

        ${showProgress ? html`
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(t.progress! * 100) + '%'}"></div>
          </div>
        ` : ''}

        <div class="timing">${this._timingLabel()}</div>

        ${t.status === 'completed' && t.resultSummary ? html`
          <div class="result-summary">${t.resultSummary}</div>
        ` : ''}

        ${t.status === 'failed' && t.errorMessage ? html`
          <div class="error-msg">⚠ ${t.errorMessage}</div>
        ` : ''}

        ${t.actions?.length ? html`
          <div class="actions-row">
            ${t.actions.map(a => html`
              <button class="action-btn ${a.type}" @click=${() => this._onAction(a)}>${a.label}</button>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  private _timingLabel(): string {
    const t = this.task;
    if (t.status === 'running' && t.startedAt) {
      return this.elapsedLabel || 'Running…';
    }
    if (t.completedAt) {
      return this._relativeTime(t.completedAt);
    }
    if (t.startedAt) {
      return `Started ${this._relativeTime(t.startedAt)}`;
    }
    return 'Queued';
  }

  private _relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  private _onDismiss() {
    this.dispatchEvent(new CustomEvent('task-dismissed', {
      detail: { taskId: this.task.id },
      bubbles: true,
      composed: true,
    }));
  }

  private _onAction(_action: { id: string; label: string }) {
    // Host handles action clicks
    this.dispatchEvent(new CustomEvent('task-action', {
      detail: { taskId: this.task.id, actionId: _action.id },
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agent-task-item': AgentTaskItem;
  }
}
