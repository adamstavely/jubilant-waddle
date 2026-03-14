/**
 * Lucide icon helper for Lit templates.
 * Renders icon data as inline SVG.
 */
import { html, svg, css, type TemplateResult } from 'lit';

/** Base icon styles. Import and add to component styles. */
export const iconStyles = css`
  .ai-icon {
    color: var(--ai-color-text-primary);
  }
`;

// Lucide icon format: array of [tag, attrs] (IconNode from lucide)
type IconNode = [string, Record<string, string | number | undefined>];

function renderIconNode(node: IconNode, strokeColor: string): TemplateResult {
  const [tag, attrs] = node;

  switch (tag) {
    case 'path':
      return svg`<path d=${String(attrs.d || '')} stroke=${strokeColor} fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    case 'circle':
      return svg`<circle cx=${String(attrs.cx ?? '')} cy=${String(attrs.cy ?? '')} r=${String(attrs.r ?? '')} stroke=${strokeColor} fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    case 'line':
      return svg`<line x1=${String(attrs.x1 ?? '')} y1=${String(attrs.y1 ?? '')} x2=${String(attrs.x2 ?? '')} y2=${String(attrs.y2 ?? '')} stroke=${strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    case 'polyline':
      return svg`<polyline points=${String(attrs.points ?? '')} stroke=${strokeColor} fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    case 'rect':
      return svg`<rect
        x=${String(attrs.x ?? '')}
        y=${String(attrs.y ?? '')}
        width=${String(attrs.width ?? '')}
        height=${String(attrs.height ?? '')}
        rx=${String(attrs.rx ?? '')}
        ry=${String(attrs.ry ?? '')}
        stroke=${strokeColor}
        fill="none"
        stroke-width="2.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />`;
    case 'polygon':
      return svg`<polygon points=${String(attrs.points ?? '')} stroke=${strokeColor} fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    default:
      return svg``;
  }
}

export type IconColor = 'default' | 'white' | 'accent' | 'danger' | 'warning' | 'gold' | 'teal' | 'muted';

const ICON_COLORS: Record<IconColor, string> = {
  default: 'var(--ai-color-text-primary)',
  white: 'var(--ai-color-accent-on-accent)',
  accent: 'var(--ai-color-accent-default)',
  danger: 'var(--ai-color-semantic-danger)',
  warning: 'var(--ai-color-semantic-warning)',
  gold: 'var(--ai-color-gold)',
  teal: 'var(--ai-color-teal)',
  muted: 'var(--ai-color-text-muted)',
};

export function renderIcon(
  iconData: Array<[string, Record<string, string | number | undefined>]>,
  size = 16,
  color: IconColor = 'default'
): TemplateResult {
  const strokeColor = ICON_COLORS[color];
  const innerContent = svg`${iconData.map((node) => renderIconNode(node, strokeColor))}`;
  return html`<svg
    class="ai-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="${size}"
    height="${size}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="${strokeColor}"
    stroke-width="2.25"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    style="display: block; min-width: ${size}px; min-height: ${size}px; stroke: ${strokeColor};"
  >
    ${innerContent}
  </svg>`;
}
