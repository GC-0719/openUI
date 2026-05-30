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
    <l-toast-provider>
      <div class="l-demo-layout">

        <!-- ── SIDEBAR ── -->
        <aside class="l-demo-sidebar">
          <div class="l-demo-brand">
            <div class="logo-sq">L</div>
            <div>
              <div class="l-demo-brand-name">Lumina</div>
            </div>
            <l-badge variant="primary" style="font-size:9px;padding:2px 6px">PRO</l-badge>
          </div>

          <nav class="l-demo-nav">
            <span class="l-demo-nav-section">Main</span>
            <l-nav-item [active]="activeNav === 'dashboard'" (click)="activeNav = 'dashboard'">Dashboard</l-nav-item>
            <l-nav-item [active]="activeNav === 'analytics'" (click)="activeNav = 'analytics'">Analytics</l-nav-item>
            <l-nav-item [active]="activeNav === 'team'" (click)="activeNav = 'team'">Team</l-nav-item>

            <span class="l-demo-nav-section">Infrastructure</span>
            <l-nav-item [active]="activeNav === 'database'" (click)="activeNav = 'database'">Database</l-nav-item>
            <l-nav-item [active]="activeNav === 'security'" (click)="activeNav = 'security'">
              Security
              <l-badge variant="danger" style="margin-left:auto;font-size:9px;padding:1px 5px">2</l-badge>
            </l-nav-item>
            <l-nav-item [active]="activeNav === 'services'" (click)="activeNav = 'services'">Services</l-nav-item>

            <span class="l-demo-nav-section">Preferences</span>
            <l-nav-item [active]="activeNav === 'settings'" (click)="activeNav = 'settings'">Settings</l-nav-item>
          </nav>

          <div class="l-demo-user">
            <l-avatar initials="EW" size="sm" [ring]="true"></l-avatar>
            <div class="l-demo-user-info">
              <div class="l-demo-user-name">Erica Wright</div>
              <div class="l-demo-user-role">Admin · Pro</div>
            </div>
          </div>
        </aside>

        <!-- ── MAIN ── -->
        <main class="l-demo-main">

          <!-- ── NAVBAR ── -->
          <l-navbar>
            <l-navbar-brand>
              <l-breadcrumbs [items]="['Organization', 'System Intel', 'Dashboard']"></l-breadcrumbs>
            </l-navbar-brand>
            <l-navbar-actions>
              <l-input placeholder="Search..." type="text" style="width:200px"></l-input>
              <l-tooltip text="Notifications" position="bottom">
                <l-button variant="ghost" size="sm" (click)="showNotifToast()">Alerts</l-button>
              </l-tooltip>
              <l-dropdown align="right">
                <l-avatar initials="EW" size="sm" [ring]="true" trigger></l-avatar>
                <l-dropdown-item>Account Settings</l-dropdown-item>
                <l-dropdown-item>Billing</l-dropdown-item>
                <l-dropdown-divider></l-dropdown-divider>
                <l-dropdown-item [danger]="true">Sign Out</l-dropdown-item>
              </l-dropdown>
            </l-navbar-actions>
          </l-navbar>

          <!-- ── CONTENT ── -->
          <div class="l-demo-content">

            <!-- Page title -->
            <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:8px">
              <div>
                <h1 class="l-demo-page-title">Cloud Console</h1>
                <p class="l-demo-page-sub">Live infrastructure health · Lumina Core v2.4</p>
              </div>
              <div style="display:flex;gap:10px">
                <l-button variant="outline" size="sm">Export</l-button>
                <l-button variant="primary" size="sm" (click)="showDeployToast()">Deploy</l-button>
              </div>
            </div>

            <!-- Tabs -->
            <l-tabs [tabs]="centerTabs" [active]="centerTab" (activeChange)="centerTab = $event" style="margin-bottom:24px"></l-tabs>

            <!-- Alert banner -->
            <l-alert variant="warning" title="Maintenance" [dismissible]="true" style="margin-bottom:24px">
              Regional maintenance scheduled for EU-WEST-1 — Sunday 02:00 UTC.
            </l-alert>

            <!-- ── STAT CARDS (Skeleton → real) ── -->
            <div class="l-demo-stats" *ngIf="loading">
              <div class="l-demo-stat" *ngFor="let i of [1,2,3,4]">
                <l-skeleton width="40px" height="40px"></l-skeleton>
                <l-skeleton width="50%" height="28px"></l-skeleton>
                <l-skeleton width="70%" height="12px"></l-skeleton>
              </div>
            </div>

            <div class="l-demo-stats animate-fade-in" *ngIf="!loading">
              <div class="l-demo-stat">
                <div class="l-demo-stat-icon" style="background:var(--primary-soft);color:var(--primary)">99.9%</div>
                <div>
                  <div class="l-demo-stat-value">99.9%</div>
                  <div class="l-demo-stat-label">Uptime SLA</div>
                </div>
                <div class="l-demo-stat-change l-demo-stat-up">↑ +0.2% vs last week</div>
              </div>
              <div class="l-demo-stat">
                <div class="l-demo-stat-icon" style="background:var(--secondary-soft);color:var(--secondary)">1.2ms</div>
                <div>
                  <div class="l-demo-stat-value">1.2ms</div>
                  <div class="l-demo-stat-label">Avg. Latency</div>
                </div>
                <div class="l-demo-stat-change l-demo-stat-up">↑ 18% faster</div>
              </div>
              <div class="l-demo-stat">
                <div class="l-demo-stat-icon" style="background:rgba(245,158,11,0.12);color:var(--warning)">42k</div>
                <div>
                  <div class="l-demo-stat-value">42.5k</div>
                  <div class="l-demo-stat-label">Active Sessions</div>
                </div>
                <div class="l-demo-stat-change l-demo-stat-down">↓ −3% from peak</div>
              </div>
              <div class="l-demo-stat">
                <div class="l-demo-stat-icon" style="background:var(--accent-soft);color:var(--accent)">2TB</div>
                <div>
                  <div class="l-demo-stat-value">2.1 TB</div>
                  <div class="l-demo-stat-label">Data Processed</div>
                </div>
                <div class="l-demo-stat-change l-demo-stat-up">↑ +12% this month</div>
              </div>
            </div>

            <!-- ── BODY GRID ── -->
            <div class="l-demo-body">

              <!-- LEFT COLUMN -->
              <div class="l-demo-body-left">

                <!-- Node Table -->
                <div>
                  <div class="l-demo-section-header">
                    <div class="l-demo-section-title">Node Status</div>
                    <l-button variant="ghost" size="sm">Filter</l-button>
                  </div>
                  <div class="l-demo-table-card">
                    <l-table [columns]="nodeColumns">
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
                        <td><l-badge [variant]="node.status">{{ node.label }}</l-badge></td>
                        <td>
                          <l-dropdown align="right">
                            <l-button variant="ghost" size="sm" trigger>•••</l-button>
                            <l-dropdown-item>View Metrics</l-dropdown-item>
                            <l-dropdown-item>Restart</l-dropdown-item>
                            <l-dropdown-divider></l-dropdown-divider>
                            <l-dropdown-item [danger]="true">Terminate</l-dropdown-item>
                          </l-dropdown>
                        </td>
                      </tr>
                    </l-table>
                  </div>
                </div>

                <!-- Activity + List -->
                <l-card style="padding:20px">
                  <div class="l-demo-section-header">
                    <div class="l-demo-section-title">Activity Feed</div>
                    <l-badge variant="primary" style="font-size:10px">Live</l-badge>
                  </div>
                  <l-list style="margin-top:12px">
                    <l-list-item *ngFor="let item of activity; let i = index" [active]="i === 0">
                      <span style="font-size:8px;margin-right:8px;color:var(--text-dim)">●</span>
                      {{ item.text }}
                      <span style="margin-left:auto;font-size:11px;color:var(--text-dim)">{{ item.time }}</span>
                    </l-list-item>
                  </l-list>
                </l-card>

                <!-- Accordion -->
                <l-accordion [items]="accordionItems" style="display:block"></l-accordion>

              </div>

              <!-- RIGHT COLUMN -->
              <div class="l-demo-body-right">

                <!-- Resources panel -->
                <div class="l-demo-panel">
                  <div class="l-demo-section-header" style="margin-bottom:16px">
                    <div class="l-demo-section-title">Resources</div>
                    <l-tooltip text="Refresh stats" position="left">
                      <l-button variant="ghost" size="sm" (click)="showRefreshToast()">↺</l-button>
                    </l-tooltip>
                  </div>
                  <div class="l-demo-metric">
                    <div class="l-demo-metric-label"><span>CPU</span><span>78.4%</span></div>
                    <l-progress [value]="78"></l-progress>
                  </div>
                  <div class="l-demo-metric">
                    <div class="l-demo-metric-label"><span>Memory</span><span>61.2%</span></div>
                    <l-progress [value]="61"></l-progress>
                  </div>
                  <div class="l-demo-metric">
                    <div class="l-demo-metric-label"><span>Storage</span><span>43.0%</span></div>
                    <l-progress [value]="43"></l-progress>
                  </div>
                  <div class="l-demo-metric" style="margin-bottom:0">
                    <div class="l-demo-metric-label"><span>Bandwidth</span><span>92.1%</span></div>
                    <l-progress [value]="92"></l-progress>
                  </div>
                </div>

                <!-- Controls panel -->
                <div class="l-demo-panel">
                  <div class="l-demo-section-title" style="margin-bottom:16px">System Controls</div>
                  <div style="display:flex;flex-direction:column;gap:14px">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <div style="font-size:13px;font-weight:500">Auto-Scaling</div>
                        <div style="font-size:11px;color:var(--text-dim)">Scale on load spike</div>
                      </div>
                      <l-switch [active]="autoScale" (activeChange)="autoScale = $event"></l-switch>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <div style="font-size:13px;font-weight:500">Auto Backup</div>
                        <div style="font-size:11px;color:var(--text-dim)">Every 6 hours</div>
                      </div>
                      <l-switch [active]="autoBackup" (activeChange)="autoBackup = $event"></l-switch>
                    </div>
                    <div style="height:1px;background:var(--border)"></div>
                    <l-checkbox label="Notify on scale event"></l-checkbox>
                    <l-checkbox label="Send weekly digest"></l-checkbox>
                    <l-checkbox label="Enable debug logs"></l-checkbox>
                  </div>
                </div>

                <!-- Team panel -->
                <div class="l-demo-panel">
                  <div class="l-demo-section-header" style="margin-bottom:12px">
                    <div class="l-demo-section-title">Active Team</div>
                    <l-button variant="ghost" size="sm">+ Add</l-button>
                  </div>
                  <div *ngFor="let member of team" class="l-demo-team-item">
                    <l-tooltip [text]="member.role" position="left">
                      <l-avatar [initials]="member.initials" size="sm"></l-avatar>
                    </l-tooltip>
                    <div class="l-demo-team-info">
                      <div class="l-demo-team-name">{{ member.name }}</div>
                      <div class="l-demo-team-role">{{ member.role }}</div>
                    </div>
                    <l-badge [variant]="member.status" style="font-size:9px;padding:1px 6px">Online</l-badge>
                  </div>
                </div>

                <!-- Chips -->
                <div class="l-demo-panel">
                  <div class="l-demo-section-title" style="margin-bottom:12px">Tags</div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <l-chip variant="primary" [removable]="true">Security</l-chip>
                    <l-chip variant="success" [removable]="true">Performance</l-chip>
                    <l-chip [removable]="true">Global</l-chip>
                    <l-chip variant="warning" [removable]="true">Storage</l-chip>
                  </div>
                </div>

                <l-button variant="danger" style="width:100%" (click)="isModalOpen = true">Terminate Session</l-button>
                <l-button variant="outline" style="width:100%;margin-top:8px" (click)="isDrawerOpen = true">Quick Settings</l-button>

              </div>
            </div>
          </div>
        </main>

        <!-- ── MODAL ── -->
        <l-modal [open]="isModalOpen" title="Terminate Session" (close)="isModalOpen = false">
          <l-alert variant="danger" title="Warning">This action cannot be undone.</l-alert>
          <p style="color:var(--text-muted);font-size:14px;margin:16px 0">
            Terminating the session will immediately close all active connections and stop running jobs.
          </p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
            <l-radio label="Save state and exit" name="termMode" value="save"></l-radio>
            <l-radio label="Exit immediately (discard state)" name="termMode" value="discard"></l-radio>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <l-button variant="ghost" (click)="isModalOpen = false">Cancel</l-button>
            <l-button variant="danger" (click)="onTerminate()">Terminate</l-button>
          </div>
        </l-modal>

        <!-- ── DRAWER ── -->
        <l-drawer [open]="isDrawerOpen" title="Quick Settings" (close)="isDrawerOpen = false">
          <div style="display:flex;flex-direction:column;gap:24px">
            <div>
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:600">NOTIFICATIONS</div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <l-checkbox label="Email alerts"></l-checkbox>
                <l-checkbox label="Slack integration"></l-checkbox>
                <l-checkbox label="SMS critical only"></l-checkbox>
              </div>
            </div>
            <div>
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:600">THEME</div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:14px">Dark Mode</span>
                <l-switch [active]="true"></l-switch>
              </div>
            </div>
            <l-button variant="primary" style="width:100%" (click)="onSaveSettings()">Save Preferences</l-button>
          </div>
        </l-drawer>

      </div>
    </l-toast-provider>
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
    { title: 'What is Lumina UI?', content: 'A high-performance glassmorphic UI kit built with class-based CSS.' },
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
