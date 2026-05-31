// Lightweight component metadata — no @ui imports, safe to use anywhere in Studio.
// components.jsx has the full variant render data (docs only).
export const componentsMeta = [
  {
    id: 'accordions', name: 'Accordion',
    description: 'Collapsible sections for organizing dense content with a clean expand/collapse interaction.',
    classes: ['ou-accordion-group', 'ou-accordion', 'ou-accordion-open', 'ou-accordion-header', 'ou-accordion-content'],
    variants: [{ name: 'Basic Sections' }, { name: 'Rich JSX Content' }],
  },
  {
    id: 'alerts', name: 'Alert',
    description: 'Contextual feedback banners for info, success, warning, and error states.',
    classes: ['ou-alert', 'ou-alert-info', 'ou-alert-success', 'ou-alert-warn', 'ou-alert-danger'],
    variants: [{ name: 'Contextual Variants' }, { name: 'Dismissible Alerts' }, { name: 'Glass Variant' }],
  },
  {
    id: 'avatars', name: 'Avatar',
    description: 'User image representations with size variants and grouping support.',
    classes: ['ou-avatar', 'ou-avatar-sm', 'ou-avatar-lg', 'ou-avatar-ring', 'ou-avatar-group'],
    variants: [{ name: 'Sizes & Ring' }, { name: 'Avatar Group' }],
  },
  {
    id: 'badges', name: 'Badge',
    description: 'Compact status labels and count indicators.',
    classes: ['ou-badge', 'ou-badge-primary', 'ou-badge-success', 'ou-badge-warning', 'ou-badge-danger', 'ou-badge-outline', 'ou-badge-dot'],
    variants: [{ name: 'Status Variants' }, { name: 'Dot Indicator' }],
  },
  {
    id: 'breadcrumbs', name: 'Breadcrumbs',
    description: 'Hierarchical navigation path showing the user\'s location.',
    classes: ['ou-breadcrumb', 'ou-breadcrumb-active'],
    variants: [{ name: 'Navigation Trail' }],
  },
  {
    id: 'buttons', name: 'Button',
    description: 'Flexible action trigger with multiple variants and sizes.',
    classes: ['ou-btn', 'ou-btn-primary', 'ou-btn-secondary', 'ou-btn-outline', 'ou-btn-ghost', 'ou-btn-neon', 'ou-btn-danger', 'ou-btn-glass', 'ou-btn-sm', 'ou-btn-lg'],
    variants: [{ name: 'All Variants' }, { name: 'Sizes' }, { name: 'Disabled State' }],
  },
  {
    id: 'cards', name: 'Card',
    description: 'Content container with header, body, and footer slots.',
    classes: ['ou-card', 'ou-card-glass', 'ou-card-hover', 'ou-card-glow'],
    variants: [{ name: 'Standard Card' }, { name: 'Glass Card' }],
  },
  {
    id: 'checkboxes', name: 'Checkbox',
    description: 'Boolean toggle input with indeterminate state support.',
    classes: ['ou-checkbox-box', 'ou-checkbox-label'],
    variants: [{ name: 'Basic & Indeterminate' }],
  },
  {
    id: 'chips', name: 'Chip',
    description: 'Compact tag-like elements for filters, selections, and categories.',
    classes: ['ou-chip', 'ou-chip-primary', 'ou-chip-success', 'ou-chip-warning', 'ou-chip-danger', 'ou-chip-outline'],
    variants: [{ name: 'Variants' }, { name: 'Removable' }],
  },
  {
    id: 'drawers', name: 'Drawer',
    description: 'Slide-in side panel for forms, details, and navigation.',
    classes: ['ou-drawer', 'ou-drawer-overlay', 'ou-drawer-header', 'ou-drawer-title', 'ou-drawer-body'],
    variants: [{ name: 'Right Drawer' }, { name: 'Left Drawer' }],
  },
  {
    id: 'dropdowns', name: 'Dropdown',
    description: 'Contextual menu anchored to a trigger element.',
    classes: ['ou-dropdown-menu', 'ou-dropdown-item', 'ou-dropdown-divider'],
    variants: [{ name: 'Action Menu' }, { name: 'With Icons' }],
  },
  {
    id: 'inputs', name: 'Input',
    description: 'Text input with label, hint, and error states.',
    classes: ['ou-input', 'ou-input-group', 'ou-label', 'ou-input-error', 'ou-input-msg'],
    variants: [{ name: 'Text Fields' }, { name: 'With Icons' }, { name: 'Error State' }],
  },
  {
    id: 'lists', name: 'List',
    description: 'Vertical list of items with active state and click handlers.',
    classes: ['ou-list', 'ou-list-item', 'ou-list-item-active'],
    variants: [{ name: 'Navigation List' }, { name: 'Compact List' }],
  },
  {
    id: 'modals', name: 'Modal',
    description: 'Overlay dialog for confirmations, forms, and focused content.',
    classes: ['ou-modal', 'ou-modal-overlay', 'ou-modal-header', 'ou-modal-title', 'ou-modal-body', 'ou-modal-footer', 'ou-modal-close'],
    variants: [{ name: 'Basic Modal' }, { name: 'Form Modal' }],
  },
  {
    id: 'navbar', name: 'Navbar',
    description: 'Top navigation bar with brand and action slots.',
    classes: ['ou-navbar', 'ou-navbar-glass', 'ou-navbar-brand', 'ou-navbar-actions'],
    variants: [{ name: 'Standard' }, { name: 'Glass' }],
  },
  {
    id: 'navigation', name: 'NavItem',
    description: 'Sidebar navigation item with icon and badge support.',
    classes: ['ou-nav-item', 'ou-nav-item-active'],
    variants: [{ name: 'Sidebar Nav' }, { name: 'With Badges' }],
  },
  {
    id: 'progress', name: 'Progress',
    description: 'Linear progress bar for loading and completion states.',
    classes: ['ou-progress', 'ou-progress-bar'],
    variants: [{ name: 'Default' }, { name: 'Striped' }],
  },
  {
    id: 'radios', name: 'Radio',
    description: 'Single-select option input within a group.',
    classes: ['ou-radio-circle', 'ou-radio-label'],
    variants: [{ name: 'Radio Group' }],
  },
  {
    id: 'skeletons', name: 'Skeleton',
    description: 'Animated loading placeholders for content areas.',
    classes: ['ou-skeleton'],
    variants: [{ name: 'Text & Title' }, { name: 'Card Skeleton' }],
  },
  {
    id: 'switches', name: 'Switch',
    description: 'Toggle switch for boolean settings.',
    classes: ['ou-switch', 'ou-switch-track', 'ou-switch-on', 'ou-switch-thumb'],
    variants: [{ name: 'Toggle States' }],
  },
  {
    id: 'tables', name: 'Table',
    description: 'Data table with sorting, selection, and status columns.',
    classes: ['ou-table'],
    variants: [{ name: 'Data Table' }, { name: 'Compact Table' }],
  },
  {
    id: 'tabs', name: 'Tabs',
    description: 'Horizontal tab navigation for switching between views.',
    classes: ['ou-tabs', 'ou-tabs-list', 'ou-tab', 'ou-tab-active'],
    variants: [{ name: 'Default Tabs' }, { name: 'Pill Tabs' }],
  },
  {
    id: 'toasts', name: 'Toast',
    description: 'Transient notification messages for feedback and alerts.',
    classes: ['ou-toast-container', 'ou-toast', 'ou-toast-success', 'ou-toast-danger', 'ou-toast-title', 'ou-toast-msg'],
    variants: [{ name: 'Variants' }],
  },
  {
    id: 'tooltips', name: 'Tooltip',
    description: 'Contextual hover text for icons and truncated content.',
    classes: ['ou-tooltip-wrap', 'ou-tooltip'],
    variants: [{ name: 'Positions' }],
  },
];

