import { useState } from 'react';
import {
  Button, Input, Badge, Card, Avatar,
  Alert, Progress, Skeleton, Tooltip,
  Tabs, Accordion, Breadcrumbs, NavItem,
  Checkbox, Switch, Radio, Modal, Chip,
  Navbar, NavbarBrand, NavbarActions,
  Table, List, ListItem,
  Dropdown, DropdownItem, DropdownDivider,
  Drawer, ToastProvider, useToast,
} from '../components/ui';
import '../styles/openui.css';

// ── Layout helpers ────────────────────────────────────────────────────────────

const LABEL = {
  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.28)', marginBottom: 8,
};
const ROW = { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' };
const COL = { display: 'flex', flexDirection: 'column', gap: 8 };

function Sect({ label, children, col, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <div style={LABEL}>{label}</div>}
      <div style={col ? COL : ROW}>{children}</div>
    </div>
  );
}

// ── Per-component preview functions ──────────────────────────────────────────

function PreviewButton() {
  return (
    <div style={COL}>
      <Sect label="Variants">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="neon">Neon</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="glass">Glass</Button>
      </Sect>
      <Sect label="Sizes">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
      </Sect>
      <Sect label="States">
        <Button variant="primary" loading>Loading</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </Sect>
    </div>
  );
}

function PreviewBadge() {
  return (
    <div style={COL}>
      <Sect label="Variants">
        <Badge variant="primary">Primary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="outline">Outline</Badge>
      </Sect>
    </div>
  );
}

function PreviewAlert() {
  return (
    <div style={COL}>
      <Sect label="Variants" col>
        <Alert variant="info">Informational alert message.</Alert>
        <Alert variant="success">Action completed successfully.</Alert>
        <Alert variant="warn">Please review before proceeding.</Alert>
        <Alert variant="danger">Something went wrong. Please try again.</Alert>
      </Sect>
    </div>
  );
}

