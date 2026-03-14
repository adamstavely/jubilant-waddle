import { LitElement, html, css, nothing, render } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AgentModel, ModelTier } from '../models/chat.js';
import { ChevronDown, Check } from 'lucide';
import { renderIcon, iconStyles } from './icons.js';

const TIER_ORDER: ModelTier[] = ['fast', 'balanced', 'reasoning', 'extended'];
const TIER_LABELS: Record<ModelTier, string> = {
  fast: 'FAST',
  balanced: 'BALANCED',
  reasoning: 'REASONING',
  extended: 'EXTENDED',
};

@customElement('arbor-model-picker')
export class ArborModelPicker extends LitElement {
  static styles = [
    iconStyles,
    css`
    :host {
      display: inline-flex;
      align-items: center;
      position: relative;
      font-family: var(--ai-font-family-sans);
    }

    .trigger {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-xs);
      padding: 6px var(--ai-spacing-sm);
      background: transparent;
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-md);
      color: var(--ai-color-text-primary);
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
      min-width: 120px;
      max-width: 200px;
      transition: border-color var(--ai-duration-fast) var(--ai-easing-standard);
      white-space: nowrap;
    }

    .trigger:hover {
      border-color: var(--ai-color-border-bright);
    }

    .trigger:focus-visible {
      outline: 2px solid var(--ai-color-border-focus);
      outline-offset: 2px;
    }

    .tier-badge {
      display: inline-flex;
      align-items: center;
      padding: 1px 5px;
      background: var(--ai-color-gold-bg);
      color: var(--ai-color-gold);
      border-radius: var(--ai-radius-full);
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-xs);
      flex-shrink: 0;
    }

    .model-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chevron {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      color: var(--ai-color-text-secondary);
      transition: transform var(--ai-duration-fast) var(--ai-easing-standard);
    }

    .chevron.open {
      transform: rotate(180deg);
    }

    /* Dropdown — rendered in portal to avoid panel overflow clipping */
    .dropdown {
      position: fixed;
      width: 280px;
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-border-bright);
      border-radius: var(--ai-radius-lg);
      box-shadow: var(--ai-shadow-lg);
      z-index: var(--ai-z-tooltip);
      overflow: hidden;
    }

    .tier-group {
      padding: var(--ai-spacing-xs) 0;
    }

    .tier-group + .tier-group {
      border-top: 1px solid var(--ai-color-border-default);
    }

    .tier-header {
      padding: var(--ai-spacing-xs) var(--ai-spacing-md);
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .model-option {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-sm);
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      cursor: pointer;
      transition: background var(--ai-duration-fast) var(--ai-easing-standard);
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-sm);
      color: var(--ai-color-text-primary);
    }

    .model-option:hover {
      background: var(--ai-color-bg-overlay);
    }

    .model-option.selected {
      color: var(--ai-color-accent-default);
    }

    .model-option.unavailable {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .model-option.unavailable:hover {
      background: transparent;
    }

    .check-icon {
      display: flex;
      width: 14px;
      flex-shrink: 0;
      color: var(--ai-color-accent-default);
    }

    .check-icon .ai-icon {
      color: var(--ai-color-accent-default);
    }

    .check-placeholder {
      width: 14px;
      flex-shrink: 0;
    }

    .unavailable-tag {
      margin-left: auto;
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
    }

    .token-hint {
      margin-left: auto;
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
    }
  `];

  @property({ type: Array }) availableModels: AgentModel[] = [];
  @property({ type: String }) selectedModelId = '';
  @state() private _open = false;

  private _portalRoot: HTMLDivElement | null = null;
  private _dropdownStyle = '';
  private _boundDocClick = (e: MouseEvent) => this._handleDocClick(e);

  private get _selectedModel(): AgentModel | undefined {
    return this.availableModels.find(m => m.id === this.selectedModelId);
  }

  private _handleTriggerClick() {
    this._open = !this._open;
    if (this._open) this._positionDropdown();
  }

