import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { StoredPrompt, PromptScope } from '../models/chat.js';

type DrawerTab = 'mine' | 'team' | 'system';

@customElement('prompts-drawer')
export class PromptsDrawer extends LitElement {
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
      max-height: 480px;
      overflow-y: auto;
    }

    .drawer-inner {
      background: var(--ai-color-bg-raised);
      border-top: 1px solid var(--ai-color-border-default);
    }

    /* Search */
    .search-row {
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      border-bottom: 1px solid var(--ai-color-border-default);
    }

    .search-input {
      width: 100%;
      box-sizing: border-box;
      background: var(--ai-color-bg-surface);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-primary);
      font-family: var(--ai-font-family-sans);
      font-size: var(--ai-font-size-sm);
      padding: var(--ai-spacing-xs) var(--ai-spacing-sm);
    }

    .search-input:focus {
      outline: 2px solid var(--ai-color-border-focus);
    }

    /* Tabs */
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--ai-color-border-default);
    }

    .tab {
      flex: 1;
      padding: var(--ai-spacing-sm);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--ai-color-text-muted);
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
      font-family: var(--ai-font-family-sans);
      transition: color var(--ai-duration-fast), border-color var(--ai-duration-fast);
    }

    .tab:hover {
      color: var(--ai-color-text-secondary);
    }

    .tab.active {
      color: var(--ai-color-accent-default);
      border-bottom-color: var(--ai-color-accent-default);
    }

    /* List */
    .prompt-list {
      padding: var(--ai-spacing-xs) 0;
      overflow-y: auto;
      max-height: 280px;
    }

    .new-prompt-btn {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-xs);
      width: 100%;
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--ai-color-border-default);
      color: var(--ai-color-accent-default);
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
      font-family: var(--ai-font-family-sans);
      text-align: left;
    }

    .new-prompt-btn:hover {
      background: var(--ai-color-bg-overlay);
    }

    /* Prompt card */
    .prompt-card {
      padding: var(--ai-spacing-sm) var(--ai-spacing-md);
      border-bottom: 1px solid var(--ai-color-border-default);
    }

    .prompt-card:last-child {
      border-bottom: none;
    }

    .prompt-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .prompt-name {
      font-weight: 600;
      font-size: var(--ai-font-size-base);
      color: var(--ai-color-text-primary);
    }

    .prompt-desc {
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-secondary);
      margin-bottom: 6px;
      line-height: 1.4;
    }

    .prompt-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 6px;
    }

    .tag-chip {
      padding: 1px 6px;
      background: var(--ai-color-bg-overlay);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-full);
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-secondary);
    }

    .prompt-actions {
      display: flex;
      gap: var(--ai-spacing-xs);
    }

    .action-btn {
      padding: 3px var(--ai-spacing-sm);
      background: transparent;
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-secondary);
      font-size: var(--ai-font-size-xs);
      cursor: pointer;
      font-family: var(--ai-font-family-sans);
      transition: border-color var(--ai-duration-fast), color var(--ai-duration-fast);
    }

    .action-btn:hover {
      border-color: var(--ai-color-accent-default);
      color: var(--ai-color-accent-default);
    }

    .delete-btn {
      margin-left: auto;
      color: var(--ai-color-text-muted);
    }

    .delete-btn:hover {
      border-color: var(--ai-color-semantic-danger);
      color: var(--ai-color-semantic-danger);
    }

    .empty-state {
      padding: var(--ai-spacing-xl) var(--ai-spacing-md);
      text-align: center;
      color: var(--ai-color-text-muted);
      font-size: var(--ai-font-size-sm);
    }

    /* Inline creation form */
    .creation-form {
      padding: var(--ai-spacing-md);
      background: var(--ai-color-bg-overlay);
      border-bottom: 1px solid var(--ai-color-border-default);
    }

    .form-field {
      margin-bottom: var(--ai-spacing-sm);
    }

    .form-label {
      display: block;
      font-size: var(--ai-font-size-xs);
      color: var(--ai-color-text-secondary);
      margin-bottom: 3px;
    }

    .form-input, .form-textarea {
      width: 100%;
      box-sizing: border-box;
      background: var(--ai-color-bg-surface);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-primary);
      font-family: var(--ai-font-family-sans);
      font-size: var(--ai-font-size-sm);
      padding: var(--ai-spacing-xs) var(--ai-spacing-sm);
    }

    .form-input:focus, .form-textarea:focus {
      outline: 2px solid var(--ai-color-border-focus);
    }

    .form-textarea {
      min-height: 80px;
      resize: vertical;
      font-family: var(--ai-font-family-mono);
    }

    .form-actions {
      display: flex;
      gap: var(--ai-spacing-sm);
      justify-content: flex-end;
      margin-top: var(--ai-spacing-sm);
    }

    .save-btn {
      padding: var(--ai-spacing-xs) var(--ai-spacing-md);
      background: var(--ai-color-accent-default);
      border: none;
      border-radius: var(--ai-radius-sm);
      color: white;
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
      font-family: var(--ai-font-family-sans);
    }

    .cancel-btn {
      padding: var(--ai-spacing-xs) var(--ai-spacing-md);
      background: transparent;
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-secondary);
      font-size: var(--ai-font-size-sm);
      cursor: pointer;
      font-family: var(--ai-font-family-sans);
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Array }) storedPrompts: StoredPrompt[] = [];
  @property({ type: String }) prefillContent = '';

  @state() private _activeTab: DrawerTab = 'mine';
  @state() private _search = '';
  @state() private _showCreationForm = false;
  @state() private _formName = '';
  @state() private _formDesc = '';
  @state() private _formContent = '';

  updated(changed: Map<string, unknown>) {
    if (changed.has('prefillContent') && this.prefillContent && this.open) {
      this._showCreationForm = true;
      this._formContent = this.prefillContent;
      this._activeTab = 'mine';
    }
  }

  private _filteredPrompts(scope: PromptScope): StoredPrompt[] {
    const q = this._search.toLowerCase();
    return this.storedPrompts.filter(p => {
      if (p.scope !== scope) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.tags ?? []).some(t => t.toLowerCase().includes(q));
    });
  }

  private _useAsMessage(prompt: StoredPrompt) {
    this.dispatchEvent(new CustomEvent('prompt-selected', {
      detail: { prompt, insertAs: 'message' },
      bubbles: true,
      composed: true,
    }));
  }

  private _useAsSystem(prompt: StoredPrompt) {
    this.dispatchEvent(new CustomEvent('prompt-selected', {
      detail: { prompt, insertAs: 'system' },
      bubbles: true,
      composed: true,
    }));
  }

  private _deletePrompt(prompt: StoredPrompt) {
    this.dispatchEvent(new CustomEvent('prompt-delete-requested', {
      detail: { promptId: prompt.id },
      bubbles: true,
      composed: true,
    }));
  }

  private _saveNewPrompt() {
    if (!this._formName.trim() || !this._formContent.trim()) return;
    this.dispatchEvent(new CustomEvent('prompt-create-requested', {
      detail: { content: this._formContent, suggestedName: this._formName },
      bubbles: true,
      composed: true,
    }));
    this._showCreationForm = false;
    this._formName = '';
    this._formDesc = '';
    this._formContent = '';
  }

  private _renderCard(prompt: StoredPrompt) {
    const isPersonal = prompt.scope === 'personal';
    return html`
      <div class="prompt-card">
        <div class="prompt-card-header">
          <span class="prompt-name">${prompt.name}</span>
        </div>
        ${prompt.description ? html`<div class="prompt-desc">${prompt.description}</div>` : nothing}
        ${prompt.tags?.length ? html`
          <div class="prompt-tags">
            ${prompt.tags.map(t => html`<span class="tag-chip">${t}</span>`)}
          </div>
        ` : nothing}
        <div class="prompt-actions">
          ${prompt.type !== 'system' ? html`
            <button class="action-btn" @click=${() => this._useAsMessage(prompt)}>Use as message</button>
          ` : nothing}
          ${prompt.type !== 'message' ? html`
            <button class="action-btn" @click=${() => this._useAsSystem(prompt)}>Use as system prompt</button>
          ` : nothing}
          ${isPersonal ? html`
            <button class="action-btn delete-btn" @click=${() => this._deletePrompt(prompt)}>Delete</button>
          ` : nothing}
        </div>
      </div>
    `;
  }

  private _renderTabContent() {
    const scopeMap: Record<DrawerTab, PromptScope> = {
      mine: 'personal',
      team: 'team',
      system: 'system-preset',
    };
    const prompts = this._filteredPrompts(scopeMap[this._activeTab]);

    return html`
      ${this._activeTab === 'mine' ? html`
        <button class="new-prompt-btn" @click=${() => (this._showCreationForm = true)}>
          + New Prompt
        </button>
        ${this._showCreationForm ? this._renderCreationForm() : nothing}
      ` : nothing}

      <div class="prompt-list">
        ${prompts.length
          ? prompts.map(p => this._renderCard(p))
          : html`<div class="empty-state">No prompts found.</div>`
        }
      </div>
    `;
  }

  private _renderCreationForm() {
    return html`
      <div class="creation-form">
        <div class="form-field">
          <label class="form-label">Name *</label>
          <input
            class="form-input"
            type="text"
            placeholder="My prompt name"
            .value=${this._formName}
            @input=${(e: Event) => (this._formName = (e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="form-field">
          <label class="form-label">Description (optional)</label>
          <input
            class="form-input"
            type="text"
            .value=${this._formDesc}
            @input=${(e: Event) => (this._formDesc = (e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="form-field">
          <label class="form-label">Prompt text *</label>
          <textarea
            class="form-textarea"
            placeholder="Enter your prompt..."
            .value=${this._formContent}
            @input=${(e: Event) => (this._formContent = (e.target as HTMLTextAreaElement).value)}
          ></textarea>
        </div>
        <div class="form-actions">
          <button class="cancel-btn" @click=${() => (this._showCreationForm = false)}>Cancel</button>
          <button class="save-btn" @click=${this._saveNewPrompt}>Save</button>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="drawer ${this.open ? 'open' : ''}" role="region" aria-label="Saved prompts">
        <div class="drawer-inner">
          <div class="search-row">
            <input
              class="search-input"
              type="search"
              placeholder="Search prompts…"
              .value=${this._search}
              @input=${(e: Event) => (this._search = (e.target as HTMLInputElement).value)}
              aria-label="Search prompts"
            />
          </div>

          <div class="tabs" role="tablist">
            ${(['mine', 'team', 'system'] as DrawerTab[]).map(tab => html`
              <button
                class="tab ${this._activeTab === tab ? 'active' : ''}"
                role="tab"
                aria-selected=${this._activeTab === tab}
                @click=${() => (this._activeTab = tab)}
              >
                ${{ mine: 'Mine', team: 'Team', system: 'System' }[tab]}
              </button>
            `)}
          </div>

          ${this._renderTabContent()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prompts-drawer': PromptsDrawer;
  }
}
