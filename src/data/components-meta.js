// Lightweight component metadata — no @ui imports, safe to use anywhere in Studio.
// components.jsx has the full variant render data (docs only).
export const componentsMeta = [
  {
    id: 'accordions', name: 'Accordion',
    description: 'Collapsible sections for organizing dense content with a clean expand/collapse interaction.',
    classes: ['l-accordion-group', 'l-accordion', 'l-accordion-open', 'l-accordion-header', 'l-accordion-content'],
    variants: [{ name: 'Basic Sections' }, { name: 'Rich JSX Content' }],
  },
  {
    id: 'alerts', name: 'Alert',
    description: 'Contextual feedback banners for info, success, warning, and error states.',
    classes: ['l-alert', 'l-alert-info', 'l-alert-success', 'l-alert-warn', 'l-alert-danger'],
    variants: [{ name: 'Contextual Variants' }, { name: 'Dismissible Alerts' }, { name: 'Glass Variant' }],
  },
  {
    id: 'avatars', name: 'Avatar',
    description: 'User image representations with size variants and grouping support.',
    classes: ['l-avatar', 'l-avatar-sm', 'l-avatar-lg', 'l-avatar-ring', 'l-avatar-group'],
    variants: [{ name: 'Sizes & Ring' }, { name: 'Avatar Group' }],
  },
  {
    id: 'badges', name: 'Badge',
    description: 'Compact status labels and count indicators.',
    classes: ['l-badge', 'l-badge-primary', 'l-badge-success', 'l-badge-warning', 'l-badge-danger', 'l-badge-outline', 'l-badge-dot'],
    variants: [{ name: 'Status Variants' }, { name: 'Dot Indicator' }],
  },
  {
    id: 'breadcrumbs', name: 'Breadcrumbs',
    description: 'Hierarchical navigation path showing the user\'s location.',
    classes: ['l-breadcrumb', 'l-breadcrumb-active'],
    variants: [{ name: 'Navigation Trail' }],
  },
  {
    id: 'buttons', name: 'Button',
    description: 'Flexible action trigger with multiple variants and sizes.',
    classes: ['l-btn', 'l-btn-primary', 'l-btn-secondary', 'l-btn-outline', 'l-btn-ghost', 'l-btn-neon', 'l-btn-danger', 'l-btn-glass', 'l-btn-sm', 'l-btn-lg'],
    variants: [{ name: 'All Variants' }, { name: 'Sizes' }, { name: 'Disabled State' }],
  },
  {
    id: 'cards', name: 'Card',
    description: 'Content container with header, body, and footer slots.',
    classes: ['l-card', 'l-card-glass', 'l-card-hover', 'l-card-glow'],
    variants: [{ name: 'Standard Card' }, { name: 'Glass Card' }],
  },
  {
    id: 'checkboxes', name: 'Checkbox',
    description: 'Boolean toggle input with indeterminate state support.',
    classes: ['l-checkbox-box', 'l-checkbox-label'],
    variants: [{ name: 'Basic & Indeterminate' }],
  },
  {
    id: 'chips', name: 'Chip',
    description: 'Compact tag-like elements for filters, selections, and categories.',
    classes: ['l-chip', 'l-chip-primary', 'l-chip-success', 'l-chip-warning', 'l-chip-danger', 'l-chip-outline'],
    variants: [{ name: 'Variants' }, { name: 'Removable' }],
  },
  {
    id: 'drawers', name: 'Drawer',
    description: 'Slide-in side panel for forms, details, and navigation.',
    classes: ['l-drawer', 'l-drawer-overlay', 'l-drawer-header', 'l-drawer-title', 'l-drawer-body'],
    variants: [{ name: 'Right Drawer' }, { name: 'Left Drawer' }],
  },
  {
    id: 'dropdowns', name: 'Dropdown',
    description: 'Contextual menu anchored to a trigger element.',
    classes: ['l-dropdown-menu', 'l-dropdown-item', 'l-dropdown-divider'],
    variants: [{ name: 'Action Menu' }, { name: 'With Icons' }],
  },
  {
    id: 'inputs', name: 'Input',
    description: 'Text input with label, hint, and error states.',
    classes: ['l-input', 'l-input-group', 'l-label', 'l-input-error', 'l-input-msg'],
    variants: [{ name: 'Text Fields' }, { name: 'With Icons' }, { name: 'Error State' }],
  },
  {
    id: 'lists', name: 'List',
    description: 'Vertical list of items with active state and click handlers.',
    classes: ['l-list', 'l-list-item', 'l-list-item-active'],
    variants: [{ name: 'Navigation List' }, { name: 'Compact List' }],
  },
  {
    id: 'modals', name: 'Modal',
    description: 'Overlay dialog for confirmations, forms, and focused content.',
    classes: ['l-modal', 'l-modal-overlay', 'l-modal-header', 'l-modal-title', 'l-modal-body', 'l-modal-footer', 'l-modal-close'],
    variants: [{ name: 'Basic Modal' }, { name: 'Form Modal' }],
  },
  {
    id: 'navbar', name: 'Navbar',
    description: 'Top navigation bar with brand and action slots.',
    classes: ['l-navbar', 'l-navbar-glass', 'l-navbar-brand', 'l-navbar-actions'],
    variants: [{ name: 'Standard' }, { name: 'Glass' }],
  },
  {
    id: 'navigation', name: 'NavItem',
    description: 'Sidebar navigation item with icon and badge support.',
    classes: ['l-nav-item', 'l-nav-item-active'],
    variants: [{ name: 'Sidebar Nav' }, { name: 'With Badges' }],
  },
  {
    id: 'progress', name: 'Progress',
    description: 'Linear progress bar for loading and completion states.',
    classes: ['l-progress', 'l-progress-bar'],
    variants: [{ name: 'Default' }, { name: 'Striped' }],
  },
  {
    id: 'radios', name: 'Radio',
    description: 'Single-select option input within a group.',
    classes: ['l-radio-circle', 'l-radio-label'],
    variants: [{ name: 'Radio Group' }],
  },
  {
    id: 'skeletons', name: 'Skeleton',
    description: 'Animated loading placeholders for content areas.',
    classes: ['l-skeleton'],
    variants: [{ name: 'Text & Title' }, { name: 'Card Skeleton' }],
  },
  {
    id: 'switches', name: 'Switch',
    description: 'Toggle switch for boolean settings.',
    classes: ['l-switch', 'l-switch-track', 'l-switch-on', 'l-switch-thumb'],
    variants: [{ name: 'Toggle States' }],
  },
  {
    id: 'tables', name: 'Table',
    description: 'Data table with sorting, selection, and status columns.',
    classes: ['l-table'],
    variants: [{ name: 'Data Table' }, { name: 'Compact Table' }],
  },
  {
    id: 'tabs', name: 'Tabs',
    description: 'Horizontal tab navigation for switching between views.',
    classes: ['l-tabs', 'l-tabs-list', 'l-tab', 'l-tab-active'],
    variants: [{ name: 'Default Tabs' }, { name: 'Pill Tabs' }],
  },
  {
    id: 'toasts', name: 'Toast',
    description: 'Transient notification messages for feedback and alerts.',
    classes: ['l-toast-container', 'l-toast', 'l-toast-success', 'l-toast-danger', 'l-toast-title', 'l-toast-msg'],
    variants: [{ name: 'Variants' }],
  },
  {
    id: 'tooltips', name: 'Tooltip',
    description: 'Contextual hover text for icons and truncated content.',
    classes: ['l-tooltip-wrap', 'l-tooltip'],
    variants: [{ name: 'Positions' }],
  },
];

