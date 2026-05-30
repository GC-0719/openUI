import React, { useState, useEffect } from 'react';
import {
  Home, BarChart2, Users, Settings, Bell, Search,
  Plus, MoreHorizontal, ChevronDown, Check, Info,
  AlertTriangle, Shield, Zap, Globe, Mail,
  ArrowUpRight, ArrowDownRight, Download, Terminal,
  Layers, Trash2, Code, Moon, Sun, TrendingUp,
  CreditCard, Activity, Filter, RefreshCw, LogOut,
  Database, Cpu, HardDrive, Network
} from 'lucide-react';
import {
  Button, Input, Badge, Card, Avatar,
  Alert, Progress, Skeleton, Tooltip,
  Tabs, Accordion, Breadcrumbs, NavItem,
  Checkbox, Switch, Radio, Modal, Chip,
  Navbar, NavbarBrand, NavbarActions,
  Table, List, ListItem,
  Dropdown, DropdownItem, DropdownDivider,
  useToast, Drawer
} from '../components/ui';
import '../styles/lumina.css';
import '../styles/demo.css';

/* ── Mini bar chart data ── */
const CHART_DATA = [
  { label: 'Mon', value: 45 },
  { label: 'Tue', value: 72 },
  { label: 'Wed', value: 58 },
  { label: 'Thu', value: 88 },
  { label: 'Fri', value: 64 },
  { label: 'Sat', value: 92 },
  { label: 'Sun', value: 78 },
];

