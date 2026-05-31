// Representative Angular usage for each kit component, shown in the docs
// "Angular" code tab. Keyed by componentsData id. Selectors match the
// @openedui/angular standalone components.
export const angularSnippets = {
  accordions: `import { AccordionComponent } from '@openedui/angular';

<ou-accordion [items]="[
  { title: 'System Health', content: 'All clusters operating at peak efficiency.' },
  { title: 'Network Status', content: 'Global latency is 1.2ms across all nodes.' },
]" />`,

  alerts: `import { AlertComponent } from '@openedui/angular';

<ou-alert variant="success">Deployment completed — auth-v3 is live.</ou-alert>
<ou-alert variant="warn">EU-WEST-1 maintenance in 30 minutes.</ou-alert>
<ou-alert variant="danger">Critical: node-12 is unresponsive.</ou-alert>`,

  avatars: `import { AvatarComponent } from '@openedui/angular';

<ou-avatar src="/alice.png" size="md" alt="Alice" />
<ou-avatar size="lg" alt="Bob" ring />`,

  badges: `import { BadgeComponent } from '@openedui/angular';

<ou-badge variant="success">Active</ou-badge>
<ou-badge variant="warning">Pending</ou-badge>
<ou-badge variant="danger">Failed</ou-badge>`,

  breadcrumbs: `import { BreadcrumbsComponent } from '@openedui/angular';

<ou-breadcrumbs [items]="[
  { label: 'Organization', href: '/' },
  { label: 'System Intel', href: '/intel' },
  { label: 'Dashboard' },
]" />`,

  buttons: `import { ButtonComponent } from '@openedui/angular';

<ou-button variant="primary">Deploy</ou-button>
<ou-button variant="outline" size="sm">Export</ou-button>
<ou-button variant="ghost">Cancel</ou-button>
<ou-button variant="danger">Delete</ou-button>`,

  cards: `import { CardComponent } from '@openedui/angular';

<ou-card>
  <h3 style="margin:0 0 8px;color:var(--text)">Uptime SLA</h3>
  <p style="color:var(--text-muted)">99.9% over the last 30 days.</p>
</ou-card>`,

  checkboxes: `import { CheckboxComponent } from '@openedui/angular';

<ou-checkbox [checked]="agree" (change)="agree = $event" label="I agree to the terms" />`,

  chips: `import { ChipComponent } from '@openedui/angular';

<ou-chip>Default</ou-chip>
<ou-chip class="ou-chip-success">Production</ou-chip>
<ou-chip class="ou-chip-warning">Staging</ou-chip>`,

  drawers: `import { ButtonComponent, DrawerComponent } from '@openedui/angular';

<ou-button variant="primary" (click)="open = true">Open Drawer</ou-button>
<ou-drawer [isOpen]="open" (close)="open = false" title="Filters">
  Drawer content goes here.
</ou-drawer>`,

  dropdowns: `import { DropdownComponent, DropdownItemComponent, ButtonComponent } from '@openedui/angular';

<ou-dropdown>
  <ou-button variant="outline" trigger>Options</ou-button>
  <ou-dropdown-item (click)="edit()">Edit</ou-dropdown-item>
  <ou-dropdown-item (click)="remove()">Delete</ou-dropdown-item>
</ou-dropdown>`,

  inputs: `import { InputComponent } from '@openedui/angular';

<ou-input label="Email" type="email" placeholder="you@example.com" [(ngModel)]="email" />
<ou-input label="Password" type="password" [error]="passwordError" />`,

  lists: `import { ListComponent, ListItemComponent } from '@openedui/angular';

<ou-list>
  <ou-list-item [active]="true">Dashboard</ou-list-item>
  <ou-list-item>Analytics</ou-list-item>
  <ou-list-item>Settings</ou-list-item>
</ou-list>`,

  modals: `import { ModalComponent, ButtonComponent } from '@openedui/angular';

<ou-button variant="primary" (click)="open = true">Open Modal</ou-button>
<ou-modal [isOpen]="open" (close)="open = false" title="Confirm deploy">
  Ship auth-v3 to production?
</ou-modal>`,

  navbar: `import { NavbarComponent, NavbarBrandComponent, NavbarActionsComponent, ButtonComponent } from '@openedui/angular';

<ou-navbar>
  <ou-navbar-brand>openUI</ou-navbar-brand>
  <ou-navbar-actions>
    <ou-button variant="ghost" size="sm">Docs</ou-button>
    <ou-button variant="primary" size="sm">Sign in</ou-button>
  </ou-navbar-actions>
</ou-navbar>`,

  navigation: `import { NavItemComponent } from '@openedui/angular';

<ou-nav-item [active]="true" (click)="go('dashboard')">Dashboard</ou-nav-item>
<ou-nav-item (click)="go('settings')">Settings</ou-nav-item>`,

  progress: `import { ProgressComponent } from '@openedui/angular';

<ou-progress [value]="68" />
<ou-progress [value]="92" [striped]="true" />`,

  radios: `import { RadioComponent } from '@openedui/angular';

<ou-radio [checked]="plan === 'pro'" (change)="plan = 'pro'" name="plan" label="Pro" />
<ou-radio [checked]="plan === 'team'" (change)="plan = 'team'" name="plan" label="Team" />`,

  skeletons: `import { SkeletonComponent } from '@openedui/angular';

<ou-skeleton variant="title" />
<ou-skeleton variant="text" width="80%" />
<ou-skeleton variant="circle" width="40" height="40" />`,

  switches: `import { SwitchComponent } from '@openedui/angular';

<ou-switch [active]="enabled" (change)="enabled = $event" />`,

  tables: `import { TableComponent } from '@openedui/angular';

<ou-table
  [columns]="[{ key: 'name', label: 'Service' }, { key: 'status', label: 'Status' }]"
  [data]="rows" />`,

  tabs: `import { TabsComponent } from '@openedui/angular';

<ou-tabs [tabs]="['Overview', 'Network', 'Activity']" [active]="tab" (activeChange)="tab = $event" />`,

  toasts: `import { ToastService } from '@openedui/angular';

private toast = inject(ToastService);

this.toast.add({ title: 'Deployed', message: 'auth-v3 is live.', variant: 'success' });`,

  tooltips: `import { TooltipComponent, ButtonComponent } from '@openedui/angular';

<ou-tooltip text="Refresh metrics" position="top">
  <ou-button variant="ghost" size="sm">↺</ou-button>
</ou-tooltip>`,
};
