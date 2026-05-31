import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonComponent, CardComponent, BadgeComponent, InputComponent,
  AlertComponent, SwitchComponent, AvatarComponent, ProgressComponent,
  ChipComponent, TabsComponent, AccordionComponent, SkeletonComponent,
  CheckboxComponent, RadioComponent, TooltipComponent,
  NavItemComponent, NavbarComponent, NavbarBrandComponent, NavbarActionsComponent,
  TableComponent, type TableColumn,
  DropdownComponent, DropdownItemComponent, DropdownDividerComponent,
  DrawerComponent, ModalComponent,
  BreadcrumbsComponent, ListComponent, ListItemComponent,
  ToastService, ToastProviderComponent,
} from './components/ui';

@Component({
  selector: 'ou-showcase',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent, CardComponent, BadgeComponent, InputComponent,
    AlertComponent, SwitchComponent, AvatarComponent, ProgressComponent,
    ChipComponent, TabsComponent, AccordionComponent, SkeletonComponent,
    CheckboxComponent, RadioComponent, TooltipComponent,
    NavItemComponent, NavbarComponent, NavbarBrandComponent, NavbarActionsComponent,
    TableComponent,
    DropdownComponent, DropdownItemComponent, DropdownDividerComponent,
    DrawerComponent, ModalComponent,
    BreadcrumbsComponent, ListComponent, ListItemComponent,
    ToastProviderComponent,
  ],
  providers: [ToastService],
  styles: [`
    .sc-wrap { padding: 24px; display: flex; flex-direction: column; gap: 12px; background: var(--bg); min-height: 100vh; }
    .sc-section { display: flex; flex-direction: column; gap: 8px; }
    .sc-label { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--text-dim); font-family: var(--font-mono, monospace); }
    .sc-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
    .sc-col { display: flex; flex-direction: column; gap: 10px; }
  `],
  template: `
    <ou-toast-provider>
      <div class="sc-wrap">

        <!-- Button -->
        <ng-container *ngIf="preview === 'Button'">
          <div class="sc-section">
            <div class="sc-label">Variants</div>
            <div class="sc-row">
              <ou-button variant="primary">Primary</ou-button>
              <ou-button variant="secondary">Secondary</ou-button>
              <ou-button variant="outline">Outline</ou-button>
              <ou-button variant="ghost">Ghost</ou-button>
              <ou-button variant="danger">Danger</ou-button>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Sizes</div>
            <div class="sc-row">
              <ou-button variant="primary" size="sm">Small</ou-button>
              <ou-button variant="primary" size="md">Medium</ou-button>
              <ou-button variant="primary" size="lg">Large</ou-button>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-row">
              <ou-button variant="primary" [disabled]="true">Disabled</ou-button>
              <ou-button variant="outline" [disabled]="true">Disabled Outline</ou-button>
            </div>
          </div>
        </ng-container>

        <!-- Badge -->
        <ng-container *ngIf="preview === 'Badge'">
          <div class="sc-section">
            <div class="sc-label">Variants</div>
            <div class="sc-row">
              <ou-badge variant="default">Default</ou-badge>
              <ou-badge variant="primary">Primary</ou-badge>
              <ou-badge variant="success">Success</ou-badge>
              <ou-badge variant="warning">Warning</ou-badge>
              <ou-badge variant="danger">Danger</ou-badge>
            </div>
          </div>
        </ng-container>

        <!-- Card -->
        <ng-container *ngIf="preview === 'Card'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <ou-card style="padding:20px;max-width:300px">
              <div style="font-size:16px;font-weight:700;margin-bottom:8px">Card Title</div>
              <div style="font-size:13px;color:var(--text-muted)">Card content goes here. Use cards to group related information.</div>
            </ou-card>
          </div>
          <div class="sc-section">
            <div class="sc-label">With Action</div>
            <ou-card style="padding:20px;max-width:300px">
              <div style="font-size:16px;font-weight:700;margin-bottom:8px">Settings</div>
              <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Manage your account preferences.</div>
              <div class="sc-row">
                <ou-button variant="primary" size="sm">Save</ou-button>
                <ou-button variant="ghost" size="sm">Cancel</ou-button>
              </div>
            </ou-card>
          </div>
        </ng-container>

        <!-- Input -->
        <ng-container *ngIf="preview === 'Input'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <div class="sc-col" style="max-width:280px">
              <ou-input placeholder="Enter text…"></ou-input>
              <ou-input placeholder="With label" label="Email address"></ou-input>
              <ou-input placeholder="Password" type="password" label="Password"></ou-input>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-col" style="max-width:280px">
              <ou-input placeholder="Error state" [error]="true" errorMessage="This field is required" label="Username"></ou-input>
              <ou-input placeholder="Disabled" [disabled]="true" label="Read only"></ou-input>
            </div>
          </div>
        </ng-container>

        <!-- Alert -->
        <ng-container *ngIf="preview === 'Alert'">
          <div class="sc-section">
            <div class="sc-label">Variants</div>
            <div class="sc-col">
              <ou-alert variant="info" title="Info">This is an informational alert message.</ou-alert>
              <ou-alert variant="success" title="Success">Operation completed successfully.</ou-alert>
              <ou-alert variant="warning" title="Warning">This action may have consequences.</ou-alert>
              <ou-alert variant="danger" title="Error">Something went wrong. Please try again.</ou-alert>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Dismissible</div>
            <ou-alert variant="info" title="Dismissible" [dismissible]="true">Click the × to dismiss this alert.</ou-alert>
          </div>
        </ng-container>

        <!-- Avatar -->
        <ng-container *ngIf="preview === 'Avatar'">
          <div class="sc-section">
            <div class="sc-label">Sizes</div>
            <div class="sc-row">
              <ou-avatar initials="AB" size="sm"></ou-avatar>
              <ou-avatar initials="CD" size="md"></ou-avatar>
              <ou-avatar initials="EF" size="lg"></ou-avatar>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">With Ring</div>
            <div class="sc-row">
              <ou-avatar initials="GH" size="sm" [ring]="true"></ou-avatar>
              <ou-avatar initials="IJ" size="md" [ring]="true"></ou-avatar>
              <ou-avatar initials="KL" size="lg" [ring]="true"></ou-avatar>
            </div>
          </div>
        </ng-container>

        <!-- Switch -->
        <ng-container *ngIf="preview === 'Switch'">
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-col">
              <ou-switch [active]="false"></ou-switch>
              <ou-switch [active]="true"></ou-switch>
              <ou-switch [active]="true" [disabled]="true"></ou-switch>
            </div>
          </div>
        </ng-container>

        <!-- Checkbox -->
        <ng-container *ngIf="preview === 'Checkbox'">
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-col">
              <ou-checkbox label="Unchecked"></ou-checkbox>
              <ou-checkbox label="Checked" [checked]="true"></ou-checkbox>
              <ou-checkbox label="Disabled" [disabled]="true"></ou-checkbox>
            </div>
          </div>
        </ng-container>

        <!-- Radio -->
        <ng-container *ngIf="preview === 'Radio'">
          <div class="sc-section">
            <div class="sc-label">Group</div>
            <div class="sc-col">
              <ou-radio label="Option A" name="demo" value="a"></ou-radio>
              <ou-radio label="Option B" name="demo" value="b"></ou-radio>
              <ou-radio label="Option C (disabled)" name="demo" value="c" [disabled]="true"></ou-radio>
            </div>
          </div>
        </ng-container>

        <!-- Progress -->
        <ng-container *ngIf="preview === 'Progress'">
          <div class="sc-section">
            <div class="sc-label">Values</div>
            <div class="sc-col">
              <ou-progress [value]="25"></ou-progress>
              <ou-progress [value]="50"></ou-progress>
              <ou-progress [value]="75"></ou-progress>
              <ou-progress [value]="100"></ou-progress>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Striped</div>
            <div class="sc-col">
              <ou-progress [value]="60" [striped]="true"></ou-progress>
            </div>
          </div>
        </ng-container>

        <!-- Chip -->
        <ng-container *ngIf="preview === 'Chip'">
          <div class="sc-section">
            <div class="sc-label">Variants</div>
            <div class="sc-row">
              <ou-chip>Default</ou-chip>
              <ou-chip variant="primary">Primary</ou-chip>
              <ou-chip variant="success">Success</ou-chip>
              <ou-chip variant="warning">Warning</ou-chip>
              <ou-chip variant="danger">Danger</ou-chip>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Removable</div>
            <div class="sc-row">
              <ou-chip [removable]="true">Removable</ou-chip>
              <ou-chip variant="primary" [removable]="true">Primary</ou-chip>
            </div>
          </div>
        </ng-container>

        <!-- Tabs -->
        <ng-container *ngIf="preview === 'Tabs'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <ou-tabs [tabs]="['Overview', 'Analytics', 'Reports']" active="Overview"></ou-tabs>
          </div>
          <div class="sc-section">
            <div class="sc-label">With Icon Labels</div>
            <ou-tabs [tabs]="['Files', 'Code', 'Preview']" active="Files"></ou-tabs>
          </div>
        </ng-container>

        <!-- Accordion -->
        <ng-container *ngIf="preview === 'Accordion'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <ou-accordion [items]="accordionItems"></ou-accordion>
          </div>
        </ng-container>

        <!-- Skeleton -->
        <ng-container *ngIf="preview === 'Skeleton'">
          <div class="sc-section">
            <div class="sc-label">Shapes</div>
            <div class="sc-col">
              <ou-skeleton width="100%" height="20px"></ou-skeleton>
              <ou-skeleton width="60%" height="20px"></ou-skeleton>
              <ou-skeleton width="80%" height="20px"></ou-skeleton>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Avatar Placeholder</div>
            <div class="sc-row">
              <ou-skeleton width="40px" height="40px" [circle]="true"></ou-skeleton>
              <div class="sc-col" style="flex:1">
                <ou-skeleton width="120px" height="14px"></ou-skeleton>
                <ou-skeleton width="80px" height="12px"></ou-skeleton>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Tooltip -->
        <ng-container *ngIf="preview === 'Tooltip'">
          <div class="sc-section">
            <div class="sc-label">Positions</div>
            <div class="sc-row" style="padding:32px 0">
              <ou-tooltip text="Top tooltip" position="top"><ou-button variant="outline" size="sm">Top</ou-button></ou-tooltip>
              <ou-tooltip text="Bottom tooltip" position="bottom"><ou-button variant="outline" size="sm">Bottom</ou-button></ou-tooltip>
              <ou-tooltip text="Left tooltip" position="left"><ou-button variant="outline" size="sm">Left</ou-button></ou-tooltip>
              <ou-tooltip text="Right tooltip" position="right"><ou-button variant="outline" size="sm">Right</ou-button></ou-tooltip>
            </div>
          </div>
        </ng-container>

        <!-- Navbar -->
        <ng-container *ngIf="preview === 'Navbar'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <ou-navbar>
              <ou-navbar-brand>My App</ou-navbar-brand>
              <ou-navbar-actions>
                <ou-button variant="ghost" size="sm">Docs</ou-button>
                <ou-button variant="primary" size="sm">Sign In</ou-button>
              </ou-navbar-actions>
            </ou-navbar>
          </div>
        </ng-container>

        <!-- NavItem -->
        <ng-container *ngIf="preview === 'NavItem'">
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-col" style="max-width:220px">
              <ou-nav-item>Dashboard</ou-nav-item>
              <ou-nav-item [active]="true">Analytics (active)</ou-nav-item>
              <ou-nav-item>Settings</ou-nav-item>
            </div>
          </div>
        </ng-container>

        <!-- Table -->
        <ng-container *ngIf="preview === 'Table'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <ou-table [columns]="tableColumns">
              <tr *ngFor="let row of tableRows">
                <td>{{ row.name }}</td>
                <td>{{ row.role }}</td>
                <td><ou-badge [variant]="row.variant">{{ row.status }}</ou-badge></td>
              </tr>
            </ou-table>
          </div>
        </ng-container>

        <!-- Dropdown -->
        <ng-container *ngIf="preview === 'Dropdown'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <div class="sc-row">
              <ou-dropdown>
                <ou-button variant="outline" trigger>Options ▾</ou-button>
                <ou-dropdown-item>View Profile</ou-dropdown-item>
                <ou-dropdown-item>Settings</ou-dropdown-item>
                <ou-dropdown-divider></ou-dropdown-divider>
                <ou-dropdown-item [danger]="true">Sign Out</ou-dropdown-item>
              </ou-dropdown>
              <ou-dropdown align="right">
                <ou-button variant="primary" trigger>Actions ▾</ou-button>
                <ou-dropdown-item>Edit</ou-dropdown-item>
                <ou-dropdown-item>Duplicate</ou-dropdown-item>
                <ou-dropdown-divider></ou-dropdown-divider>
                <ou-dropdown-item [danger]="true">Delete</ou-dropdown-item>
              </ou-dropdown>
            </div>
          </div>
        </ng-container>

        <!-- Modal -->
        <ng-container *ngIf="preview === 'Modal'">
          <div class="sc-section">
            <div class="sc-label">Trigger</div>
            <ou-button variant="primary" (click)="isModalOpen = true">Open Modal</ou-button>
          </div>
          <ou-modal [open]="isModalOpen" title="Example Modal" (close)="isModalOpen = false">
            <p style="color:var(--text-muted);font-size:14px">This is the modal body content. Add any content here.</p>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:24px">
              <ou-button variant="ghost" (click)="isModalOpen = false">Cancel</ou-button>
              <ou-button variant="primary" (click)="isModalOpen = false">Confirm</ou-button>
            </div>
          </ou-modal>
        </ng-container>

        <!-- Drawer -->
        <ng-container *ngIf="preview === 'Drawer'">
          <div class="sc-section">
            <div class="sc-label">Trigger</div>
            <ou-button variant="outline" (click)="isDrawerOpen = true">Open Drawer</ou-button>
          </div>
          <ou-drawer [open]="isDrawerOpen" title="Quick Settings" (close)="isDrawerOpen = false">
            <div style="display:flex;flex-direction:column;gap:16px">
              <ou-checkbox label="Enable notifications"></ou-checkbox>
              <ou-checkbox label="Dark mode"></ou-checkbox>
              <ou-button variant="primary" style="width:100%" (click)="isDrawerOpen = false">Save</ou-button>
            </div>
          </ou-drawer>
        </ng-container>

        <!-- Breadcrumbs -->
        <ng-container *ngIf="preview === 'Breadcrumbs'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <ou-breadcrumbs [items]="['Home', 'Products', 'Details']"></ou-breadcrumbs>
          </div>
          <div class="sc-section">
            <div class="sc-label">Deeper Path</div>
            <ou-breadcrumbs [items]="['Org', 'Project', 'Build', 'Logs']"></ou-breadcrumbs>
          </div>
        </ng-container>

        <!-- List -->
        <ng-container *ngIf="preview === 'List'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <ou-list style="max-width:280px">
              <ou-list-item>Dashboard Overview</ou-list-item>
              <ou-list-item [active]="true">Analytics (active)</ou-list-item>
              <ou-list-item>Team Members</ou-list-item>
              <ou-list-item>Settings</ou-list-item>
            </ou-list>
          </div>
        </ng-container>

        <!-- Toast -->
        <ng-container *ngIf="preview === 'Toast'">
          <div class="sc-section">
            <div class="sc-label">Trigger</div>
            <div class="sc-row">
              <ou-button variant="primary" size="sm" (click)="showToast('success')">Success Toast</ou-button>
              <ou-button variant="danger" size="sm" (click)="showToast('danger')">Error Toast</ou-button>
              <ou-button variant="outline" size="sm" (click)="showToast('info')">Info Toast</ou-button>
              <ou-button variant="ghost" size="sm" (click)="showToast('warning')">Warning Toast</ou-button>
            </div>
          </div>
        </ng-container>

        <!-- Fallback: all components -->
        <ng-container *ngIf="!preview">
          <div style="color:var(--text-muted);font-size:13px">Select a component to preview its variants.</div>
        </ng-container>

      </div>
    </ou-toast-provider>
  `,
})
export class ShowcaseComponent implements OnInit {
  preview = '';
  isModalOpen = false;
  isDrawerOpen = false;

  accordionItems = [
    { title: 'Item One', content: 'Content for the first accordion item.' },
    { title: 'Item Two', content: 'Content for the second accordion item.' },
    { title: 'Item Three', content: 'Content for the third accordion item.' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];

  tableRows = [
    { name: 'Alice M.', role: 'Engineer', status: 'Active', variant: 'success' as const },
    { name: 'Bob K.', role: 'Designer', status: 'Idle', variant: 'default' as const },
    { name: 'Carol S.', role: 'PM', status: 'Away', variant: 'warning' as const },
  ];

  constructor(private toast: ToastService) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    this.preview = params.get('preview') || '';
  }

  showToast(variant: 'success' | 'danger' | 'info' | 'warning') {
    const messages: Record<string, { title: string; message: string }> = {
      success: { title: 'Success', message: 'Operation completed.' },
      danger: { title: 'Error', message: 'Something went wrong.' },
      info: { title: 'Info', message: 'Here is some information.' },
      warning: { title: 'Warning', message: 'Proceed with caution.' },
    };
    this.toast.add({ ...messages[variant], variant });
  }
}
