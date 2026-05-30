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
  selector: 'l-showcase',
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
    <l-toast-provider>
      <div class="sc-wrap">

        <!-- Button -->
        <ng-container *ngIf="preview === 'Button'">
          <div class="sc-section">
            <div class="sc-label">Variants</div>
            <div class="sc-row">
              <l-button variant="primary">Primary</l-button>
              <l-button variant="secondary">Secondary</l-button>
              <l-button variant="outline">Outline</l-button>
              <l-button variant="ghost">Ghost</l-button>
              <l-button variant="danger">Danger</l-button>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Sizes</div>
            <div class="sc-row">
              <l-button variant="primary" size="sm">Small</l-button>
              <l-button variant="primary" size="md">Medium</l-button>
              <l-button variant="primary" size="lg">Large</l-button>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-row">
              <l-button variant="primary" [disabled]="true">Disabled</l-button>
              <l-button variant="outline" [disabled]="true">Disabled Outline</l-button>
            </div>
          </div>
        </ng-container>

        <!-- Badge -->
        <ng-container *ngIf="preview === 'Badge'">
          <div class="sc-section">
            <div class="sc-label">Variants</div>
            <div class="sc-row">
              <l-badge variant="default">Default</l-badge>
              <l-badge variant="primary">Primary</l-badge>
              <l-badge variant="success">Success</l-badge>
              <l-badge variant="warning">Warning</l-badge>
              <l-badge variant="danger">Danger</l-badge>
            </div>
          </div>
        </ng-container>

        <!-- Card -->
        <ng-container *ngIf="preview === 'Card'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <l-card style="padding:20px;max-width:300px">
              <div style="font-size:16px;font-weight:700;margin-bottom:8px">Card Title</div>
              <div style="font-size:13px;color:var(--text-muted)">Card content goes here. Use cards to group related information.</div>
            </l-card>
          </div>
          <div class="sc-section">
            <div class="sc-label">With Action</div>
            <l-card style="padding:20px;max-width:300px">
              <div style="font-size:16px;font-weight:700;margin-bottom:8px">Settings</div>
              <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Manage your account preferences.</div>
              <div class="sc-row">
                <l-button variant="primary" size="sm">Save</l-button>
                <l-button variant="ghost" size="sm">Cancel</l-button>
              </div>
            </l-card>
          </div>
        </ng-container>

        <!-- Input -->
        <ng-container *ngIf="preview === 'Input'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <div class="sc-col" style="max-width:280px">
              <l-input placeholder="Enter text…"></l-input>
              <l-input placeholder="With label" label="Email address"></l-input>
              <l-input placeholder="Password" type="password" label="Password"></l-input>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-col" style="max-width:280px">
              <l-input placeholder="Error state" [error]="true" errorMessage="This field is required" label="Username"></l-input>
              <l-input placeholder="Disabled" [disabled]="true" label="Read only"></l-input>
            </div>
          </div>
        </ng-container>

        <!-- Alert -->
        <ng-container *ngIf="preview === 'Alert'">
          <div class="sc-section">
            <div class="sc-label">Variants</div>
            <div class="sc-col">
              <l-alert variant="info" title="Info">This is an informational alert message.</l-alert>
              <l-alert variant="success" title="Success">Operation completed successfully.</l-alert>
              <l-alert variant="warning" title="Warning">This action may have consequences.</l-alert>
              <l-alert variant="danger" title="Error">Something went wrong. Please try again.</l-alert>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Dismissible</div>
            <l-alert variant="info" title="Dismissible" [dismissible]="true">Click the × to dismiss this alert.</l-alert>
          </div>
        </ng-container>

        <!-- Avatar -->
        <ng-container *ngIf="preview === 'Avatar'">
          <div class="sc-section">
            <div class="sc-label">Sizes</div>
            <div class="sc-row">
              <l-avatar initials="AB" size="sm"></l-avatar>
              <l-avatar initials="CD" size="md"></l-avatar>
              <l-avatar initials="EF" size="lg"></l-avatar>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">With Ring</div>
            <div class="sc-row">
              <l-avatar initials="GH" size="sm" [ring]="true"></l-avatar>
              <l-avatar initials="IJ" size="md" [ring]="true"></l-avatar>
              <l-avatar initials="KL" size="lg" [ring]="true"></l-avatar>
            </div>
          </div>
        </ng-container>

        <!-- Switch -->
        <ng-container *ngIf="preview === 'Switch'">
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-col">
              <l-switch [active]="false"></l-switch>
              <l-switch [active]="true"></l-switch>
              <l-switch [active]="true" [disabled]="true"></l-switch>
            </div>
          </div>
        </ng-container>

        <!-- Checkbox -->
        <ng-container *ngIf="preview === 'Checkbox'">
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-col">
              <l-checkbox label="Unchecked"></l-checkbox>
              <l-checkbox label="Checked" [checked]="true"></l-checkbox>
              <l-checkbox label="Disabled" [disabled]="true"></l-checkbox>
            </div>
          </div>
        </ng-container>

        <!-- Radio -->
        <ng-container *ngIf="preview === 'Radio'">
          <div class="sc-section">
            <div class="sc-label">Group</div>
            <div class="sc-col">
              <l-radio label="Option A" name="demo" value="a"></l-radio>
              <l-radio label="Option B" name="demo" value="b"></l-radio>
              <l-radio label="Option C (disabled)" name="demo" value="c" [disabled]="true"></l-radio>
            </div>
          </div>
        </ng-container>

        <!-- Progress -->
        <ng-container *ngIf="preview === 'Progress'">
          <div class="sc-section">
            <div class="sc-label">Values</div>
            <div class="sc-col">
              <l-progress [value]="25"></l-progress>
              <l-progress [value]="50"></l-progress>
              <l-progress [value]="75"></l-progress>
              <l-progress [value]="100"></l-progress>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Striped</div>
            <div class="sc-col">
              <l-progress [value]="60" [striped]="true"></l-progress>
            </div>
          </div>
        </ng-container>

        <!-- Chip -->
        <ng-container *ngIf="preview === 'Chip'">
          <div class="sc-section">
            <div class="sc-label">Variants</div>
            <div class="sc-row">
              <l-chip>Default</l-chip>
              <l-chip variant="primary">Primary</l-chip>
              <l-chip variant="success">Success</l-chip>
              <l-chip variant="warning">Warning</l-chip>
              <l-chip variant="danger">Danger</l-chip>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Removable</div>
            <div class="sc-row">
              <l-chip [removable]="true">Removable</l-chip>
              <l-chip variant="primary" [removable]="true">Primary</l-chip>
            </div>
          </div>
        </ng-container>

        <!-- Tabs -->
        <ng-container *ngIf="preview === 'Tabs'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <l-tabs [tabs]="['Overview', 'Analytics', 'Reports']" active="Overview"></l-tabs>
          </div>
          <div class="sc-section">
            <div class="sc-label">With Icon Labels</div>
            <l-tabs [tabs]="['Files', 'Code', 'Preview']" active="Files"></l-tabs>
          </div>
        </ng-container>

        <!-- Accordion -->
        <ng-container *ngIf="preview === 'Accordion'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <l-accordion [items]="accordionItems"></l-accordion>
          </div>
        </ng-container>

        <!-- Skeleton -->
        <ng-container *ngIf="preview === 'Skeleton'">
          <div class="sc-section">
            <div class="sc-label">Shapes</div>
            <div class="sc-col">
              <l-skeleton width="100%" height="20px"></l-skeleton>
              <l-skeleton width="60%" height="20px"></l-skeleton>
              <l-skeleton width="80%" height="20px"></l-skeleton>
            </div>
          </div>
          <div class="sc-section">
            <div class="sc-label">Avatar Placeholder</div>
            <div class="sc-row">
              <l-skeleton width="40px" height="40px" [circle]="true"></l-skeleton>
              <div class="sc-col" style="flex:1">
                <l-skeleton width="120px" height="14px"></l-skeleton>
                <l-skeleton width="80px" height="12px"></l-skeleton>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Tooltip -->
        <ng-container *ngIf="preview === 'Tooltip'">
          <div class="sc-section">
            <div class="sc-label">Positions</div>
            <div class="sc-row" style="padding:32px 0">
              <l-tooltip text="Top tooltip" position="top"><l-button variant="outline" size="sm">Top</l-button></l-tooltip>
              <l-tooltip text="Bottom tooltip" position="bottom"><l-button variant="outline" size="sm">Bottom</l-button></l-tooltip>
              <l-tooltip text="Left tooltip" position="left"><l-button variant="outline" size="sm">Left</l-button></l-tooltip>
              <l-tooltip text="Right tooltip" position="right"><l-button variant="outline" size="sm">Right</l-button></l-tooltip>
            </div>
          </div>
        </ng-container>

        <!-- Navbar -->
        <ng-container *ngIf="preview === 'Navbar'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <l-navbar>
              <l-navbar-brand>My App</l-navbar-brand>
              <l-navbar-actions>
                <l-button variant="ghost" size="sm">Docs</l-button>
                <l-button variant="primary" size="sm">Sign In</l-button>
              </l-navbar-actions>
            </l-navbar>
          </div>
        </ng-container>

        <!-- NavItem -->
        <ng-container *ngIf="preview === 'NavItem'">
          <div class="sc-section">
            <div class="sc-label">States</div>
            <div class="sc-col" style="max-width:220px">
              <l-nav-item>Dashboard</l-nav-item>
              <l-nav-item [active]="true">Analytics (active)</l-nav-item>
              <l-nav-item>Settings</l-nav-item>
            </div>
          </div>
        </ng-container>

        <!-- Table -->
        <ng-container *ngIf="preview === 'Table'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <l-table [columns]="tableColumns">
              <tr *ngFor="let row of tableRows">
                <td>{{ row.name }}</td>
                <td>{{ row.role }}</td>
                <td><l-badge [variant]="row.variant">{{ row.status }}</l-badge></td>
              </tr>
            </l-table>
          </div>
        </ng-container>

        <!-- Dropdown -->
        <ng-container *ngIf="preview === 'Dropdown'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <div class="sc-row">
              <l-dropdown>
                <l-button variant="outline" trigger>Options ▾</l-button>
                <l-dropdown-item>View Profile</l-dropdown-item>
                <l-dropdown-item>Settings</l-dropdown-item>
                <l-dropdown-divider></l-dropdown-divider>
                <l-dropdown-item [danger]="true">Sign Out</l-dropdown-item>
              </l-dropdown>
              <l-dropdown align="right">
                <l-button variant="primary" trigger>Actions ▾</l-button>
                <l-dropdown-item>Edit</l-dropdown-item>
                <l-dropdown-item>Duplicate</l-dropdown-item>
                <l-dropdown-divider></l-dropdown-divider>
                <l-dropdown-item [danger]="true">Delete</l-dropdown-item>
              </l-dropdown>
            </div>
          </div>
        </ng-container>

        <!-- Modal -->
        <ng-container *ngIf="preview === 'Modal'">
          <div class="sc-section">
            <div class="sc-label">Trigger</div>
            <l-button variant="primary" (click)="isModalOpen = true">Open Modal</l-button>
          </div>
          <l-modal [open]="isModalOpen" title="Example Modal" (close)="isModalOpen = false">
            <p style="color:var(--text-muted);font-size:14px">This is the modal body content. Add any content here.</p>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:24px">
              <l-button variant="ghost" (click)="isModalOpen = false">Cancel</l-button>
              <l-button variant="primary" (click)="isModalOpen = false">Confirm</l-button>
            </div>
          </l-modal>
        </ng-container>

        <!-- Drawer -->
        <ng-container *ngIf="preview === 'Drawer'">
          <div class="sc-section">
            <div class="sc-label">Trigger</div>
            <l-button variant="outline" (click)="isDrawerOpen = true">Open Drawer</l-button>
          </div>
          <l-drawer [open]="isDrawerOpen" title="Quick Settings" (close)="isDrawerOpen = false">
            <div style="display:flex;flex-direction:column;gap:16px">
              <l-checkbox label="Enable notifications"></l-checkbox>
              <l-checkbox label="Dark mode"></l-checkbox>
              <l-button variant="primary" style="width:100%" (click)="isDrawerOpen = false">Save</l-button>
            </div>
          </l-drawer>
        </ng-container>

        <!-- Breadcrumbs -->
        <ng-container *ngIf="preview === 'Breadcrumbs'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <l-breadcrumbs [items]="['Home', 'Products', 'Details']"></l-breadcrumbs>
          </div>
          <div class="sc-section">
            <div class="sc-label">Deeper Path</div>
            <l-breadcrumbs [items]="['Org', 'Project', 'Build', 'Logs']"></l-breadcrumbs>
          </div>
        </ng-container>

        <!-- List -->
        <ng-container *ngIf="preview === 'List'">
          <div class="sc-section">
            <div class="sc-label">Default</div>
            <l-list style="max-width:280px">
              <l-list-item>Dashboard Overview</l-list-item>
              <l-list-item [active]="true">Analytics (active)</l-list-item>
              <l-list-item>Team Members</l-list-item>
              <l-list-item>Settings</l-list-item>
            </l-list>
          </div>
        </ng-container>

        <!-- Toast -->
        <ng-container *ngIf="preview === 'Toast'">
          <div class="sc-section">
            <div class="sc-label">Trigger</div>
            <div class="sc-row">
              <l-button variant="primary" size="sm" (click)="showToast('success')">Success Toast</l-button>
              <l-button variant="danger" size="sm" (click)="showToast('danger')">Error Toast</l-button>
              <l-button variant="outline" size="sm" (click)="showToast('info')">Info Toast</l-button>
              <l-button variant="ghost" size="sm" (click)="showToast('warning')">Warning Toast</l-button>
            </div>
          </div>
        </ng-container>

        <!-- Fallback: all components -->
        <ng-container *ngIf="!preview">
          <div style="color:var(--text-muted);font-size:13px">Select a component to preview its variants.</div>
        </ng-container>

      </div>
    </l-toast-provider>
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