// Angular equivalent — same shape, different ids
export const angularComponentsMeta = [
  { id: 'accordion', name: 'Accordion', description: 'Collapsible sections.', classes: ['ou-accordion', 'ou-accordion-open', 'ou-accordion-header', 'ou-accordion-content'], variants: [{ name: 'Expand / Collapse' }] },
  { id: 'alert', name: 'Alert', description: 'Contextual feedback banners.', classes: ['ou-alert', 'ou-alert-info', 'ou-alert-success', 'ou-alert-warn', 'ou-alert-danger'], variants: [{ name: 'Contextual Variants' }] },
  { id: 'avatar', name: 'Avatar', description: 'User image representations.', classes: ['ou-avatar', 'ou-avatar-sm', 'ou-avatar-lg', 'ou-avatar-ring', 'ou-avatar-group'], variants: [{ name: 'Sizes & Ring' }] },
  { id: 'badge', name: 'Badge', description: 'Compact status labels.', classes: ['ou-badge', 'ou-badge-primary', 'ou-badge-success', 'ou-badge-warning', 'ou-badge-danger'], variants: [{ name: 'Status Variants' }] },
  { id: 'button', name: 'Button', description: 'Action trigger with variants.', classes: ['ou-btn', 'ou-btn-primary', 'ou-btn-secondary', 'ou-btn-outline', 'ou-btn-ghost'], variants: [{ name: 'All Variants' }] },
  { id: 'card', name: 'Card', description: 'Content container.', classes: ['ou-card', 'ou-card-glass'], variants: [{ name: 'Standard Card' }] },
  { id: 'input', name: 'Input', description: 'Text input field.', classes: ['ou-input', 'ou-input-group', 'ou-label'], variants: [{ name: 'Text Fields' }] },
  { id: 'modal', name: 'Modal', description: 'Overlay dialog.', classes: ['ou-modal', 'ou-modal-overlay', 'ou-modal-header'], variants: [{ name: 'Basic Modal' }] },
  { id: 'navbar', name: 'Navbar', description: 'Top navigation bar.', classes: ['ou-navbar', 'ou-navbar-brand', 'ou-navbar-actions'], variants: [{ name: 'Standard' }] },
  { id: 'progress', name: 'Progress', description: 'Linear progress bar.', classes: ['ou-progress', 'ou-progress-bar'], variants: [{ name: 'Default' }] },
  { id: 'table', name: 'Table', description: 'Data table.', classes: ['ou-table'], variants: [{ name: 'Data Table' }] },
  { id: 'tabs', name: 'Tabs', description: 'Tab navigation.', classes: ['ou-tabs', 'ou-tab', 'ou-tab-active'], variants: [{ name: 'Default Tabs' }] },
];