// Angular equivalent — same shape, different ids
export const angularComponentsMeta = [
  { id: 'accordion', name: 'Accordion', description: 'Collapsible sections.', classes: ['l-accordion', 'l-accordion-open', 'l-accordion-header', 'l-accordion-content'], variants: [{ name: 'Expand / Collapse' }] },
  { id: 'alert', name: 'Alert', description: 'Contextual feedback banners.', classes: ['l-alert', 'l-alert-info', 'l-alert-success', 'l-alert-warn', 'l-alert-danger'], variants: [{ name: 'Contextual Variants' }] },
  { id: 'avatar', name: 'Avatar', description: 'User image representations.', classes: ['l-avatar', 'l-avatar-sm', 'l-avatar-lg', 'l-avatar-ring', 'l-avatar-group'], variants: [{ name: 'Sizes & Ring' }] },
  { id: 'badge', name: 'Badge', description: 'Compact status labels.', classes: ['l-badge', 'l-badge-primary', 'l-badge-success', 'l-badge-warning', 'l-badge-danger'], variants: [{ name: 'Status Variants' }] },
  { id: 'button', name: 'Button', description: 'Action trigger with variants.', classes: ['l-btn', 'l-btn-primary', 'l-btn-secondary', 'l-btn-outline', 'l-btn-ghost'], variants: [{ name: 'All Variants' }] },
  { id: 'card', name: 'Card', description: 'Content container.', classes: ['l-card', 'l-card-glass'], variants: [{ name: 'Standard Card' }] },
  { id: 'input', name: 'Input', description: 'Text input field.', classes: ['l-input', 'l-input-group', 'l-label'], variants: [{ name: 'Text Fields' }] },
  { id: 'modal', name: 'Modal', description: 'Overlay dialog.', classes: ['l-modal', 'l-modal-overlay', 'l-modal-header'], variants: [{ name: 'Basic Modal' }] },
  { id: 'navbar', name: 'Navbar', description: 'Top navigation bar.', classes: ['l-navbar', 'l-navbar-brand', 'l-navbar-actions'], variants: [{ name: 'Standard' }] },
  { id: 'progress', name: 'Progress', description: 'Linear progress bar.', classes: ['l-progress', 'l-progress-bar'], variants: [{ name: 'Default' }] },
  { id: 'table', name: 'Table', description: 'Data table.', classes: ['l-table'], variants: [{ name: 'Data Table' }] },
  { id: 'tabs', name: 'Tabs', description: 'Tab navigation.', classes: ['l-tabs', 'l-tab', 'l-tab-active'], variants: [{ name: 'Default Tabs' }] },
];