function PreviewCard() {
  return (
    <div style={COL}>
      <Sect label="Variants">
        <Card style={{ padding: 20, minWidth: 160 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Default</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Surface container.</div>
        </Card>
        <Card className="ou-card-glass" style={{ padding: 20, minWidth: 160 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Glass</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Frosted glass.</div>
        </Card>
        <Card className="ou-card-hover" style={{ padding: 20, minWidth: 160 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Hover</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lifts on hover.</div>
        </Card>
        <Card className="ou-card-glow" style={{ padding: 20, minWidth: 160 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Glow</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Primary glow.</div>
        </Card>
      </Sect>
    </div>
  );
}

function PreviewAvatar() {
  return (
    <div style={COL}>
      <Sect label="Sizes">
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=alice" size="sm" alt="Alice" />
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=bob" size="md" alt="Bob" />
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=carol" size="lg" alt="Carol" />
      </Sect>
      <Sect label="Variants">
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=dave" alt="Dave" className="ou-avatar-ring" />
        <div className="ou-avatar-group">
          <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=a" alt="A" />
          <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=b" alt="B" />
          <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=c" alt="C" />
        </div>
      </Sect>
    </div>
  );
}

function PreviewInput() {
  return (
    <div style={{ ...COL, maxWidth: 340 }}>
      <Sect label="Types" col>
        <Input label="Email address" placeholder="user@example.com" type="email" />
        <Input label="Password" placeholder="••••••••" type="password" />
        <Input label="Search" placeholder="Search…" type="text" />
      </Sect>
      <Sect label="States" col>
        <Input label="With error" placeholder="Enter value" error="This field is required" />
        <Input label="Disabled" placeholder="Not editable" disabled />
      </Sect>
    </div>
  );
}

function PreviewProgress() {
  return (
    <div style={{ ...COL, maxWidth: 340 }}>
      <Sect label="Values" col>
        <Progress value={20} />
        <Progress value={50} />
        <Progress value={80} />
        <Progress value={100} />
      </Sect>
      <Sect label="Striped" col>
        <Progress value={65} striped />
      </Sect>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div style={COL}>
      <Sect label="Variants" col>
        <Skeleton variant="title" width={220} height={22} />
        <Skeleton variant="text" width={320} height={14} />
        <Skeleton variant="text" width={260} height={14} />
      </Sect>
      <Sect label="Circle">
        <Skeleton variant="circle" width={40} height={40} />
        <Skeleton variant="circle" width={52} height={52} />
        <Skeleton variant="circle" width={64} height={64} />
      </Sect>
      <Sect label="Card skeleton" col>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Skeleton variant="circle" width={44} height={44} />
          <div style={COL}>
            <Skeleton variant="text" width={140} height={14} />
            <Skeleton variant="text" width={100} height={12} />
          </div>
        </div>
      </Sect>
    </div>
  );
}

function PreviewTabs() {
  const [activeTab, setActiveTab] = useState('Overview');
  return (
    <div style={COL}>
      <Sect label="Default">
        <Tabs tabs={['Overview', 'Activity', 'Settings']} activeTab={activeTab} onChange={setActiveTab} />
      </Sect>
      <Sect label="More tabs">
        <Tabs tabs={['Dashboard', 'Reports', 'Users', 'Billing']} activeTab="Dashboard" onChange={() => {}} />
      </Sect>
    </div>
  );
}

function PreviewAccordion() {
  return (
    <Accordion items={[
      { title: 'System Health', content: 'All clusters operating at peak efficiency with zero downtime recorded in the last 30 days.' },
      { title: 'Network Status', content: 'Global latency is 1.2 ms across all nodes. No packet loss detected.' },
      { title: 'Security Audit', content: 'Last scan completed 2 hours ago. Zero critical vulnerabilities found.' },
      { title: 'Billing', content: 'Current plan: Pro. Next invoice due June 1, 2026 for $49/mo.' },
    ]} />
  );
}

function PreviewBreadcrumbs() {
  return (
    <div style={COL}>
      <Sect label="Short path">
        <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Settings' }]} />
      </Sect>
      <Sect label="Deep path">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '#' },
          { label: 'Settings', href: '#' },
          { label: 'Security', href: '#' },
          { label: 'Two-Factor Auth' },
        ]} />
      </Sect>
    </div>
  );
}

function PreviewNavItem() {
  const [active, setActive] = useState('dashboard');
  const items = ['Dashboard', 'Analytics', 'Projects', 'Settings', 'Help'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 200 }}>
      {items.map(item => (
        <NavItem
          key={item}
          active={active === item.toLowerCase()}
          onClick={() => setActive(item.toLowerCase())}
        >
          {item}
        </NavItem>
      ))}
    </div>
  );
}

function PreviewCheckbox() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);
  return (
    <div style={COL}>
      <Sect label="States" col>
        <Checkbox label="Enable notifications" checked={a} onChange={e => setA(e.target.checked)} />
        <Checkbox label="Two-factor authentication" checked={b} onChange={e => setB(e.target.checked)} />
        <Checkbox label="Marketing emails" checked={c} onChange={e => setC(e.target.checked)} />
        <Checkbox label="Disabled (checked)" checked={true} onChange={() => {}} disabled />
        <Checkbox label="Disabled (unchecked)" checked={false} onChange={() => {}} disabled />
      </Sect>
    </div>
  );
}

function PreviewSwitch() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);
  return (
    <div style={COL}>
      <Sect label="States" col>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch active={a} onChange={setA} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dark mode — {a ? 'on' : 'off'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch active={b} onChange={setB} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Beta features — {b ? 'on' : 'off'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch active={c} onChange={setC} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Email digest — {c ? 'on' : 'off'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch active={false} onChange={() => {}} disabled />
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Disabled</span>
        </div>
      </Sect>
    </div>
  );
}

function PreviewRadio() {
  const [plan, setPlan] = useState('monthly');
  const [size, setSize] = useState('md');
  return (
    <div style={COL}>
      <Sect label="Billing plan" col>
        {['monthly', 'annual', 'lifetime'].map(v => (
          <Radio key={v} name="plan" value={v} label={v.charAt(0).toUpperCase() + v.slice(1)} checked={plan === v} onChange={() => setPlan(v)} />
        ))}
      </Sect>
      <Sect label="Size" col>
        {['sm', 'md', 'lg'].map(v => (
          <Radio key={v} name="size" value={v} label={v.toUpperCase()} checked={size === v} onChange={() => setSize(v)} />
        ))}
      </Sect>
    </div>
  );
}

function PreviewChip() {
  return (
    <div style={COL}>
      <Sect label="Variants">
        <Chip>Default</Chip>
        <Chip className="ou-chip-primary">Primary</Chip>
        <Chip className="ou-chip-success">Success</Chip>
        <Chip className="ou-chip-warning">Warning</Chip>
        <Chip className="ou-chip-danger">Danger</Chip>
        <Chip className="ou-chip-outline">Outline</Chip>
      </Sect>
    </div>
  );
}

function PreviewModal() {
  const [open, setOpen] = useState(false);
  return (
    <div style={COL}>
      <Sect label="Trigger">
        <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
      </Sect>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm Action">
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
          Are you sure you want to proceed? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

function PreviewDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <div style={COL}>
      <Sect label="Trigger">
        <Button variant="outline" onClick={() => setOpen(true)}>Open Drawer</Button>
      </Sect>
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Side Panel">
        <div style={COL}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Side panel content goes here.</p>
          <Input label="Name" placeholder="Enter your name" />
          <div style={ROW}>
            <Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

function PreviewNavbar() {
  return (
    <div style={COL}>
      <Sect label="Default">
        <Navbar style={{ width: '100%' }}>
          <NavbarBrand>openUI</NavbarBrand>
          <NavbarActions>
            <Button variant="ghost" size="sm">Docs</Button>
            <Button variant="ghost" size="sm">Blog</Button>
            <Button variant="primary" size="sm">Sign in</Button>
          </NavbarActions>
        </Navbar>
      </Sect>
      <Sect label="Glass">
        <Navbar className="ou-navbar-glass" style={{ width: '100%' }}>
          <NavbarBrand>openUI</NavbarBrand>
          <NavbarActions>
            <Button variant="ghost" size="sm">Docs</Button>
            <Button variant="outline" size="sm">Sign in</Button>
          </NavbarActions>
        </Navbar>
      </Sect>
    </div>
  );
}

function PreviewDropdown() {
  return (
    <div style={COL}>
      <Sect label="Default">
        <Dropdown trigger={<Button variant="outline">Actions ▾</Button>}>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Duplicate</DropdownItem>
          <DropdownItem>Archive</DropdownItem>
          <DropdownDivider />
          <DropdownItem>Delete</DropdownItem>
        </Dropdown>
        <Dropdown trigger={<Button variant="ghost" size="sm">Options ▾</Button>}>
          <DropdownItem>Profile</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
          <DropdownDivider />
          <DropdownItem>Sign out</DropdownItem>
        </Dropdown>
      </Sect>
    </div>
  );
}

function PreviewTooltip() {
  return (
    <div style={COL}>
      <Sect label="Positions">
        <Tooltip content="Top tooltip" position="top">
          <Button variant="ghost" size="sm">Top</Button>
        </Tooltip>
        <Tooltip content="Bottom tooltip" position="bottom">
          <Button variant="ghost" size="sm">Bottom</Button>
        </Tooltip>
        <Tooltip content="Left tooltip" position="left">
          <Button variant="ghost" size="sm">Left</Button>
        </Tooltip>
        <Tooltip content="Right tooltip" position="right">
          <Button variant="ghost" size="sm">Right</Button>
        </Tooltip>
      </Sect>
      <Sect label="On other elements">
        <Tooltip content="A badge with a tooltip" position="top">
          <Badge variant="primary">Hover me</Badge>
        </Tooltip>
        <Tooltip content="Click to copy API key" position="top">
          <Button variant="outline" size="sm">sk-ant-api03-…</Button>
        </Tooltip>
      </Sect>
    </div>
  );
}

function PreviewTable() {
  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Team</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Sarah Chen</td>
          <td>Lead Engineer</td>
          <td>Platform</td>
          <td><Badge variant="success">Active</Badge></td>
        </tr>
        <tr>
          <td>Marcus Davis</td>
          <td>DevOps</td>
          <td>Infrastructure</td>
          <td><Badge variant="primary">Away</Badge></td>
        </tr>
        <tr>
          <td>Priya Patel</td>
          <td>Security</td>
          <td>Platform</td>
          <td><Badge variant="success">Active</Badge></td>
        </tr>
        <tr>
          <td>Jordan Lee</td>
          <td>Designer</td>
          <td>Product</td>
          <td><Badge variant="warning">Busy</Badge></td>
        </tr>
      </tbody>
    </Table>
  );
}

function PreviewList() {
  const [active, setActive] = useState(0);
  const items = ['API Gateway', 'Auth Service', 'Storage Cluster', 'CDN', 'Analytics'];
  return (
    <div style={COL}>
      <Sect label="Selectable list">
        <List style={{ width: 240 }}>
          {items.map((item, i) => (
            <ListItem
              key={i}
              className={active === i ? 'ou-list-item-active' : ''}
              onClick={() => setActive(i)}
              style={{ cursor: 'pointer' }}
            >
              {item}
            </ListItem>
          ))}
        </List>
      </Sect>
    </div>
  );
}

function PreviewToast() {
  const { addToast } = useToast();
  return (
    <div style={COL}>
      <Sect label="Types">
        <Button variant="secondary" size="sm" onClick={() => addToast({ type: 'success', title: 'Success', message: 'Operation completed successfully.' })}>
          Success
        </Button>
        <Button variant="outline" size="sm" onClick={() => addToast({ type: 'error', title: 'Error', message: 'Something went wrong.' })}>
          Error
        </Button>
        <Button variant="ghost" size="sm" onClick={() => addToast({ type: 'info', title: 'Info', message: 'Here is some information.' })}>
          Info
        </Button>
        <Button variant="ghost" size="sm" onClick={() => addToast({ type: 'warning', title: 'Warning', message: 'Please review before continuing.' })}>
          Warning
        </Button>
      </Sect>
    </div>
  );
}

// ── Component name → preview function map ─────────────────────────────────────

const RENDERS = {
  Button: PreviewButton,
  Badge: PreviewBadge,
  Alert: PreviewAlert,
  Card: PreviewCard,
  Avatar: PreviewAvatar,
  Input: PreviewInput,
  Progress: PreviewProgress,
  Skeleton: PreviewSkeleton,
  Tabs: PreviewTabs,
  Accordion: PreviewAccordion,
  Breadcrumbs: PreviewBreadcrumbs,
  NavItem: PreviewNavItem,
  Checkbox: PreviewCheckbox,
  Switch: PreviewSwitch,
  Radio: PreviewRadio,
  Chip: PreviewChip,
  Modal: PreviewModal,
  Drawer: PreviewDrawer,
  Navbar: PreviewNavbar,
  Dropdown: PreviewDropdown,
  Tooltip: PreviewTooltip,
  Table: PreviewTable,
  List: PreviewList,
  Toast: PreviewToast,
};

// ── Root ──────────────────────────────────────────────────────────────────────

function Showcase() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('preview');
  const Render = name ? RENDERS[name] : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font-sans)',
      padding: '20px 24px',
    }}>
      {Render ? (
        <>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-dim)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
          }}>
            {name}
          </div>
          <Render />
        </>
      ) : (
        <div style={{ opacity: 0.4, fontSize: 13 }}>
          No component selected. Pass <code>?preview=ComponentName</code>
        </div>
      )}
    </div>
  );
}

export default function ComponentShowcase() {
  return (
    <ToastProvider>
      <Showcase />
    </ToastProvider>
  );
}