  private _handleSelect(model: AgentModel) {
    if (!model.available) return;
    this._open = false;
    this.dispatchEvent(new CustomEvent('model-changed', {
      detail: { modelId: model.id, modelLabel: model.label, contextWindowTokens: model.contextWindowTokens },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') this._open = false;
  }

  private _groupedModels(): Map<ModelTier, AgentModel[]> {
    const groups = new Map<ModelTier, AgentModel[]>();
    for (const tier of TIER_ORDER) groups.set(tier, []);
    for (const model of this.availableModels) {
      groups.get(model.tier)?.push(model);
    }
    return groups;
  }

  private _formatTokens(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return String(n);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeydown.bind(this));
  }

  private _handleDocClick(e: MouseEvent) {
    const target = e.target as Node;
    if (!this.contains(target) && !this._portalRoot?.contains(target)) this._open = false;
  }

  private _positionDropdown() {
    const trigger = this.renderRoot.querySelector('.trigger') as HTMLElement;
    if (trigger) {
      const r = trigger.getBoundingClientRect();
      this._dropdownStyle = `bottom: ${window.innerHeight - r.top + 4}px; left: ${r.left}px;`;
    }
  }

  override updated(changed: Map<string, unknown>) {
    if (this._open) {
      this._positionDropdown();
      requestAnimationFrame(() => {
        if (this._open) {
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
    .model-picker-portal .dropdown {
      position: fixed;
      width: 280px;
      background: var(--ai-color-bg-raised);
      border: 1px solid var(--ai-color-border-bright);
      border-radius: var(--ai-radius-lg);
      box-shadow: var(--ai-shadow-lg);
      z-index: 1100;
      overflow: hidden;
    }
    .model-picker-portal .tier-group { padding: var(--ai-spacing-xs) 0; }
    .model-picker-portal .tier-group + .tier-group { border-top: 1px solid var(--ai-color-border-default); }
    .model-picker-portal .tier-header {
      padding: var(--ai-spacing-xs) var(--ai-spacing-md);
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .model-picker-portal .model-option {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-sm);
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      cursor: pointer;
      transition: background var(--ai-duration-fast) var(--ai-easing-standard);
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-sm);
      color: var(--ai-color-text-primary);
    }
    .model-picker-portal .model-option:hover { background: var(--ai-color-bg-overlay); }
    .model-picker-portal .model-option.selected { color: var(--ai-color-accent-default); }
    .model-picker-portal .model-option.unavailable { opacity: 0.4; cursor: not-allowed; }
    .model-picker-portal .model-option.unavailable:hover { background: transparent; }
    .model-picker-portal .check-icon { display: flex; width: 14px; flex-shrink: 0; color: var(--ai-color-accent-default); }
    .model-picker-portal .check-icon .ai-icon { color: var(--ai-color-accent-default); }
    .model-picker-portal .check-placeholder { width: 14px; flex-shrink: 0; }
    .model-picker-portal .unavailable-tag { margin-left: auto; font-size: var(--ai-font-size-xs); color: var(--ai-color-text-muted); }
    .model-picker-portal .token-hint { margin-left: auto; font-size: var(--ai-font-size-xs); color: var(--ai-color-text-muted); }
  `;

  private _renderPortal() {
    if (!this._portalRoot) {
      this._portalRoot = document.createElement('div');
      this._portalRoot.className = 'model-picker-portal';
      this._portalRoot.style.cssText = 'position:fixed;inset:0;pointer-events:auto;z-index:2147483647';
      const style = document.createElement('style');
      style.textContent = ArborModelPicker._portalStyles;
      this._portalRoot.appendChild(style);
      const overlay = document.createElement('div');
      overlay.className = 'model-picker-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:0;background:transparent';
      overlay.addEventListener('click', () => { this._open = false; });
      this._portalRoot.appendChild(overlay);
      document.body.appendChild(this._portalRoot);
    }
    const content = this._renderDropdownContent();
    const wrapper = document.createElement('div');
    wrapper.className = 'portal-dropdown';
    wrapper.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none';
    const host = document.createElement('div');
    host.style.cssText = 'position:relative;pointer-events:auto';
    render(content, host);
    wrapper.appendChild(host);
    const existing = this._portalRoot.querySelector('.portal-dropdown');
    if (existing) existing.remove();
    this._portalRoot.appendChild(wrapper);
  }

  private _removePortal() {
    if (this._portalRoot?.parentNode) {
      this._portalRoot.parentNode.removeChild(this._portalRoot);
      this._portalRoot = null;
    }
  }

  private _renderDropdownContent() {
    const groups = this._groupedModels();
    return html`
      <div class="dropdown" role="listbox" aria-label="Available models" style=${this._dropdownStyle}>
        ${TIER_ORDER.map(tier => {
          const models = groups.get(tier) ?? [];
          if (!models.length) return nothing;
          return html`
            <div class="tier-group">
              <div class="tier-header">${TIER_LABELS[tier]}</div>
              ${models.map(model => html`
                <div
                  class="model-option ${model.id === this.selectedModelId ? 'selected' : ''} ${!model.available ? 'unavailable' : ''}"
                  role="option"
                  aria-selected=${model.id === this.selectedModelId}
                  @click=${() => this._handleSelect(model)}
                >
                  ${model.id === this.selectedModelId
                    ? html`<span class="check-icon">${renderIcon(Check, 14, 'accent')}</span>`
                    : html`<span class="check-placeholder"></span>`
                  }
                  ${model.label}
                  ${!model.available
                    ? html`<span class="unavailable-tag">Unavailable</span>`
                    : html`<span class="token-hint">${this._formatTokens(model.contextWindowTokens)}</span>`
                  }
                </div>
              `)}
            </div>
          `;
        })}
      </div>
    `;
  }

  render() {
    const selected = this._selectedModel;

    return html`
      <button
        class="trigger"
        aria-haspopup="listbox"
        aria-expanded=${this._open}
        @click=${this._handleTriggerClick}
      >
        ${selected ? html`<span class="tier-badge">${selected.tierLabel}</span>` : nothing}
        <span class="model-name">${selected?.label ?? 'Select model'}</span>
        <span class="chevron ${this._open ? 'open' : ''}">${renderIcon(ChevronDown, 10)}</span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'arbor-model-picker': ArborModelPicker;
  }
}
