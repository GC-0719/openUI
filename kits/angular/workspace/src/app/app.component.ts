import { Component, inject } from '@angular/core';
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
} from '../components/ui';

@Component({
  selector: 'app-root',
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
  template: `
    <ou-toast-provider>
      <div class="ou-demo-layout">

        <!-- ── SIDEBAR ── -->
        <aside class="ou-demo-sidebar">
          <div class="ou-demo-brand">
            <div class="logo-sq">L</div>
            <div>
              <div class="ou-demo-brand-name">openUI</div>
            </div>
            <ou-badge variant="primary" style="font-size:9px;padding:2px 6px">PRO</ou-badge>
          </div>

          <nav class="ou-demo-nav">
            <span class="ou-demo-nav-section">Main</span>
            <ou-nav-item [active]="activeNav === 'dashboard'" (click)="activeNav = 'dashboard'">Dashboard</ou-nav-item>
            <ou-nav-item [active]="activeNav === 'analytics'" (click)="activeNav = 'analytics'">Analytics</ou-nav-item>
            <ou-nav-item [active]="activeNav === 'team'" (click)="activeNav = 'team'">Team</ou-nav-item>

            <span class="ou-demo-nav-section">Infrastructure</span>
            <ou-nav-item [active]="activeNav === 'database'" (click)="activeNav = 'database'">Database</ou-nav-item>
            <ou-nav-item [active]="activeNav === 'security'" (click)="activeNav = 'security'">
              Security
              <ou-badge variant="danger" style="margin-left:auto;font-size:9px;padding:1px 5px">2</ou-badge>
            </ou-nav-item>
            <ou-nav-item [active]="activeNav === 'services'" (click)="activeNav = 'services'">Services</ou-nav-item>

            <span class="ou-demo-nav-section">Preferences</span>
            <ou-nav-item [active]="activeNav === 'settings'" (click)="activeNav = 'settings'">Settings</ou-nav-item>
          </nav>

          <div class="ou-demo-user">
            <ou-avatar initials="EW" size="sm" [ring]="true"></ou-avatar>
            <div class="ou-demo-user-info">
              <div class="ou-demo-user-name">Erica Wright</div>
              <div class="ou-demo-user-role">Admin · Pro</div>
            </div>
          </div>
        </aside>

        <!-- ── MAIN ── -->
        <main class="ou-demo-main">

          <!-- ── NAVBAR ── -->
          <ou-navbar>
            <ou-navbar-brand>
              <ou-breadcrumbs [items]="['Organization', 'System Intel', 'Dashboard']"></ou-breadcrumbs>
            </ou-navbar-brand>
            <ou-navbar-actions>
              <ou-input placeholder="Search..." type="text" style="width:200px"></ou-input>
              <ou-tooltip text="Notifications" position="bottom">
                <ou-button variant="ghost" size="sm" (click)="showNotifToast()">Alerts</ou-button>
              </ou-tooltip>
              <ou-dropdown align="right">
                <ou-avatar initials="EW" size="sm" [ring]="true" trigger></ou-avatar>
                <ou-dropdown-item>Account Settings</ou-dropdown-item>
                <ou-dropdown-item>Billing</ou-dropdown-item>
                <ou-dropdown-divider></ou-dropdown-divider>
                <ou-dropdown-item [danger]="true">Sign Out</ou-dropdown-item>
              </ou-dropdown>
            </ou-navbar-actions>
          </ou-navbar>

          <!-- ── CONTENT ── -->
          <div class="ou-demo-content">

            <!-- Page title -->
            <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:8px">
              <div>
                <h1 class="ou-demo-page-title">Cloud Console</h1>
                <p class="ou-demo-page-sub">Live infrastructure health · openUI Core v2.4</p>
              </div>
              <div style="display:flex;gap:10px">
                <ou-button variant="outline" size="sm">Export</ou-button>
                <ou-button variant="primary" size="sm" (click)="showDeployToast()">Deploy</ou-button>
              </div>
            </div>

            <!-- Tabs -->
            <ou-tabs [tabs]="centerTabs" [active]="centerTab" (activeChange)="centerTab = $event" style="margin-bottom:24px"></ou-tabs>

            <!-- Alert banner -->
            <ou-alert variant="warning" title="Maintenance" [dismissible]="true" style="margin-bottom:24px">
              Regional maintenance scheduled for EU-WEST-1 — Sunday 02:00 UTC.
            </ou-alert>

            <!-- ── STAT CARDS (Skeleton → real) ── -->
            <div class="ou-demo-stats" *ngIf="loading">
              <div class="ou-demo-stat" *ngFor="let i of [1,2,3,4]">
                <ou-skeleton width="40px" height="40px"></ou-skeleton>
                <ou-skeleton width="50%" height="28px"></ou-skeleton>
                <ou-skeleton width="70%" height="12px"></ou-skeleton>
              </div>
            </div>

            <div class="ou-demo-stats animate-fade-in" *ngIf="!loading">
              <div class="ou-demo-stat">
                <div class="ou-demo-stat-icon" style="background:var(--primary-soft);color:var(--primary)">99.9%</div>
                <div>
                  <div class="ou-demo-stat-value">99.9%</div>
                  <div class="ou-demo-stat-label">Uptime SLA</div>
                </div>
                <div class="ou-demo-stat-change ou-demo-stat-up">↑ +0.2% vs last week</div>
              </div>
              <div class="ou-demo-stat">
                <div class="ou-demo-stat-icon" style="background:var(--secondary-soft);color:var(--secondary)">1.2ms</div>
                <div>
                  <div class="ou-demo-stat-value">1.2ms</div>
                  <div class="ou-demo-stat-label">Avg. Latency</div>
                </div>
                <div class="ou-demo-stat-change ou-demo-stat-up">↑ 18% faster</div>
              </div>
              <div class="ou-demo-stat">
                <div class="ou-demo-stat-icon" style="background:rgba(245,158,11,0.12);color:var(--warning)">42k</div>
                <div>
                  <div class="ou-demo-stat-value">42.5k</div>
                  <div class="ou-demo-stat-label">Active Sessions</div>
                </div>
                <div class="ou-demo-stat-change ou-demo-stat-down">↓ −3% from peak</div>
              </div>
              <div class="ou-demo-stat">
                <div class="ou-demo-stat-icon" style="background:var(--accent-soft);color:var(--accent)">2TB</div>
                <div>
                  <div class="ou-demo-stat-value">2.1 TB</div>
                  <div class="ou-demo-stat-label">Data Processed</div>
                </div>
                <div class="ou-demo-stat-change ou-demo-stat-up">↑ +12% this month</div>
              </div>
            </div>

            <!-- ── BODY GRID ── -->
            <div class="ou-demo-body">

              <!-- LEFT COLUMN -->
              <div class="ou-demo-body-left">

                <!-- Node Table -->
                <div>
                  <div class="ou-demo-section-header">
                    <div class="ou-demo-section-title">Node Status</div>
                    <ou-button variant="ghost" size="sm">Filter</ou-button>
                  </div>
                  <div class="ou-demo-table-card">
                    <ou-table [columns]="nodeColumns">
                      <tr *ngFor="let node of nodes">
                        <td style="font-family:monospace;font-size:13px">{{ node.id }}</td>
                        <td style="color:var(--text-muted);font-size:13px">{{ node.region }}</td>
                        <td style="width:140px">
                          <div style="display:flex;align-items:center;gap:8px">
                            <div style="flex:1;height:4px;background:var(--surface-raised);border-radius:4px;overflow:hidden">
                              <div [style.width]="node.load + '%'" [style.background]="node.load > 75 ? 'var(--accent)' : node.load > 50 ? 'var(--warning)' : 'var(--secondary)'" style="height:100%;border-radius:4px;transition:width 0.4s"></div>
                            </div>
                            <span style="font-size:12px;color:var(--text-dim)">{{ node.load }}%</span>
                          </div>
                        </td>
                        <td><ou-badge [variant]="node.status">{{ node.label }}</ou-badge></td>
                        <td>
                          <ou-dropdown align="right">
                            <ou-button variant="ghost" size="sm" trigger>•••</ou-button>
                            <ou-dropdown-item>View Metrics</ou-dropdown-item>
                            <ou-dropdown-item>Restart</ou-dropdown-item>
                            <ou-dropdown-divider></ou-dropdown-divider>
                            <ou-dropdown-item [danger]="true">Terminate</ou-dropdown-item>
                          </ou-dropdown>
                        </td>
                      </tr>
                    </ou-table>
                  </div>
                </div>

                <!-- Activity + List -->
                <ou-card style="padding:20px">
                  <div class="ou-demo-section-header">
                    <div class="ou-demo-section-title">Activity Feed</div>
                    <ou-badge variant="primary" style="font-size:10px">Live</ou-badge>
                  </div>
                  <ou-list style="margin-top:12px">
                    <ou-list-item *ngFor="let item of activity; let i = index" [active]="i === 0">
                      <span style="font-size:8px;margin-right:8px;color:var(--text-dim)">●</span>
                      {{ item.text }}
                      <span style="margin-left:auto;font-size:11px;color:var(--text-dim)">{{ item.time }}</span>
                    </ou-list-item>
                  </ou-list>
                </ou-card>

                <!-- Accordion -->
                <ou-accordion [items]="accordionItems" style="display:block"></ou-accordion>

              </div>

              <!-- RIGHT COLUMN -->
              <div class="ou-demo-body-right">

                <!-- Resources panel -->
                <div class="ou-demo-panel">
                  <div class="ou-demo-section-header" style="margin-bottom:16px">
                    <div class="ou-demo-section-title">Resources</div>
                    <ou-tooltip text="Refresh stats" position="left">
                      <ou-button variant="ghost" size="sm" (click)="showRefreshToast()">↺</ou-button>
                    </ou-tooltip>
                  </div>
                  <div class="ou-demo-metric">
                    <div class="ou-demo-metric-label"><span>CPU</span><span>78.4%</span></div>
                    <ou-progress [value]="78"></ou-progress>
                  </div>
                  <div class="ou-demo-metric">
                    <div class="ou-demo-metric-label"><span>Memory</span><span>61.2%</span></div>
                    <ou-progress [value]="61"></ou-progress>
                  </div>
                  <div class="ou-demo-metric">
                    <div class="ou-demo-metric-label"><span>Storage</span><span>43.0%</span></div>
                    <ou-progress [value]="43"></ou-progress>
                  </div>
                  <div class="ou-demo-metric" style="margin-bottom:0">
                    <div class="ou-demo-metric-label"><span>Bandwidth</span><span>92.1%</span></div>
                    <ou-progress [value]="92"></ou-progress>
                  </div>
                </div>

                <!-- Controls panel -->
                <div class="ou-demo-panel">
                  <div class="ou-demo-section-title" style="margin-bottom:16px">System Controls</div>
                  <div style="display:flex;flex-direction:column;gap:14px">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <div style="font-size:13px;font-weight:500">Auto-Scaling</div>
                        <div style="font-size:11px;color:var(--text-dim)">Scale on load spike</div>
                      </div>
                      <ou-switch [active]="autoScale" (activeChange)="autoScale = $event"></ou-switch>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <div style="font-size:13px;font-weight:500">Auto Backup</div>
                        <div style="font-size:11px;color:var(--text-dim)">Every 6 hours</div>
                      </div>
                      <ou-switch [active]="autoBackup" (activeChange)="autoBackup = $event"></ou-switch>
                    </div>
                    <div style="height:1px;background:var(--border)"></div>
                    <ou-checkbox label="Notify on scale event"></ou-checkbox>
                    <ou-checkbox label="Send weekly digest"></ou-checkbox>
                    <ou-checkbox label="Enable debug logs"></ou-checkbox>
                  </div>
                </div>

                <!-- Team panel -->
                <div class="ou-demo-panel">
                  <div class="ou-demo-section-header" style="margin-bottom:12px">
                    <div class="ou-demo-section-title">Active Team</div>
                    <ou-button variant="ghost" size="sm">+ Add</ou-button>
                  </div>
                  <div *ngFor="let member of team" class="ou-demo-team-item">
                    <ou-tooltip [text]="member.role" position="left">
                      <ou-avatar [initials]="member.initials" size="sm"></ou-avatar>
                    </ou-tooltip>
                    <div class="ou-demo-team-info">
                      <div class="ou-demo-team-name">{{ member.name }}</div>
                      <div class="ou-demo-team-role">{{ member.role }}</div>
                    </div>
                    <ou-badge [variant]="member.status" style="font-size:9px;padding:1px 6px">Online</ou-badge>
                  </div>
                </div>

                <!-- Chips -->
                <div class="ou-demo-panel">
                  <div class="ou-demo-section-title" style="margin-bottom:12px">Tags</div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <ou-chip variant="primary" [removable]="true">Security</ou-chip>
                    <ou-chip variant="success" [removable]="true">Performance</ou-chip>
                    <ou-chip [removable]="true">Global</ou-chip>
                    <ou-chip variant="warning" [removable]="true">Storage</ou-chip>
                  </div>
                </div>

                <ou-button variant="danger" style="width:100%" (click)="isModalOpen = true">Terminate Session</ou-button>
                <ou-button variant="outline" style="width:100%;margin-top:8px" (click)="isDrawerOpen = true">Quick Settings</ou-button>

              </div>
            </div>
          </div>
        </main>

        <!-- ── MODAL ── -->
        <ou-modal [open]="isModalOpen" title="Terminate Session" (close)="isModalOpen = false">
          <ou-alert variant="danger" title="Warning">This action cannot be undone.</ou-alert>
          <p style="color:var(--text-muted);font-size:14px;margin:16px 0">
            Terminating the session will immediately close all active connections and stop running jobs.
          </p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
            <ou-radio label="Save state and exit" name="termMode" value="save"></ou-radio>
            <ou-radio label="Exit immediately (discard state)" name="termMode" value="discard"></ou-radio>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <ou-button variant="ghost" (click)="isModalOpen = false">Cancel</ou-button>
            <ou-button variant="danger" (click)="onTerminate()">Terminate</ou-button>
          </div>
        </ou-modal>

        <!-- ── DRAWER ── -->
        <ou-drawer [open]="isDrawerOpen" title="Quick Settings" (close)="isDrawerOpen = false">
          <div style="display:flex;flex-direction:column;gap:24px">
            <div>
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:600">NOTIFICATIONS</div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <ou-checkbox label="Email alerts"></ou-checkbox>
                <ou-checkbox label="Slack integration"></ou-checkbox>
                <ou-checkbox label="SMS critical only"></ou-checkbox>
              </div>
            </div>
            <div>
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:600">THEME</div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:14px">Dark Mode</span>
                <ou-switch [active]="true"></ou-switch>
              </div>
            </div>
            <ou-button variant="primary" style="width:100%" (click)="onSaveSettings()">Save Preferences</ou-button>
          </div>
        </ou-drawer>

      </div>
    </ou-toast-provider>
  `,
})
export class AppComponent {
  private toast = inject(ToastService);

