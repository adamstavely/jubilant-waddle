/**
 * actions-tab
 *
 * Actions tab with single-document grid and batch workflow list.
 */
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ActionConfig, ActionResultEvent } from '../models/action.js';
import { SINGLE_DOC_ACTIONS, BATCH_ACTIONS } from '../models/action.js';
import './action-tile.js';

@customElement('actions-tab')
export class ActionsTab extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: auto;
      padding: var(--ai-spacing-md);
      font-family: var(--ai-font-family-sans);
    }

    .section-title {
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: var(--ai-spacing-sm);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--ai-spacing-sm);
      margin-bottom: var(--ai-spacing-lg);
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--ai-spacing-xs);
      margin-bottom: var(--ai-spacing-lg);
    }

    .result-panel {
      margin-top: var(--ai-spacing-md);
      padding: var(--ai-spacing-md);
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-md);
      max-height: 200px;
      overflow-y: auto;
      transition: max-height var(--ai-duration-normal) var(--ai-easing-decelerate);
    }

    .result-panel.hidden {
      max-height: 0;
      padding: 0;
      margin: 0;
      overflow: hidden;
      border: none;
    }

    .result-title {
      font-size: var(--ai-font-size-sm);
      font-weight: 600;
      color: var(--ai-color-text-primary);
      margin-bottom: var(--ai-spacing-xs);
    }

    .result-content {
      font-size: var(--ai-font-size-sm);
      color: var(--ai-color-text-secondary);
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .result-content.error {
      color: var(--ai-color-semantic-danger);
    }

    .dismiss-btn {
      margin-top: var(--ai-spacing-sm);
      padding: var(--ai-spacing-xs) var(--ai-spacing-sm);
      background: transparent;
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-secondary);
      font-size: var(--ai-font-size-xs);
      cursor: pointer;
      font-family: inherit;
    }

    .dismiss-btn:hover {
      border-color: var(--ai-color-border-bright);
      color: var(--ai-color-text-primary);
    }
  `;

  @property({ type: String }) documentId = '';
  @property({ type: String }) batchId = '';
  @property({ type: Object }) actionResult: ActionResultEvent | null = null;

  @state() private _runningActionId: string | null = null;

  render() {
    return html`
      <div role="tabpanel" id="tabpanel-actions" aria-labelledby="tab-actions">
        <div class="section-title">Single Document</div>
        <div class="grid">
          ${SINGLE_DOC_ACTIONS.map((action) => html`
            <action-tile
              .action=${action}
              .running=${this._runningActionId === action.id}
              @action-triggered=${(e: CustomEvent) => this._onActionTriggered(e, action)}
            ></action-tile>
          `)}
        </div>

        <div class="section-title">Batch Workflow</div>
        <div class="list">
          ${BATCH_ACTIONS.map((action) => html`
            <action-tile
              .action=${action}
              .running=${this._runningActionId === action.id}
              @action-triggered=${(e: CustomEvent) => this._onActionTriggered(e, action)}
            ></action-tile>
          `)}
        </div>

        ${this._renderResultPanel()}
      </div>
    `;
  }

  override updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (changed.has('actionResult') && this.actionResult) {
      this._runningActionId = null;
    }
  }

  private _onActionTriggered(e: CustomEvent, action: ActionConfig) {
    this._runningActionId = action.id;
    this.dispatchEvent(new CustomEvent('action-triggered', {
      detail: {
        actionId: action.id,
        scope: action.scope,
        documentId: action.scope === 'document' ? this.documentId : undefined,
        batchId: action.scope === 'batch' ? this.batchId : undefined,
      },
      bubbles: true,
      composed: true,
    }));
  }

  private _renderResultPanel() {
    const result = this.actionResult;
    if (!result) return nothing;

    return html`
      <div class="result-panel">
        <div class="result-title">${result.title}</div>
        <div class="result-content ${result.status === 'error' ? 'error' : ''}">${result.content}</div>
        <button class="dismiss-btn" @click=${this._dismissResult}>Dismiss</button>
      </div>
    `;
  }

  private _dismissResult() {
    this.dispatchEvent(new CustomEvent('result-dismissed', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'actions-tab': ActionsTab;
  }
}