const ACTIVITY = [
  { color: 'var(--secondary)', text: <><strong>Sarah Chen</strong> deployed auth-v2 to production</>, time: '2m ago' },
  { color: 'var(--primary)', text: <><strong>Node #914</strong> load balanced — 88% → 42%</>, time: '11m ago' },
  { color: 'var(--warning)', text: <><strong>EU-WEST-1</strong> maintenance window started</>, time: '32m ago' },
  { color: 'var(--accent)', text: <><strong>Alert</strong>: CPU spike on node #882 resolved</>, time: '1h ago' },
  { color: 'var(--secondary)', text: <><strong>Marcus D.</strong> added 3 new API keys</>, time: '2h ago' },
];

const TEAM = [
  { name: 'Sarah Chen', role: 'Lead Engineer', seed: 'sarah', status: 'success' },
  { name: 'Marcus Davis', role: 'DevOps', seed: 'marcus', status: 'primary' },
  { name: 'Priya Patel', role: 'Security', seed: 'priya', status: 'success' },
  { name: 'Jake Burton', role: 'Frontend', seed: 'jake', status: 'primary' },
];

const NODES = [
  { id: '#node-882', region: 'US-EAST-1', load: 12, status: 'success', label: 'Healthy' },
  { id: '#node-914', region: 'EU-WEST-1', load: 88, status: 'primary', label: 'Balancing' },
  { id: '#node-331', region: 'AP-SOUTH-1', load: 34, status: 'success', label: 'Healthy' },
  { id: '#node-107', region: 'US-WEST-2', load: 67, status: 'warning', label: 'Watch' },
];

/* ─────────────────────────────────────── */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const [isAutoBackup, setIsAutoBackup] = useState(false);
  const [activeBar, setActiveBar] = useState(5);
  const [theme, setTheme] = useState(
    localStorage.getItem('lumina-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lumina-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleDeploy = () => {
    addToast({ title: 'Deployment Started', message: 'Build pipeline triggered for auth-v3.', variant: 'success' });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({ title: 'Data Refreshed', message: 'All metrics updated.', variant: 'info' });
    }, 800);
  };

  const maxBar = Math.max(...CHART_DATA.map(d => d.value));

  return (
    <div className="l-demo-layout">

      {/* ── SIDEBAR ── */}
      <aside className="l-demo-sidebar">
        <div className="l-demo-brand">
          <div className="logo-sq">L</div>
          <div>
            <div className="l-demo-brand-name">Mina</div>
          </div>
          <span className="l-demo-brand-tag">PRO</span>
        </div>

        <nav className="l-demo-nav">
          <span className="l-demo-nav-section">Main</span>
          <NavItem active={activeNav === 'dashboard'} icon={Home} onClick={() => setActiveNav('dashboard')}>Dashboard</NavItem>
          <NavItem active={activeNav === 'analytics'} icon={BarChart2} onClick={() => setActiveNav('analytics')}>Analytics</NavItem>
          <NavItem active={activeNav === 'team'} icon={Users} onClick={() => setActiveNav('team')}>Team</NavItem>
          <NavItem active={activeNav === 'globe'} icon={Globe} onClick={() => setActiveNav('globe')}>Global Traffic</NavItem>

          <span className="l-demo-nav-section">Infrastructure</span>
          <NavItem active={activeNav === 'database'} icon={Database} onClick={() => setActiveNav('database')}>Database</NavItem>
          <NavItem active={activeNav === 'cpu'} icon={Cpu} onClick={() => setActiveNav('cpu')}>Compute</NavItem>
          <NavItem active={activeNav === 'security'} icon={Shield} onClick={() => setActiveNav('security')}>
            Security
            <Badge variant="danger" style={{ marginLeft: 'auto', fontSize: '9px', padding: '1px 5px' }}>2</Badge>
          </NavItem>
          <NavItem active={activeNav === 'layers'} icon={Layers} onClick={() => setActiveNav('layers')}>Services</NavItem>

          <span className="l-demo-nav-section">Preferences</span>
          <NavItem icon={theme === 'dark' ? Sun : Moon} onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </NavItem>
          <NavItem active={activeNav === 'settings'} icon={Settings} onClick={() => setActiveNav('settings')}>Settings</NavItem>
        </nav>

        {/* User footer */}
        <div className="l-demo-user">
          <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Erica" size="sm" ring />
          <div className="l-demo-user-info">
            <div className="l-demo-user-name">Erica Wright</div>
            <div className="l-demo-user-role">Admin · Pro</div>
          </div>
          <Tooltip content="Sign out" position="right">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
              <LogOut size={14} />
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="l-demo-main">

        {/* ── HEADER ── */}
        <header className="l-demo-header">
          <Breadcrumbs items={['Organization', 'System Intel', 'Dashboard']} />

          <div className="l-demo-header-right">
            <Input
              variant="glass"
              icon={Search}
              placeholder="Search..."
              style={{ width: '220px', height: '34px' }}
            />

            <Tooltip content={theme === 'dark' ? 'Light mode' : 'Dark mode'} position="bottom">
              <button className="l-demo-icon-btn" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </Tooltip>

            <Tooltip content="Notifications" position="bottom">
              <button className="l-demo-icon-btn" onClick={() => addToast({ title: 'No new alerts', message: 'All systems nominal.', variant: 'info' })}>
                <Bell size={16} />
                <span className="l-demo-notif-dot" />
              </button>
            </Tooltip>

            <Dropdown
              trigger={
                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Erica" size="sm" ring style={{ cursor: 'pointer' }} />
              }
              align="right"
            >
              <DropdownItem icon={Settings}>Account Settings</DropdownItem>
              <DropdownItem icon={CreditCard}>Billing</DropdownItem>
              <DropdownDivider />
              <DropdownItem danger icon={LogOut}>Sign Out</DropdownItem>
            </Dropdown>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="l-demo-content">

          {/* Page title row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <h1 className="l-demo-page-title">Cloud Console</h1>
              <p className="l-demo-page-sub">Live infrastructure health · Lumina Core v2.4</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Tooltip content="Refresh metrics">
                <button className="l-demo-icon-btn" style={{ borderRadius: '8px', width: 'auto', padding: '0 12px', gap: '6px', display: 'flex', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }} onClick={handleRefresh}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </Tooltip>
              <Button variant="outline" size="sm" icon={Download}>Export</Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={handleDeploy}>Deploy</Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'network', label: 'Network' },
              { id: 'activity', label: 'Activity' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: '24px' }}
          />

          {/* Alert banner */}
          <Alert variant="warn" icon={AlertTriangle} style={{ marginBottom: '24px' }}>
            <span>Regional maintenance scheduled for <strong>EU-WEST-1</strong> — Sunday 02:00 UTC.</span>
            <Button variant="outline" size="sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>View Schedule</Button>
          </Alert>

          {/* ── STAT CARDS ── */}
          {loading ? (
            <div className="l-demo-stats">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="l-demo-stat">
                  <Skeleton width="40px" height="40px" circle />
                  <Skeleton width="50%" height="28px" style={{ marginTop: '4px' }} />
                  <Skeleton width="70%" height="12px" />
                </div>
              ))}
            </div>
          ) : (
            <div className="l-demo-stats animate-fade-in">
              {/* Stat 1 */}
              <div className="l-demo-stat">
                <div className="l-demo-stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                  <Shield size={18} />
                </div>
                <div>
                  <div className="l-demo-stat-value">99.9%</div>
                  <div className="l-demo-stat-label">Uptime SLA</div>
                </div>
                <div className="l-demo-stat-change l-demo-stat-up">
                  <ArrowUpRight size={12} /> +0.2% vs last week
                </div>
              </div>
              {/* Stat 2 */}
              <div className="l-demo-stat">
                <div className="l-demo-stat-icon" style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <div className="l-demo-stat-value">1.2ms</div>
                  <div className="l-demo-stat-label">Avg. Latency</div>
                </div>
                <div className="l-demo-stat-change l-demo-stat-up">
                  <ArrowUpRight size={12} /> 18% faster
                </div>
              </div>
              {/* Stat 3 */}
              <div className="l-demo-stat">
                <div className="l-demo-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}>
                  <Users size={18} />
                </div>
                <div>
                  <div className="l-demo-stat-value">42.5k</div>
                  <div className="l-demo-stat-label">Active Sessions</div>
                </div>
                <div className="l-demo-stat-change l-demo-stat-down">
                  <ArrowDownRight size={12} /> −3% from peak
                </div>
              </div>
              {/* Stat 4 */}
              <div className="l-demo-stat">
                <div className="l-demo-stat-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <Activity size={18} />
                </div>
                <div>
                  <div className="l-demo-stat-value">2.1 TB</div>
                  <div className="l-demo-stat-label">Data Processed</div>
                </div>
                <div className="l-demo-stat-change l-demo-stat-up">
                  <ArrowUpRight size={12} /> +12% this month
                </div>
              </div>
            </div>
          )}

          {/* ── BODY GRID ── */}
          <div className="l-demo-body">

            {/* ── LEFT COLUMN ── */}
            <div className="l-demo-body-left">

              {/* Traffic chart */}
              <Card style={{ padding: '20px' }}>
                <div className="l-demo-section-header">
                  <div className="l-demo-section-title">Request Volume</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Chip style={{ fontSize: '11px', padding: '3px 10px' }}>This Week</Chip>
                    <Dropdown trigger={<button className="l-demo-icon-btn" style={{ width: '28px', height: '28px' }}><MoreHorizontal size={14} /></button>} align="right">
                      <DropdownItem>Download CSV</DropdownItem>
                      <DropdownItem>Compare period</DropdownItem>
                    </Dropdown>
                  </div>
                </div>
                <div className="l-demo-chart">
                  {CHART_DATA.map((d, i) => (
                    <Tooltip key={i} content={`${d.value}k requests`} position="top">
                      <div
                        className={`l-demo-bar ${i === activeBar ? 'active' : ''}`}
                        style={{ height: `${(d.value / maxBar) * 100}%` }}
                        onClick={() => setActiveBar(i)}
                      />
                    </Tooltip>
                  ))}
                </div>
                <div className="l-demo-chart-labels">
                  {CHART_DATA.map((d, i) => (
                    <div key={i} className="l-demo-chart-label">{d.label}</div>
                  ))}
                </div>
              </Card>

              {/* Node table */}
              <div>
                <div className="l-demo-section-header">
                  <div className="l-demo-section-title">Node Status</div>
                  <Button variant="ghost" size="sm" icon={Filter}>Filter</Button>
                </div>
                <div className="l-demo-table-card">
                  <Table>
                    <thead>
                      <tr>
                        <th>Node ID</th>
                        <th>Region</th>
                        <th>CPU Load</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {NODES.map(node => (
                        <tr key={node.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{node.id}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{node.region}</td>
                          <td style={{ width: '140px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '4px', background: 'var(--surface-raised)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${node.load}%`, background: node.load > 75 ? 'var(--accent)' : node.load > 50 ? 'var(--warning)' : 'var(--secondary)', borderRadius: '4px', transition: 'width 0.4s' }} />
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--text-dim)', minWidth: '30px' }}>{node.load}%</span>
                            </div>
                          </td>
                          <td><Badge variant={node.status}>{node.label}</Badge></td>
                          <td>
                            <Dropdown trigger={<button className="l-demo-icon-btn" style={{ width: '28px', height: '28px' }}><MoreHorizontal size={14} /></button>} align="right">
                              <DropdownItem icon={Activity}>View Metrics</DropdownItem>
                              <DropdownItem icon={RefreshCw}>Restart</DropdownItem>
                              <DropdownDivider />
                              <DropdownItem danger icon={Trash2}>Terminate</DropdownItem>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Activity Feed */}
              <Card style={{ padding: '20px' }}>
                <div className="l-demo-section-header">
                  <div className="l-demo-section-title">Activity Feed</div>
                  <Badge variant="primary" style={{ fontSize: '10px' }}>Live</Badge>
                </div>
                <div className="l-demo-activity">
                  {ACTIVITY.map((item, i) => (
                    <div key={i} className="l-demo-activity-item">
                      <div className="l-demo-activity-dot" style={{ background: item.color }} />
                      <div className="l-demo-activity-text">{item.text}</div>
                      <div className="l-demo-activity-time">{item.time}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="l-demo-body-right">

              {/* System Resources */}
              <div className="l-demo-panel">
                <div className="l-demo-section-header" style={{ marginBottom: '16px' }}>
                  <div className="l-demo-section-title">Resources</div>
                  <Tooltip content="Refresh stats">
                    <button className="l-demo-icon-btn" style={{ width: '26px', height: '26px' }} onClick={handleRefresh}>
                      <RefreshCw size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="l-demo-metric">
                  <div className="l-demo-metric-label"><span><Cpu size={11} style={{ marginRight: 4 }} />CPU</span><span>78.4%</span></div>
                  <Progress value={78} />
                </div>
                <div className="l-demo-metric">
                  <div className="l-demo-metric-label"><span><HardDrive size={11} style={{ marginRight: 4 }} />Memory</span><span>61.2%</span></div>
                  <Progress value={61} variant="secondary" />
                </div>
                <div className="l-demo-metric">
                  <div className="l-demo-metric-label"><span><Database size={11} style={{ marginRight: 4 }} />Storage</span><span>43.0%</span></div>
                  <Progress value={43} />
                </div>
                <div className="l-demo-metric" style={{ marginBottom: 0 }}>
                  <div className="l-demo-metric-label"><span><Network size={11} style={{ marginRight: 4 }} />Bandwidth</span><span>92.1%</span></div>
                  <Progress value={92} striped />
                </div>
              </div>

              {/* Controls */}
              <div className="l-demo-panel">
                <div className="l-demo-section-title" style={{ marginBottom: '16px' }}>System Controls</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>Auto-Scaling</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Scale on load spike</div>
                    </div>
                    <Switch active={isSwitchOn} onChange={setIsSwitchOn} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>Auto Backup</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Every 6 hours</div>
                    </div>
                    <Switch active={isAutoBackup} onChange={setIsAutoBackup} />
                  </div>
                  <div style={{ height: '1px', background: 'var(--border)' }} />
                  <Checkbox label="Notify on scale event" defaultChecked />
                  <Checkbox label="Send weekly digest" />
                  <Checkbox label="Enable debug logs" />
                </div>
              </div>

              {/* Quick config accordion */}
              <div className="l-demo-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <Accordion items={[
                  { title: 'Advanced Config', content: 'Kernel parameters are optimized. Max connections: 10,000. Keep-alive: 75s.' },
                  { title: 'Environment', content: 'Runtime: Node 20 LTS · Region: us-east-1 · TLS 1.3 enforced.' },
                ]} />
              </div>

              {/* Team */}
              <div className="l-demo-panel">
                <div className="l-demo-section-header" style={{ marginBottom: '12px' }}>
                  <div className="l-demo-section-title">Active Team</div>
                  <Button variant="ghost" size="sm" icon={Plus} style={{ fontSize: '11px', padding: '4px 8px' }}>Add</Button>
                </div>
                {TEAM.map((member, i) => (
                  <div key={i} className="l-demo-team-item">
                    <Tooltip content={member.role} position="left">
                      <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}`} size="sm" />
                    </Tooltip>
                    <div className="l-demo-team-info">
                      <div className="l-demo-team-name">{member.name}</div>
                      <div className="l-demo-team-role">{member.role}</div>
                    </div>
                    <Badge variant={member.status} style={{ fontSize: '9px', padding: '1px 6px' }}>Online</Badge>
                  </div>
                ))}
              </div>

              {/* Danger zone */}
              <Button
                variant="danger"
                style={{ width: '100%' }}
                icon={Trash2}
                onClick={() => setIsModalOpen(true)}
              >
                Terminate Session
              </Button>

              <Button
                variant="outline"
                style={{ width: '100%' }}
                icon={Settings}
                onClick={() => setIsDrawerOpen(true)}
              >
                Quick Settings
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terminate Session"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => {
              setIsModalOpen(false);
              addToast({ title: 'Session Terminated', message: 'All connections closed.', variant: 'warning' });
            }}>Terminate</Button>
          </>
        }
      >
        <Alert variant="danger" icon={AlertTriangle} style={{ marginBottom: '20px' }}>
          This action cannot be undone.
        </Alert>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          Terminating the session will immediately close all active connections and stop running jobs.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Radio label="Save state and exit" name="termMode" defaultChecked />
          <Radio label="Exit immediately (discard state)" name="termMode" />
        </div>
      </Modal>

      {/* ── DRAWER ── */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Quick Settings"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>APPEARANCE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>Dark Mode</span>
              <Switch active={theme === 'dark'} onChange={() => toggleTheme()} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>NOTIFICATIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Checkbox label="Email alerts" defaultChecked />
              <Checkbox label="Slack integration" defaultChecked />
              <Checkbox label="SMS critical only" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>TAGS</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Chip icon={Shield}>Security</Chip>
              <Chip icon={Zap}>Performance</Chip>
              <Chip icon={Globe}>Global</Chip>
              <Chip icon={Database}>Storage</Chip>
            </div>
          </div>
          <Button variant="primary" style={{ width: '100%' }} onClick={() => {
            setIsDrawerOpen(false);
            addToast({ title: 'Settings Saved', message: 'Preferences updated successfully.', variant: 'success' });
          }}>
            Save Preferences
          </Button>
        </div>
      </Drawer>

    </div>
  );
};

export default Dashboard;