  activeNav = 'dashboard';
  centerTab = 'overview';
  loading = true;
  isModalOpen = false;
  isDrawerOpen = false;
  autoScale = true;
  autoBackup = false;

  centerTabs = ['overview', 'network', 'activity'];

  nodeColumns: TableColumn[] = [
    { key: 'id', label: 'Node ID' },
    { key: 'region', label: 'Region' },
    { key: 'load', label: 'CPU Load' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  nodes = [
    { id: '#node-882', region: 'US-EAST-1', load: 12, status: 'success', label: 'Healthy' },
    { id: '#node-914', region: 'EU-WEST-1', load: 88, status: 'primary', label: 'Balancing' },
    { id: '#node-331', region: 'AP-SOUTH-1', load: 34, status: 'success', label: 'Healthy' },
    { id: '#node-107', region: 'US-WEST-2', load: 67, status: 'warning', label: 'Watch' },
  ];

  activity = [
    { text: 'Sarah Chen deployed auth-v2 to production', time: '2m ago' },
    { text: 'Node #914 load balanced — 88% → 42%', time: '11m ago' },
    { text: 'EU-WEST-1 maintenance window started', time: '32m ago' },
    { text: 'Alert: CPU spike on node #882 resolved', time: '1h ago' },
    { text: 'Marcus D. added 3 new API keys', time: '2h ago' },
  ];

  team = [
    { name: 'Sarah Chen', role: 'Lead Engineer', initials: 'SC', status: 'success' },
    { name: 'Marcus Davis', role: 'DevOps', initials: 'MD', status: 'primary' },
    { name: 'Priya Patel', role: 'Security', initials: 'PP', status: 'success' },
    { name: 'Jake Burton', role: 'Frontend', initials: 'JB', status: 'primary' },
  ];

  accordionItems = [
    { title: 'Advanced Config', content: 'Kernel parameters are optimized. Max connections: 10,000. Keep-alive: 75s.' },
    { title: 'Environment', content: 'Runtime: Node 20 LTS · Region: us-east-1 · TLS 1.3 enforced.' },
    { title: 'What is openUI?', content: 'A high-performance glassmorphic UI kit built with class-based CSS.' },
  ];

  constructor() {
    setTimeout(() => { this.loading = false; }, 1400);
  }

  showDeployToast() {
    this.toast.add({ title: 'Deployment Started', message: 'Build pipeline triggered for auth-v3.', variant: 'success' });
  }

  showNotifToast() {
    this.toast.add({ title: 'No new alerts', message: 'All systems nominal.', variant: 'info' });
  }

  showRefreshToast() {
    this.toast.add({ title: 'Data Refreshed', message: 'All metrics updated.', variant: 'info' });
  }

  onTerminate() {
    this.isModalOpen = false;
    this.toast.add({ title: 'Session Terminated', message: 'All connections closed.', variant: 'warning' });
  }

  onSaveSettings() {
    this.isDrawerOpen = false;
    this.toast.add({ title: 'Settings Saved', message: 'Preferences updated successfully.', variant: 'success' });
  }
}
