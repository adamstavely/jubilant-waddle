/**
 * agent-tasks-tab
 *
 * Agent Tasks tab with task list, summary strip, and empty state.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AgentTask, AgentTaskStatus } from '../models/agent-task.js';
import { Clock } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';
import './agent-task-item.js';

const STATUS_ORDER: AgentTaskStatus[] = ['running', 'queued', 'paused', 'failed', 'completed', 'cancelled'];

@customElement('agent-tasks-tab')
export class AgentTasksTab extends LitElement {
  static styles = [
    iconStyles,
    css`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: auto;
      padding: var(--ai-spacing-md);
      font-family: var(--ai-font-family-sans);
    }

    .summary-strip {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-md);
      padding: var(--ai-spacing-sm) 0;
      margin-bottom: var(--ai-spacing-md);
      border-bottom: 1px solid var(--ai-color-border-default);
      flex-wrap: wrap;
    }

    .summary-item {
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-xs);
    }

    .summary-item.running { color: var(--ai-color-semantic-warning); }
    .summary-item.queued { color: var(--ai-color-semantic-info); }
    .summary-item.done { color: var(--ai-color-semantic-success); }
    .summary-item.failed { color: var(--ai-color-semantic-danger); }

    .clear-btn {
      margin-left: auto;
      padding: 2px var(--ai-spacing-sm);
      font-size: var(--ai-font-size-xs);
      background: transparent;
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-secondary);
      cursor: pointer;
      font-family: var(--ai-font-family-sans);
    }

    .clear-btn:hover {
      border-color: var(--ai-color-border-bright);
      color: var(--ai-color-text-primary);
    }

    .task-list {
      flex: 1;
      overflow-y: auto;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      padding: var(--ai-spacing-xl);
      text-align: center;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      margin-bottom: var(--ai-spacing-md);
      opacity: 0.4;
    }

    .empty-state h3 {
      font-size: var(--ai-font-size-base);
      font-weight: 600;
      color: var(--ai-color-text-primary);
      margin: 0 0 var(--ai-spacing-xs);
    }

    .empty-state p {
      font-size: var(--ai-font-size-sm);
      color: var(--ai-color-text-muted);
      margin: 0;
    }
  `,
  ];

  @property({ type: Array }) agentTasks: AgentTask[] = [];

  @state() private _elapsedMap = new Map<string, string>();

  private _rafId = 0;

  connectedCallback() {
    super.connectedCallback();
    this._startElapsedTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this._rafId);
  }

  private _startElapsedTimer() {
    const update = () => {
      const now = Date.now();
      for (const t of this.agentTasks) {
        if (t.status === 'running' && t.startedAt) {
          const elapsed = Math.floor((now - new Date(t.startedAt).getTime()) / 1000);
          const m = Math.floor(elapsed / 60);
          const s = elapsed % 60;
          this._elapsedMap.set(t.id, `Running ${m}m ${s}s`);
        }
      }
      this._elapsedMap = new Map(this._elapsedMap);
      this._rafId = requestAnimationFrame(update);
    };
    this._rafId = requestAnimationFrame(update);
  }

  private _sortedTasks(): AgentTask[] {
    const byStatus = new Map<AgentTaskStatus, AgentTask[]>();
    for (const s of STATUS_ORDER) byStatus.set(s, []);
    for (const t of this.agentTasks) {
      byStatus.get(t.status)?.push(t);
    }
    const result: AgentTask[] = [];
    for (const s of STATUS_ORDER) {
      const tasks = byStatus.get(s) ?? [];
      tasks.sort((a, b) => {
        const aStart = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const bStart = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return bStart - aStart;
      });
      result.push(...tasks);
    }
    return result;
  }

  private _counts() {
    const running = this.agentTasks.filter(t => t.status === 'running').length;
    const queued = this.agentTasks.filter(t => t.status === 'queued').length;
    const done = this.agentTasks.filter(t => t.status === 'completed' || t.status === 'cancelled').length;
    const failed = this.agentTasks.filter(t => t.status === 'failed').length;
    return { running, queued, done, failed };
  }

  private _onClearCompleted() {
    const toDismiss = this.agentTasks.filter(t => t.status === 'completed' || t.status === 'cancelled');
    for (const t of toDismiss) {
      this.dispatchEvent(new CustomEvent('agent-task-dismissed', {
        detail: { taskId: t.id },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    const tasks = this._sortedTasks();
    const counts = this._counts();
    const hasCompleted = counts.done > 0;

    return html`
      <div role="tabpanel" id="tabpanel-agent-tasks" aria-labelledby="tab-agent-tasks">
        <div class="summary-strip" aria-live="polite">
          <span class="summary-item running">Running: ${counts.running}</span>
          <span class="summary-item queued">Queued: ${counts.queued}</span>
          <span class="summary-item done">Done: ${counts.done}</span>
          <span class="summary-item failed">Failed: ${counts.failed}</span>
          ${hasCompleted ? html`
            <button class="clear-btn" @click=${this._onClearCompleted}>Clear completed</button>
          ` : ''}
        </div>

        ${tasks.length === 0 ? html`
          <div class="empty-state">
            <div class="empty-icon">${renderIcon(Clock, 64, 'muted')}</div>
            <h3>No background tasks running</h3>
            <p>Tasks started from the Actions tab or by ARBOR agents will appear here.</p>
          </div>
        ` : html`
          <div class="task-list">
            ${tasks.map(t => html`
              <agent-task-item
                .task=${t}
                .elapsedLabel=${this._elapsedMap.get(t.id) ?? ''}
                @task-dismissed=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('agent-task-dismissed', { detail: e.detail, bubbles: true, composed: true }))}
              ></agent-task-item>
            `)}
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agent-tasks-tab': AgentTasksTab;
  }
}
