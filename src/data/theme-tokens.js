/** Editable design tokens from the openUI kit (maps to :root CSS variables). */
export const THEME_TOKEN_GROUPS = [
  {
    id: 'brand',
    label: 'Brand',
    tokens: [
      { key: '--primary', label: 'Primary', default: '#6366F1', type: 'color' },
      { key: '--primary-hover', label: 'Primary hover', default: '#4F46E5', type: 'color' },
      { key: '--secondary', label: 'Secondary', default: '#10B981', type: 'color' },
      { key: '--accent', label: 'Accent', default: '#F43F5E', type: 'color' },
      { key: '--info', label: 'Info', default: '#0EA5E9', type: 'color' },
      { key: '--warning', label: 'Warning', default: '#F59E0B', type: 'color' },
    ],
  },
  {
    id: 'surfaces',
    label: 'Surfaces',
    tokens: [
      { key: '--bg', label: 'Background', default: '#090909', type: 'color' },
      { key: '--surface', label: 'Surface', default: '#18181B', type: 'color' },
      { key: '--surface-raised', label: 'Raised surface', default: '#27272A', type: 'color' },
      { key: '--border', label: 'Border', default: 'rgba(255, 255, 255, 0.1)', type: 'text' },
    ],
  },
  {
    id: 'text',
    label: 'Typography',
    tokens: [
      { key: '--text', label: 'Text', default: '#FAFAFA', type: 'color' },
      { key: '--text-muted', label: 'Muted text', default: '#A1A1AA', type: 'color' },
      { key: '--text-dim', label: 'Dim text', default: '#71717A', type: 'color' },
    ],
  },
  {
    id: 'shape',
    label: 'Shape',
    tokens: [
      { key: '--radius-sm', label: 'Radius SM', default: '8px', type: 'text' },
      { key: '--radius-md', label: 'Radius MD', default: '12px', type: 'text' },
      { key: '--radius-lg', label: 'Radius LG', default: '20px', type: 'text' },
    ],
  },
];

export const ALL_THEME_TOKEN_KEYS = THEME_TOKEN_GROUPS.flatMap(g => g.tokens.map(t => t.key));
