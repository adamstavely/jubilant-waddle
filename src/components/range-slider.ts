import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('arbor-range-slider')
export class ArborRangeSlider extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--ai-spacing-sm);
      width: 100%;
    }

    .slider-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    input[type='range'] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      background: transparent;
      outline: none;
      margin: 0;
      cursor: pointer;
    }

    input[type='range']:focus-visible {
      outline: 2px solid var(--ai-color-border-focus);
      outline-offset: 4px;
      border-radius: var(--ai-radius-sm);
    }

    /* Chrome / Safari track */
    input[type='range']::-webkit-slider-runnable-track {
      height: 4px;
      border-radius: var(--ai-radius-full);
      background: linear-gradient(
        to right,
        var(--ai-color-accent-default) 0%,
        var(--ai-color-accent-default) var(--fill-pct, 50%),
        var(--ai-color-bg-raised) var(--fill-pct, 50%),
        var(--ai-color-bg-raised) 100%
      );
    }

    /* Firefox track */
    input[type='range']::-moz-range-track {
      height: 4px;
      border-radius: var(--ai-radius-full);
      background: var(--ai-color-bg-raised);
    }

    input[type='range']::-moz-range-progress {
      height: 4px;
      background: var(--ai-color-accent-default);
      border-radius: var(--ai-radius-full);
    }

    /* Thumb */
    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--ai-color-accent-default);
      border: 2px solid var(--ai-color-bg-surface);
      margin-top: -5px;
      cursor: pointer;
      transition: transform var(--ai-duration-fast) var(--ai-easing-standard);
    }

    input[type='range']::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    input[type='range']::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--ai-color-accent-default);
      border: 2px solid var(--ai-color-bg-surface);
      cursor: pointer;
    }

    .number-input {
      width: 64px;
      flex-shrink: 0;
      padding: 3px var(--ai-spacing-xs);
      background: var(--ai-color-bg-surface);
      border: 1px solid var(--ai-color-border-default);
      border-radius: var(--ai-radius-sm);
      color: var(--ai-color-text-primary);
      font-family: var(--ai-font-family-mono);
      font-size: var(--ai-font-size-sm);
      text-align: right;
    }

    .number-input:focus {
      outline: 2px solid var(--ai-color-border-focus);
      outline-offset: 1px;
    }
  `;

  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 1;
  @property({ type: Number }) step = 0.01;
  @property({ type: Number }) value = 0;

  private get _fillPct(): string {
    const range = this.max - this.min;
    if (range === 0) return '0%';
    return `${((this.value - this.min) / range) * 100}%`;
  }

  private _emit(value: number) {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value },
      bubbles: true,
    }));
  }

  private _onSlider(e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value);
    this._emit(v);
  }

  private _onInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    const v = parseFloat(raw);
    if (!isNaN(v)) {
      const clamped = Math.max(this.min, Math.min(this.max, v));
      this._emit(clamped);
    }
  }

  render() {
    return html`
      <div class="slider-wrapper">
        <input
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          .value=${String(this.value)}
          style="--fill-pct: ${this._fillPct}"
          @input=${this._onSlider}
          aria-valuenow=${this.value}
          aria-valuemin=${this.min}
          aria-valuemax=${this.max}
        />
      </div>
      <input
        class="number-input"
        type="number"
        min=${this.min}
        max=${this.max}
        step=${this.step}
        .value=${String(this.value)}
        @change=${this._onInput}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'arbor-range-slider': ArborRangeSlider;
  }
}
