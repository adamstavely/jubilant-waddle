import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ChatSettings } from '../models/chat.js';
import { DEFAULT_SETTINGS, SETTINGS_PARAMS } from '../models/chat.js';
import './range-slider.js';

const MAX_SYSTEM_PROMPT_CHARS = 4000;

@customElement('settings-drawer')
export class SettingsDrawer extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--ai-font-family-sans);
    }

    .drawer {
      overflow: hidden;
      max-height: 0;
      transition: max-height var(--ai-duration-normal) var(--ai-easing-decelerate);
    }

    .drawer.open {
      max-height: 500px;
      overflow-y: auto;
    }

    .drawer-inner {
      padding: var(--ai-spacing-md);
      background: var(--ai-color-bg-raised);
      border-top: 1px solid var(--ai-color-border-default);
    }

    .preset-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--ai-spacing-md);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
    }

    .preset-name {
      font-family: var(--ai-font-family-mono);
      color: var(--ai-color-text-secondary);
    }

    .param-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--ai-spacing-sm) var(--ai-spacing-lg);
      margin-bottom: var(--ai-spacing-md);
    }

    .param-row {
      display: contents;
    }

    .param-label-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .param-label {
      font-size: var(--ai-font-size-sm);
      font-weight: 600;
      color: var(--ai-color-text-primary);
      margin-bottom: 2px;
    }

    .param-desc {
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      line-height: 1.4;
    }

    .param-control-col {
      display: flex;
      align-items: center;
    }

    /* System Prompt */
    .system-prompt-section {
      margin-top: var(--ai-spacing-md);
      border-top: 1px solid var(--ai-color-border-default);
      padding-top: var(--ai-spacing-md);
    }

    .sp-label {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: var(--ai-spacing-xs);
    }

    .sp-label-text {
      font-size: var(--ai-font-size-sm);
      font-weight: 600;
      font-family: var(--ai-font-family-mono);
      color: var(--ai-color-text-primary);
    }

    .sp-helper {
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
    }

    .sp-char-count {
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      font-family: var(--ai-font-family-mono);
    }

    .sp-char-count.near-limit {
      color: var(--ai-color-semantic-warning);
    }

    textarea {
      width: 100%;
      box-sizing: border-box;
      min-height: calc(4 * 1.5em + 12px);
      max-height: 160px;
      resize: vertical;
      background: var(--ai-color-bg-surface, #0e0e1a);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-primary);
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-sm);
      padding: var(--ai-spacing-sm);
      line-height: 1.5;
    }

    textarea:focus {
      outline: 2px solid var(--ai-color-border-focus);
      outline-offset: 1px;
    }

    .overwrite-warning {
      display: flex;
      align-items: flex-start;
      gap: var(--ai-spacing-xs);
      margin-top: var(--ai-spacing-xs);
      padding: var(--ai-spacing-xs) var(--ai-spacing-sm);
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid var(--ai-color-semantic-warning);
      border-radius: var(--ai-radius-sm);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-semantic-warning);
    }

    .sp-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--ai-spacing-xs);
    }

    .save-prompt-btn {
      background: transparent;
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-secondary);
      font-size: var(--ai-font-size-xs);
      padding: 3px var(--ai-spacing-sm);
      cursor: pointer;
      font-family: var(--ai-font-family-sans);
      transition: border-color var(--ai-duration-fast), color var(--ai-duration-fast);
    }

    .save-prompt-btn:hover {
      border-color: var(--ai-color-border-bright);
      color: var(--ai-color-text-primary);
    }

    /* Footer */
    .drawer-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--ai-spacing-md);
      padding-top: var(--ai-spacing-sm);
      border-top: 1px solid var(--ai-color-border-default);
    }

    .reset-btn {
      background: transparent;
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-secondary);
      font-size: var(--ai-font-size-sm);
      padding: var(--ai-spacing-xs) var(--ai-spacing-md);
      cursor: pointer;
      font-family: var(--ai-font-family-sans);
      transition: border-color var(--ai-duration-fast), color var(--ai-duration-fast);
    }

    .reset-btn:hover {
      border-color: var(--ai-color-semantic-danger);
      color: var(--ai-color-semantic-danger);
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Object }) settings: ChatSettings = { ...DEFAULT_SETTINGS };
  @property({ type: String }) defaultSystemPrompt = '';
  @property({ type: String }) activePreset = '';

  @state() private _systemPromptOverridden = false;

  private get _isCustom(): boolean {
    const keys = Object.keys(DEFAULT_SETTINGS) as (keyof ChatSettings)[];
    return keys.some(k => k !== 'systemPrompt' && this.settings[k] !== DEFAULT_SETTINGS[k]);
  }

  private _onParamChange(key: keyof ChatSettings, value: number) {
    const updated = { ...this.settings, [key]: value };
    this._dispatchSettingsChanged(updated, key);
  }

  private _onSystemPromptInput(e: Event) {
    const value = (e.target as HTMLTextAreaElement).value.slice(0, MAX_SYSTEM_PROMPT_CHARS);
    if (this.defaultSystemPrompt && value !== this.defaultSystemPrompt) {
      this._systemPromptOverridden = true;
    }
    const updated = { ...this.settings, systemPrompt: value };
    this._dispatchSettingsChanged(updated, 'systemPrompt');
  }

  private _dispatchSettingsChanged(settings: ChatSettings, changedKey: keyof ChatSettings) {
    this.dispatchEvent(new CustomEvent('settings-changed', {
      detail: { settings, changedKey },
      bubbles: true,
      composed: true,
    }));
  }

  private _onReset() {
    const reset = { ...DEFAULT_SETTINGS, systemPrompt: this.defaultSystemPrompt };
    this._systemPromptOverridden = false;
    this.dispatchEvent(new CustomEvent('settings-reset', {
      detail: { settings: reset },
      bubbles: true,
      composed: true,
    }));
  }

  private _onSaveAsPrompt() {
    this.dispatchEvent(new CustomEvent('save-as-prompt-requested', {
      detail: { systemPrompt: this.settings.systemPrompt },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const charCount = this.settings.systemPrompt.length;
    const presetLabel = this._isCustom ? 'Custom' : (this.activePreset || 'Defaults');

    return html`
      <div class="drawer ${this.open ? 'open' : ''}" role="region" aria-label="Advanced settings">
        <div class="drawer-inner">

          <div class="preset-indicator">
            <span>Based on: <span class="preset-name">${presetLabel}</span></span>
          </div>

          <div class="param-grid">
            ${SETTINGS_PARAMS.map(param => html`
              <div class="param-label-col">
                <span class="param-label">${param.label}</span>
                <span class="param-desc">${param.description}</span>
              </div>
              <div class="param-control-col">
                <arbor-range-slider
                  .min=${param.min!}
                  .max=${param.max!}
                  .step=${param.step!}
                  .value=${this.settings[param.key] as number}
                  @value-changed=${(e: CustomEvent) => this._onParamChange(param.key, e.detail.value)}
                ></arbor-range-slider>
              </div>
            `)}
          </div>

          <div class="system-prompt-section">
            <div class="sp-label">
              <span>
                <span class="sp-label-text">System Prompt</span>
                <span class="sp-helper"> (Prepended to every request in this session.)</span>
              </span>
              <span class="sp-char-count ${charCount > MAX_SYSTEM_PROMPT_CHARS * 0.9 ? 'near-limit' : ''}">
                ${charCount} / ${MAX_SYSTEM_PROMPT_CHARS} chars
              </span>
            </div>

            <textarea
              rows="4"
              maxlength=${MAX_SYSTEM_PROMPT_CHARS}
              placeholder="You are a helpful legal assistant..."
              .value=${this.settings.systemPrompt}
              @input=${this._onSystemPromptInput}
              aria-label="System prompt"
            ></textarea>

            ${this._systemPromptOverridden ? html`
              <div class="overwrite-warning" role="alert">
                ⚠ You've overridden the default system prompt. This applies to this session only.
              </div>
            ` : nothing}

            <div class="sp-actions">
              <button class="save-prompt-btn" @click=${this._onSaveAsPrompt}>
                Save as Stored Prompt
              </button>
            </div>
          </div>

          <div class="drawer-footer">
            <button class="reset-btn" @click=${this._onReset}>
              Reset to defaults
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-drawer': SettingsDrawer;
  }
}
