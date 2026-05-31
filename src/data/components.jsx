import { useState, useRef, useEffect } from 'react';
import {
  Zap, Download, Trash2, Mail, Lock, User,
  Search, Bell, Settings, Check, X, Info, AlertTriangle,
  Home, Code, Layers, ExternalLink, ChevronDown,
  ArrowRight, Eye, EyeOff,
  Shield, Terminal, LogOut,
  Plus, MoreHorizontal, Activity, Database,
  Globe, Package, RefreshCw, Copy,
  CreditCard, Filter, Cpu, Inbox
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
} from '@ui';

// ── Interactive demo wrappers ─────────────────────────────────────────────────

const CheckboxDemo = () => {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div className="flex-col" style={{ gap: '14px' }}>
      <Checkbox label="Stay signed in for 30 days" checked={a} onChange={e => setA(e.target.checked)} />
      <Checkbox label="Enable two-factor authentication" checked={b} onChange={e => setB(e.target.checked)} />
      <Checkbox label="Disabled option" checked={false} onChange={() => {}} disabled />
    </div>
  );
};

const SelectAllDemo = () => {
  const [items, setItems] = useState([true, false, true, false]);
  const masterRef = useRef(null);
  const allChecked = items.every(Boolean);
  const someChecked = items.some(Boolean) && !allChecked;

  useEffect(() => {
    if (masterRef.current) masterRef.current.indeterminate = someChecked;
  }, [someChecked]);

  const labels = ['API Gateway service', 'Authentication service', 'Storage cluster', 'CDN endpoints'];

  return (
    <div className="flex-col" style={{ gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        <input
          ref={masterRef}
          type="checkbox"
          checked={allChecked}
          onChange={e => setItems(items.map(() => e.target.checked))}
          style={{ width: '15px', height: '15px', accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
          {allChecked ? 'All selected' : someChecked ? `${items.filter(Boolean).length} of ${items.length} selected` : 'Select all'}
        </span>
        {someChecked || allChecked ? (
          <Badge variant="primary" style={{ marginLeft: 'auto' }}>{items.filter(Boolean).length} selected</Badge>
        ) : null}
      </div>
      {labels.map((label, i) => (
        <Checkbox
          key={i}
          label={label}
          checked={items[i]}
          onChange={e => setItems(items.map((v, j) => j === i ? e.target.checked : v))}
        />
      ))}
    </div>
  );
};

const RadioDemo = () => {
  const [val, setVal] = useState('production');
  return (
    <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
      <Radio label="Production" name="env" value="production" checked={val === 'production'} onChange={() => setVal('production')} />
      <Radio label="Staging" name="env" value="staging" checked={val === 'staging'} onChange={() => setVal('staging')} />
      <Radio label="Development" name="env" value="dev" checked={val === 'dev'} onChange={() => setVal('dev')} />
    </div>
  );
};

const RadioCardDemo = () => {
  const [plan, setPlan] = useState('pro');
  const plans = [
    { id: 'starter', name: 'Starter', price: '$9', features: '5 projects · 2 seats · 10 GB' },
    { id: 'pro', name: 'Pro', price: '$29', features: 'Unlimited projects · 10 seats · 100 GB' },
    { id: 'enterprise', name: 'Enterprise', price: '$99', features: 'Custom limits · SSO · SLA · Priority support' },
  ];
  return (
    <div className="flex-col" style={{ gap: '10px', width: '100%' }}>
      {plans.map(p => (
        <div
          key={p.id}
          onClick={() => setPlan(p.id)}
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            border: `2px solid ${plan === p.id ? 'var(--primary)' : 'var(--border)'}`,
            background: plan === p.id ? 'var(--primary-soft)' : 'var(--surface)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <Radio name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{p.name}</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: plan === p.id ? 'var(--primary)' : 'var(--text)', fontFamily: 'Outfit' }}>
                {p.price}<span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.features}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TabsDemo = () => {
  const [active, setActive] = useState('overview');
  return (
    <Tabs
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'security', label: 'Security' },
        { id: 'logs', label: 'Logs' },
      ]}
      activeTab={active}
      onChange={setActive}
    />
  );
};

const TabsContentDemo = () => {
  const [active, setActive] = useState('overview');
  const content = {
    overview: (
      <div className="flex-col" style={{ gap: '14px', padding: '16px 0 4px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[['24', 'Total Nodes'], ['21', 'Active'], ['3', 'Pending']].map(([val, label]) => (
            <div key={label} style={{ flex: 1, padding: '14px', background: 'var(--surface-raised)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', fontFamily: 'Outfit' }}>{val}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Cluster capacity</span><span>87%</span>
          </div>
          <Progress value={87} />
        </div>
      </div>
    ),
    security: (
      <div className="flex-col" style={{ gap: '10px', padding: '16px 0 4px' }}>
        <Alert variant="success" icon={Check}>Last security scan passed — 0 critical issues.</Alert>
        <Alert variant="warn" icon={AlertTriangle}>3 low-severity findings pending review.</Alert>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <Button size="sm" variant="primary" icon={Shield}>Run Scan</Button>
          <Button size="sm" variant="ghost">View Report</Button>
        </div>
      </div>
    ),
    logs: (
      <div style={{ fontFamily: 'monospace', fontSize: '12px', padding: '16px 0 4px', lineHeight: 2, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
        <div><span style={{ color: 'var(--secondary)' }}>12:04:01</span>  INFO   Deployment auth-v3 started</div>
        <div><span style={{ color: 'var(--primary)' }}>12:04:09</span>  WARN   High memory on node-7 (82%)</div>
        <div><span style={{ color: 'var(--secondary)' }}>12:04:22</span>  INFO   Health check passed (24/24)</div>
        <div><span style={{ color: 'var(--accent)' }}>12:04:31</span>  ERROR  Connection timeout on node-12</div>
      </div>
    ),
  };
  return (
    <div style={{ width: '100%' }}>
      <Tabs
        tabs={[{ id: 'overview', label: 'Overview' }, { id: 'security', label: 'Security' }, { id: 'logs', label: 'Logs' }]}
        activeTab={active}
        onChange={setActive}
      />
      {content[active]}
    </div>
  );
};

const SwitchDemo = () => {
  const [on, setOn] = useState(true);
  const [backup, setBackup] = useState(false);
  return (
    <div className="flex-col" style={{ gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Switch active={on} onChange={setOn} />
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{on ? 'Auto-scaling on' : 'Auto-scaling off'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Switch active={backup} onChange={setBackup} />
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{backup ? 'Auto-backup on' : 'Auto-backup off'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Switch active={true} disabled />
        <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Always enabled (locked)</span>
      </div>
    </div>
  );
};

const FeatureFlagsDemo = () => {
  const flags = [
    { id: 'dark', label: 'Dark mode', desc: 'System-wide dark theme' },
    { id: 'ai', label: 'AI suggestions', desc: 'Inline code completions' },
    { id: 'beta', label: 'Beta features', desc: 'Early access to new APIs' },
    { id: 'analytics', label: 'Analytics', desc: 'Usage reporting dashboard' },
  ];
  const [enabled, setEnabled] = useState({ dark: true, ai: true, beta: false, analytics: false });
  const toggle = (id) => setEnabled(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      {flags.map((f, i) => (
        <div
          key={f.id}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
            borderBottom: i < flags.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{f.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.desc}</div>
          </div>
          <Switch active={enabled[f.id]} onChange={() => toggle(f.id)} />
        </div>
      ))}
    </div>
  );
};

const ModalDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" icon={Shield} onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Verify Identity"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>Confirm Action</Button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'var(--accent-soft)', borderRadius: '12px', color: 'var(--accent)', marginBottom: '20px' }}>
          <Shield size={24} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
          A verification code has been sent to your primary device. Enter it below to proceed.
        </p>
      </Modal>
    </>
  );
};

const DeleteConfirmDemo = () => {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const confirm = () => { setDeleted(true); setOpen(false); setTimeout(() => setDeleted(false), 3000); };
  return (
    <>
      <div className="preview-row">
        <Button variant="danger" icon={Trash2} onClick={() => setOpen(true)}>Delete Cluster</Button>
        {deleted && <Badge variant="danger">Cluster deleted</Badge>}
      </div>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete Cluster?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={confirm}>Yes, Delete</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
          This will permanently destroy <strong style={{ color: 'var(--text)' }}>prod-cluster-07</strong> and all its data. This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

const ToastDemo = () => {
  const { addToast } = useToast();
  return (
    <div className="preview-row">
      <Button variant="primary" onClick={() => addToast({ title: 'System Updated', message: 'Version 2.4 is now live.', variant: 'success' })}>
        Success
      </Button>
      <Button variant="outline" onClick={() => addToast({ title: 'High Load', message: 'Cluster CPU at 88%.', variant: 'warning' })}>
        Warning
      </Button>
      <Button variant="ghost" onClick={() => addToast({ title: 'New deployment', message: 'auth-v3 is queued.', variant: 'info' })}>
        Info
      </Button>
      <Button variant="danger" onClick={() => addToast({ title: 'Node down', message: 'node-12 is unresponsive.', variant: 'error' })}>
        Error
      </Button>
    </div>
  );
};

const DrawerDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" icon={Settings} onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Quick Settings">
        <div className="flex-col" style={{ gap: '24px' }}>
          <div className="flex-col" style={{ gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Appearance</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>Dark Mode</span>
              <Switch active={true} onChange={() => {}} />
            </div>
          </div>
          <div className="flex-col" style={{ gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notifications</span>
            <Checkbox label="Email alerts" checked={true} onChange={() => {}} />
            <Checkbox label="Slack integration" checked={true} onChange={() => {}} />
            <Checkbox label="SMS critical only" checked={false} onChange={() => {}} />
          </div>
          <Button variant="primary" style={{ width: '100%' }}>Save Preferences</Button>
        </div>
      </Drawer>
    </>
  );
};

const NotificationsDrawerDemo = () => {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: 1, Icon: Shield, color: 'var(--secondary)', title: 'Security scan passed', time: '2m ago', read: false },
    { id: 2, Icon: AlertTriangle, color: 'var(--warning)', title: 'Node-7 memory at 82%', time: '14m ago', read: false },
    { id: 3, Icon: Check, color: 'var(--secondary)', title: 'auth-v3 deployed successfully', time: '1h ago', read: true },
    { id: 4, Icon: X, color: 'var(--accent)', title: 'node-12 connection timeout', time: '2h ago', read: true },
  ]);
  const unread = notifs.filter(n => !n.read).length;
  const markAll = () => setNotifs(notifs.map(n => ({ ...n, read: true })));

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button variant="outline" icon={Bell} onClick={() => setOpen(true)}>Notifications</Button>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--accent)', color: '#fff', fontSize: '10px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread}
          </span>
        )}
      </div>
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Notifications">
        <div className="flex-col" style={{ gap: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Badge variant={unread > 0 ? 'danger' : 'success'} dot>{unread > 0 ? `${unread} unread` : 'All caught up'}</Badge>
            {unread > 0 && <button onClick={markAll} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }}>Mark all read</button>}
          </div>
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => setNotifs(notifs.map(x => x.id === n.id ? { ...x, read: true } : x))}
              style={{
                display: 'flex', gap: '12px', padding: '12px 0',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer', opacity: n.read ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.color, flexShrink: 0 }}>
                <n.icon size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{n.time}</div>
              </div>
              {!n.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};

const ButtonLoadingDemo = () => {
  const [state, setState] = useState('idle');
  const handleDeploy = () => {
    setState('loading');
    setTimeout(() => setState('success'), 2000);
    setTimeout(() => setState('idle'), 4500);
  };
  return (
    <div className="flex-col" style={{ gap: '16px', alignItems: 'flex-start' }}>
      <Button
        variant={state === 'success' ? 'secondary' : 'neon'}
        icon={state === 'idle' ? Zap : undefined}
        loading={state === 'loading'}
        onClick={handleDeploy}
        disabled={state !== 'idle'}
      >
        {state === 'idle' && 'Deploy to Production'}
        {state === 'loading' && 'Deploying…'}
        {state === 'success' && '✓ Deployed Successfully'}
      </Button>
      <div className="preview-row">
        <Button variant="outline" loading>Syncing data…</Button>
        <Button variant="ghost" loading>Processing</Button>
        <Button variant="primary" size="sm" loading>Saving</Button>
      </div>
    </div>
  );
};

const ChipFilterDemo = () => {
  const [selected, setSelected] = useState(['all']);
  const filters = ['All', 'Frontend', 'Backend', 'DevOps', 'Security', 'Database'];

  const toggle = (f) => {
    const id = f.toLowerCase();
    if (id === 'all') { setSelected(['all']); return; }
    setSelected(prev => {
      const withoutAll = prev.filter(x => x !== 'all');
      if (withoutAll.includes(id)) {
        const next = withoutAll.filter(x => x !== id);
        return next.length ? next : ['all'];
      }
      return [...withoutAll, id];
    });
  };

  return (
    <div className="flex-col" style={{ gap: '16px' }}>
      <div className="preview-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {filters.map(f => {
          const id = f.toLowerCase();
          const active = selected.includes(id);
          return (
            <div
              key={f}
              onClick={() => toggle(f)}
              style={{
                padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                background: active ? 'var(--primary-soft)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              {f}
            </div>
          );
        })}
      </div>
      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
        Showing: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{selected.join(', ')}</span>
      </span>
    </div>
  );
};

const ProgressAnimateDemo = () => {
  const [values, setValues] = useState([0, 0, 0]);
  const [running, setRunning] = useState(false);
  const metrics = [
    { label: 'CPU Usage', variant: 'primary', striped: false, target: 78 },
    { label: 'Memory', variant: 'secondary', striped: false, target: 45 },
    { label: 'Bandwidth', variant: 'primary', striped: true, target: 92 },
  ];

  const animate = () => {
    setRunning(true);
    setValues([0, 0, 0]);
    setTimeout(() => setValues([metrics[0].target, 0, 0]), 150);
    setTimeout(() => setValues([metrics[0].target, metrics[1].target, 0]), 500);
    setTimeout(() => setValues([metrics[0].target, metrics[1].target, metrics[2].target]), 850);
    setTimeout(() => setRunning(false), 1100);
  };

  return (
    <div className="flex-col" style={{ gap: '20px', width: '100%' }}>
      <div className="flex-col" style={{ gap: '14px' }}>
        {metrics.map((m, i) => (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>{m.label}</span>
              <span style={{ color: values[i] ? 'var(--text)' : 'var(--text-dim)', fontWeight: 600 }}>{values[i]}%</span>
            </div>
            <Progress value={values[i]} variant={m.variant} striped={m.striped} />
          </div>
        ))}
      </div>
      <Button size="sm" variant="primary" icon={Activity} onClick={animate} disabled={running}>
        {running ? 'Loading…' : 'Animate'}
      </Button>
    </div>
  );
};

const InputPasswordDemo = () => {
  const [show, setShow] = useState(false);
  const [pw, setPw] = useState('my-secret-password');
  return (
    <div className="flex-col" style={{ width: '100%', maxWidth: '380px', gap: '20px' }}>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Password</label>
        <div style={{ position: 'relative' }}>
          <Input
            icon={Lock}
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Enter password…"
            style={{ paddingRight: '40px' }}
          />
          <button
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', padding: 0,
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email</label>
        <Input icon={Mail} defaultValue="invalid-email" error="Please enter a valid email address" />
      </div>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Search</label>
        <Input icon={Search} placeholder="Search services…" variant="glass" />
      </div>
    </div>
  );
};

const AlertDismissDemo = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, variant: 'success', icon: Check, msg: 'Deployment completed — auth-v3 is live.' },
    { id: 2, variant: 'warn', icon: AlertTriangle, msg: 'EU-WEST-1 maintenance in 30 minutes.' },
    { id: 3, variant: 'danger', icon: X, msg: 'Critical: node-12 is unresponsive.' },
  ]);
  const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
  const reset = () => setAlerts([
    { id: Date.now(), variant: 'success', icon: Check, msg: 'Deployment completed — auth-v3 is live.' },
    { id: Date.now() + 1, variant: 'warn', icon: AlertTriangle, msg: 'EU-WEST-1 maintenance in 30 minutes.' },
    { id: Date.now() + 2, variant: 'danger', icon: X, msg: 'Critical: node-12 is unresponsive.' },
  ]);
  return (
    <div className="flex-col" style={{ gap: '10px', width: '100%' }}>
      {alerts.length === 0
        ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>All alerts dismissed.</p>
            <Button size="sm" variant="outline" icon={RefreshCw} onClick={reset}>Reset</Button>
          </div>
        )
        : alerts.map(a => <Alert key={a.id} variant={a.variant} icon={a.icon} onClose={() => dismiss(a.id)}>{a.msg}</Alert>)
      }
    </div>
  );
};

const ListActionsDemo = () => {
  const initial = [
    { id: 1, Icon: Terminal, label: 'Terminal instance #882-X started' },
    { id: 2, Icon: Shield, label: 'Security scan — 0 issues found' },
    { id: 3, Icon: Code, label: 'Branch "auth-fix" merged to main' },
    { id: 4, Icon: Activity, label: 'CPU load normalized to 24%' },
  ];
  const [items, setItems] = useState(initial);
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div style={{ width: '100%', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Inbox size={24} style={{ color: 'var(--text-dim)', marginBottom: '8px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>No events</p>
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={() => setItems(initial)}>Reset</Button>
        </div>
      ) : items.map((item, i) => (
        <div
          key={item.id}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
            borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
            <item.Icon size={15} />
          </div>
          <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{item.label}</span>
          <button
            onClick={() => remove(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const NavBadgeDemo = () => {
  const [active, setActive] = useState('dashboard');
  const navItems = [
    { id: 'dashboard', Icon: Home, label: 'Dashboard', badge: null },
    { id: 'apps', Icon: Package, label: 'Applications', badge: '3' },
    { id: 'db', Icon: Database, label: 'Database', badge: null },
    { id: 'alerts', Icon: Bell, label: 'Alerts', badge: '12' },
    { id: 'settings', Icon: Settings, label: 'Settings', badge: null },
  ];
  return (
    <div style={{ width: '220px', background: 'var(--surface)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
      {navItems.map(item => (
        <div
          key={item.id}
          onClick={() => setActive(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '8px',
            cursor: 'pointer', marginBottom: '2px', transition: 'all 0.15s',
            background: active === item.id ? 'var(--primary-soft)' : 'transparent',
            color: active === item.id ? 'var(--primary)' : 'var(--text-muted)',
          }}
          onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = 'var(--surface-raised)'; }}
          onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent'; }}
        >
          <item.Icon size={16} />
          <span style={{ flex: 1, fontSize: '14px', fontWeight: active === item.id ? 600 : 400 }}>{item.label}</span>
          {item.badge && (
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px', minWidth: '18px', textAlign: 'center',
              background: active === item.id ? 'var(--primary)' : 'var(--surface-raised)',
              color: active === item.id ? '#fff' : 'var(--text-muted)',
            }}>
              {item.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const TableSelectDemo = () => {
  const [selected, setSelected] = useState(new Set());
  const services = [
    { id: 1, name: 'API Gateway', region: 'us-east-1', status: 'success', label: 'Healthy', uptime: '99.9%' },
    { id: 2, name: 'Auth Service', region: 'eu-west-1', status: 'warning', label: 'Degraded', uptime: '98.1%' },
    { id: 3, name: 'Storage', region: 'ap-south-1', status: 'primary', label: 'Stable', uptime: '100%' },
    { id: 4, name: 'CDN', region: 'us-west-2', status: 'success', label: 'Healthy', uptime: '99.97%' },
  ];
  const toggle = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = (e) => setSelected(e.target.checked ? new Set(services.map(s => s.id)) : new Set());

  return (
    <div>
      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', marginBottom: '8px', background: 'var(--primary-soft)', borderRadius: '10px', border: '1px solid var(--primary)' }}>
          <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>{selected.size} selected</span>
          <div style={{ flex: 1 }} />
          <Button size="sm" variant="outline" icon={Download}>Export</Button>
          <Button size="sm" variant="danger" icon={Trash2}>Delete</Button>
        </div>
      )}
      <Table>
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input type="checkbox" checked={selected.size === services.length} onChange={toggleAll} style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
            </th>
            <th>Service</th>
            <th>Region</th>
            <th>Status</th>
            <th>Uptime</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr
              key={s.id}
              onClick={() => toggle(s.id)}
              style={{ cursor: 'pointer', background: selected.has(s.id) ? 'var(--primary-soft)' : undefined }}
            >
              <td onClick={e => e.stopPropagation()}>
                <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
              </td>
              <td style={{ fontWeight: 500 }}>{s.name}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{s.region}</td>
              <td><Badge variant={s.status}>{s.label}</Badge></td>
              <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{s.uptime}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

// ── Component data ────────────────────────────────────────────────────────────

export const componentsData = [
  {
    id: 'accordions',
    name: 'Accordion',
    description: 'Collapsible sections for organizing dense content with a clean expand/collapse interaction.',
    classes: ['ou-accordion-group', 'ou-accordion', 'ou-accordion-open', 'ou-accordion-header', 'ou-accordion-content'],
    variants: [
      {
        name: 'Basic Sections',
        desc: 'Pass items with title and content string. One section is open at a time.',
        code: `import { Accordion } from './components/ui';

<Accordion
  items={[
    { title: 'System Health', content: 'All clusters operating at peak efficiency.' },
    { title: 'Network Status', content: 'Global latency is 1.2ms across all nodes.' },
    { title: 'Security Audit', content: 'Last scan completed 2 hours ago. No issues found.' },
  ]}
/>`,
        render: () => (
          <Accordion items={[
            { title: 'System Health', content: 'All clusters are operating at peak efficiency with zero downtime in the last 30 days.' },
            { title: 'Network Status', content: 'Global latency is currently 1.2ms across all nodes. No packet loss detected.' },
            { title: 'Security Audit', content: 'Last scan completed 2 hours ago. No vulnerabilities found.' },
          ]} />
        ),
      },
      {
        name: 'Rich JSX Content',
        desc: 'Content can be any JSX — progress bars, avatars, badges, or status lists.',
        code: `<Accordion
  items={[
    {
      title: 'API Usage This Month',
      content: (
        <div>
          <Progress value={68} />
          <Badge variant="warning">68% of limit</Badge>
        </div>
      ),
    },
    {
      title: 'Active Team',
      content: (
        <div className="ou-avatar-group">
          <Avatar src="/alice.png" size="sm" />
          <Avatar src="/bob.png" size="sm" />
        </div>
      ),
    },
  ]}
/>`,
        render: () => (
          <Accordion items={[
            {
              title: 'API Usage This Month',
              content: (
                <div style={{ paddingTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>4.2M / 6.2M requests</span>
                    <Badge variant="warning">68%</Badge>
                  </div>
                  <Progress value={68} />
                </div>
              ),
            },
            {
              title: 'Active Team Members',
              content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px' }}>
                  <div className="ou-avatar-group">
                    {['Alice', 'Bob', 'Carol', 'Dave'].map(n => (
                      <Avatar key={n} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n}`} size="sm" />
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>4 of 10 seats used</span>
                </div>
              ),
            },
            {
              title: 'Recent Deployments',
              content: (
                <div className="flex-col" style={{ gap: '8px', paddingTop: '8px' }}>
                  {[['auth-v3', 'success', 'Live'], ['dashboard', 'warning', 'Staged'], ['api-gateway', 'primary', 'Building']].map(([name, v, label]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)', fontFamily: 'monospace' }}>{name}</span>
                      <Badge variant={v}>{label}</Badge>
                    </div>
                  ))}
                </div>
              ),
            },
          ]} />
        ),
      },
    ],
  },

  {
    id: 'alerts',
    name: 'Alert',
    description: 'Contextual feedback messages for success, warnings, errors, and general info.',
    classes: ['ou-alert', 'ou-alert-info', 'ou-alert-success', 'ou-alert-warn', 'ou-alert-danger', 'ou-alert-glass'],
    variants: [
      {
        name: 'Contextual Variants',
        desc: 'Use variant to convey intent. Pass an icon for visual reinforcement.',
        code: `import { Alert } from './components/ui';
import { Info, Check, AlertTriangle } from 'lucide-react';

<Alert variant="info" icon={Info}>Version 2.4 is installing…</Alert>
<Alert variant="success" icon={Check}>Deployment completed.</Alert>
<Alert variant="warn" icon={AlertTriangle}>Maintenance in 30 minutes.</Alert>
<Alert variant="danger" icon={AlertTriangle}>Critical failure detected.</Alert>`,
        render: () => (
          <div className="flex-col" style={{ width: '100%', gap: '12px' }}>
            <Alert variant="info" icon={Info}>Version 2.4 update is now installing…</Alert>
            <Alert variant="success" icon={Check}>Deployment to production completed successfully.</Alert>
            <Alert variant="warn" icon={AlertTriangle}>EU-WEST-1 maintenance window starts in 30 minutes.</Alert>
            <Alert variant="danger" icon={AlertTriangle}>Critical failure detected in regional cluster.</Alert>
          </div>
        ),
      },
      {
        name: 'Dismissible Alerts',
        desc: 'Pass onClose to render a dismiss button. Click to remove each alert.',
        code: `const [alerts, setAlerts] = useState([...]);
const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

<Alert variant="success" icon={Check} onClose={() => dismiss(1)}>
  Deployment completed successfully.
</Alert>`,
        render: () => <AlertDismissDemo />,
      },
      {
        name: 'Glass Variant',
        desc: 'Glass variant with blur backdrop for overlays and banners.',
        code: `<Alert glass icon={Bell} onClose={() => {}}>
  You have a new message from the security team.
</Alert>`,
        render: () => (
          <Alert glass icon={Bell} onClose={() => {}}>
            You have a new message from the security team.
          </Alert>
        ),
      },
    ],
  },

  {
    id: 'avatars',
    name: 'Avatar',
    description: 'User and organization image representations with size and ring variants.',
    classes: ['ou-avatar', 'ou-avatar-ring', 'ou-avatar-sm', 'ou-avatar-md', 'ou-avatar-lg', 'ou-avatar-xl', 'ou-avatar-group'],
    variants: [
      {
        name: 'Sizes & Ring',
        desc: 'Four sizes: sm (32px), md (40px), lg (56px), xl (80px). ring adds a primary-colored border.',
        code: `import { Avatar } from './components/ui';

<Avatar src="/user.png" size="sm" />
<Avatar src="/user.png" size="md" ring />
<Avatar src="/user.png" size="lg" />
<Avatar src="/user.png" size="xl" ring />`,
        render: () => (
          <div className="preview-row align-center">
            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" size="sm" />
            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" size="md" ring />
            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carol" size="lg" />
            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dave" size="xl" ring />
          </div>
        ),
      },
      {
        name: 'Avatar Group',
        desc: 'Stack avatars with overlapping offset using the ou-avatar-group CSS class.',
        code: `<div className="ou-avatar-group">
  <Avatar src="/alice.png" size="md" />
  <Avatar src="/bob.png" size="md" />
  <Avatar src="/carol.png" size="md" />
  <Avatar src="/dave.png" size="md" />
</div>`,
        render: () => (
          <div className="flex-col" style={{ gap: '20px', alignItems: 'flex-start' }}>
            <div className="ou-avatar-group">
              {['Eve', 'Frank', 'Grace', 'Hank', 'Iris'].map(seed => (
                <Avatar key={seed} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} size="md" />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="ou-avatar-group">
                {['Jade', 'Karl', 'Luna'].map(seed => (
                  <Avatar key={seed} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} size="sm" />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>+8 contributors</span>
            </div>
          </div>
        ),
      },
    ],
  },

  {
    id: 'badges',
    name: 'Badge',
    description: 'Compact labels for status, categories, and counts.',
    classes: ['ou-badge', 'ou-badge-primary', 'ou-badge-success', 'ou-badge-warning', 'ou-badge-danger', 'ou-badge-outline', 'ou-badge-glass'],
    variants: [
      {
        name: 'Status Variants',
        desc: 'Six variants for different semantic meanings.',
        code: `import { Badge } from './components/ui';

<Badge variant="primary">New Feature</Badge>
<Badge variant="success">Online</Badge>
<Badge variant="warning">Degraded</Badge>
<Badge variant="danger">High Load</Badge>
<Badge variant="outline">Experimental</Badge>
<Badge variant="glass">Beta</Badge>`,
        render: () => (
          <div className="preview-row" style={{ flexWrap: 'wrap' }}>
            <Badge variant="primary">New Feature</Badge>
            <Badge variant="success">Online</Badge>
            <Badge variant="warning">Degraded</Badge>
            <Badge variant="danger">High Load</Badge>
            <Badge variant="outline">Experimental</Badge>
            <Badge variant="glass">Beta</Badge>
          </div>
        ),
      },
      {
        name: 'Dot Indicator',
        desc: 'Add dot prop for a live pulsing indicator dot before the label.',
        code: `<Badge variant="success" dot>Active</Badge>
<Badge variant="warning" dot>Pending</Badge>
<Badge variant="danger" dot>Offline</Badge>`,
        render: () => (
          <div className="preview-row">
            <Badge variant="success" dot>Active</Badge>
            <Badge variant="warning" dot>Pending</Badge>
            <Badge variant="danger" dot>Offline</Badge>
            <Badge variant="primary" dot>Deploying</Badge>
          </div>
        ),
      },
    ],
  },

  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    description: 'Path navigation for deep hierarchies.',
    classes: ['ou-breadcrumbs', 'ou-breadcrumb-item', 'ou-breadcrumb-active'],
    variants: [
      {
        name: 'Navigation Trail',
        desc: 'Pass strings or { label, href } objects. The last item is rendered as the active crumb.',
        code: `import { Breadcrumbs } from './components/ui';

// Strings only
<Breadcrumbs items={['Organization', 'Infrastructure', 'Nodes']} />

// With links
<Breadcrumbs
  items={[
    { label: 'Dashboard', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Security' },
  ]}
/>`,
        render: () => (
          <div className="flex-col" style={{ gap: '20px' }}>
            <Breadcrumbs items={['Organization', 'Infrastructure', 'Nodes']} />
            <Breadcrumbs
              items={[
                { label: 'Dashboard', href: '#' },
                { label: 'Settings', href: '#' },
                { label: 'Security' },
              ]}
            />
            <Breadcrumbs
              items={[
                { label: 'Clusters', href: '#' },
                { label: 'prod-cluster-07', href: '#' },
                { label: 'Workloads', href: '#' },
                { label: 'api-gateway-deployment' },
              ]}
            />
          </div>
        ),
      },
    ],
  },

  {
    id: 'buttons',
    name: 'Button',
    description: 'A flexible button with variants for every action context — from subtle to high-emphasis.',
    classes: ['ou-btn', 'ou-btn-primary', 'ou-btn-secondary', 'ou-btn-outline', 'ou-btn-ghost', 'ou-btn-glass', 'ou-btn-neon', 'ou-btn-danger'],
    variants: [
      {
        name: 'Core Variants',
        desc: 'Choose variant based on action hierarchy.',
        code: `import { Button } from './components/ui';

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>`,
        render: () => (
          <div className="preview-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        ),
      },
      {
        name: 'Premium & Destructive',
        desc: 'High-emphasis variants for key CTAs and destructive actions.',
        code: `<Button variant="neon" icon={Zap}>Deploy</Button>
<Button variant="glass">Glass Action</Button>
<Button variant="danger" icon={Trash2}>Delete Cluster</Button>`,
        render: () => (
          <div className="preview-row">
            <Button variant="neon" icon={Zap}>Deploy</Button>
            <Button variant="glass">Glass Action</Button>
            <Button variant="danger" icon={Trash2}>Delete</Button>
          </div>
        ),
      },
      {
        name: 'Sizes & Icons',
        desc: 'Three sizes. Use icon prop to prepend a Lucide icon.',
        code: `<Button variant="primary" size="sm" icon={Plus}>Add Node</Button>
<Button variant="primary" size="md" icon={Download}>Export</Button>
<Button variant="primary" size="lg" icon={Zap}>Get Started</Button>`,
        render: () => (
          <div className="preview-row align-center">
            <Button variant="primary" size="sm" icon={Plus}>Add Node</Button>
            <Button variant="primary" size="md" icon={Download}>Export</Button>
            <Button variant="primary" size="lg" icon={Zap}>Get Started</Button>
          </div>
        ),
      },
      {
        name: 'Loading State',
        desc: 'Pass loading to show a spinner and disable the button. Click "Deploy" to see the full cycle.',
        code: `import { Button } from './components/ui';

// Static loading buttons
<Button variant="outline" loading>Syncing data…</Button>
<Button variant="ghost" loading>Processing</Button>

// Deploy cycle example
const [state, setState] = useState('idle');
const handleDeploy = () => {
  setState('loading');
  setTimeout(() => setState('success'), 2000);
  setTimeout(() => setState('idle'), 4500);
};

<Button
  variant={state === 'success' ? 'secondary' : 'neon'}
  loading={state === 'loading'}
  onClick={handleDeploy}
  disabled={state !== 'idle'}
>
  {state === 'idle' && 'Deploy to Production'}
  {state === 'loading' && 'Deploying…'}
  {state === 'success' && '✓ Deployed'}
</Button>`,
        render: () => <ButtonLoadingDemo />,
      },
    ],
  },

  {
    id: 'cards',
    name: 'Card',
    description: 'Foundational container for grouping related content and actions.',
    classes: ['ou-card', 'ou-card-glass', 'ou-card-hover', 'ou-card-glow'],
    variants: [
      {
        name: 'Surface Types',
        desc: 'Default, glassmorphism, and hover-elevated variants.',
        code: `import { Card } from './components/ui';

// Hover elevation
<Card hover>
  <h4>Interactive Card</h4>
  <p>Lifts on hover with shadow.</p>
</Card>

// Glassmorphism
<Card variant="glass">
  <h4>Glass</h4>
  <p>Frosted backdrop-filter surface.</p>
</Card>`,
        render: () => (
          <div className="preview-grid-2">
            <Card hover style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '15px' }}>Interactive Card</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
                Hover to see elevation and shadow effect.
              </p>
            </Card>
            <Card variant="glass" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '15px' }}>Glassmorphism</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
                Frosted glass background with blur backdrop.
              </p>
            </Card>
          </div>
        ),
      },
      {
        name: 'Feature Card',
        desc: 'Cards with icon headers, stats, and call-to-action buttons.',
        code: `<Card hover style={{ padding: '24px' }}>
  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
    <Cpu size={20} />
  </div>
  <h4>Auto-Scaling</h4>
  <p>Automatically adjusts compute based on traffic load.</p>
  <Button variant="ghost" size="sm" icon={ArrowRight}>Learn more</Button>
</Card>`,
        render: () => (
          <div className="preview-grid-2">
            {[
              { Icon: Cpu, title: 'Auto-Scaling', desc: 'Adjusts compute based on traffic automatically.', color: 'var(--primary)', bg: 'var(--primary-soft)' },
              { Icon: Shield, title: 'DDoS Shield', desc: 'Always-on protection against network attacks.', color: 'var(--secondary)', bg: 'var(--secondary-soft)' },
              { Icon: Globe, title: 'Global CDN', desc: '200+ edge nodes for sub-10ms delivery worldwide.', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
              { Icon: Database, title: 'Managed DB', desc: 'Zero-config PostgreSQL with daily snapshots.', color: 'var(--accent)', bg: 'var(--accent-soft)' },
            ].map(({ Icon, title, desc, color, bg }) => (
              <Card key={title} hover style={{ padding: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: '14px' }}>
                  <Icon size={20} />
                </div>
                <h4 style={{ fontSize: '14px', marginBottom: '6px' }}>{title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5, marginBottom: '14px' }}>{desc}</p>
                <Button variant="ghost" size="sm" icon={ArrowRight}>Learn more</Button>
              </Card>
            ))}
          </div>
        ),
      },
    ],
  },

  {
    id: 'checkboxes',
    name: 'Checkbox',
    description: 'Controlled checkbox for multi-selection and boolean settings.',
    classes: ['ou-checkbox-container', 'ou-checkbox-input', 'ou-disabled'],
    variants: [
      {
        name: 'Controlled Checkboxes',
        desc: 'Use checked + onChange for controlled state. Disable to lock an option.',
        code: `import { Checkbox } from './components/ui';
import { useState } from 'react';

const [checked, setChecked] = useState(true);

<Checkbox
  label="Stay signed in for 30 days"
  checked={checked}
  onChange={e => setChecked(e.target.checked)}
/>
<Checkbox label="Disabled option" checked={false} onChange={() => {}} disabled />`,
        render: () => <CheckboxDemo />,
      },
      {
        name: 'Select All (Indeterminate)',
        desc: 'Master checkbox uses the native indeterminate state when only some items are selected.',
        code: `const masterRef = useRef(null);
const allChecked = items.every(Boolean);
const someChecked = items.some(Boolean) && !allChecked;

useEffect(() => {
  if (masterRef.current) masterRef.current.indeterminate = someChecked;
}, [someChecked]);

<input ref={masterRef} type="checkbox" checked={allChecked} onChange={toggleAll} />`,
        render: () => <SelectAllDemo />,
      },
    ],
  },

  {
    id: 'chips',
    name: 'Chip',
    description: 'Compact interactive tags for filters, metadata, and selections.',
    classes: ['ou-chip', 'ou-chip-icon'],
    variants: [
      {
        name: 'Tag Variants',
        desc: 'Use icon prop for a leading icon. onDelete renders a dismiss button.',
        code: `import { Chip } from './components/ui';
import { Layers, Zap, Shield } from 'lucide-react';

<Chip>Metadata</Chip>
<Chip icon={Layers}>Components</Chip>
<Chip icon={Zap} onDelete={() => removeTag('performance')}>Performance</Chip>`,
        render: () => (
          <div className="preview-row" style={{ flexWrap: 'wrap' }}>
            <Chip>Metadata</Chip>
            <Chip icon={Layers}>Components</Chip>
            <Chip icon={Shield}>Security</Chip>
            <Chip icon={Zap} onDelete={() => {}}>Performance</Chip>
            <Chip icon={Globe} onDelete={() => {}}>Global</Chip>
          </div>
        ),
      },
      {
        name: 'Filter Chips',
        desc: 'Toggle-style filter chips — click to activate or deactivate categories.',
        code: `const [selected, setSelected] = useState(['all']);

const toggle = (f) => {
  if (f === 'all') { setSelected(['all']); return; }
  setSelected(prev => {
    const withoutAll = prev.filter(x => x !== 'all');
    if (withoutAll.includes(f)) {
      const next = withoutAll.filter(x => x !== f);
      return next.length ? next : ['all'];
    }
    return [...withoutAll, f];
  });
};`,
        render: () => <ChipFilterDemo />,
      },
    ],
  },

  {
    id: 'drawers',
    name: 'Drawer',
    description: 'Slide-out side panel for settings, detail views, and auxiliary content.',
    classes: ['ou-drawer', 'ou-drawer-overlay', 'ou-drawer-header', 'ou-drawer-content'],
    variants: [
      {
        name: 'Settings Panel',
        desc: 'Controlled with isOpen + onClose. Slides in from the right with a backdrop overlay.',
        code: `import { Drawer, Button, Switch, Checkbox } from './components/ui';
import { useState } from 'react';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Settings</Button>

<Drawer isOpen={open} onClose={() => setOpen(false)} title="Quick Settings">
  <Switch active={true} onChange={() => {}} />
  <Checkbox label="Email alerts" checked={true} onChange={() => {}} />
</Drawer>`,
        render: () => <DrawerDemo />,
      },
      {
        name: 'Notifications Panel',
        desc: 'Real-world example: a notification drawer with unread state and mark-as-read.',
        code: `const [notifs, setNotifs] = useState([...]);
const markAll = () => setNotifs(notifs.map(n => ({ ...n, read: true })));

// Click a notification to mark it read
<Drawer isOpen={open} onClose={() => setOpen(false)} title="Notifications">
  {notifs.map(n => (
    <div key={n.id} onClick={() => markAsRead(n.id)}>
      {!n.read && <Badge variant="primary">New</Badge>}
      <span>{n.title}</span>
    </div>
  ))}
</Drawer>`,
        render: () => <NotificationsDrawerDemo />,
      },
    ],
  },

  {
    id: 'dropdowns',
    name: 'Dropdown',
    description: 'Overlay action menus triggered by any element.',
    classes: ['ou-dropdown', 'ou-dropdown-menu', 'ou-dropdown-item', 'ou-dropdown-item-danger'],
    variants: [
      {
        name: 'Action Menu',
        desc: 'Pass any element as trigger. Use danger on DropdownItem for destructive actions.',
        code: `import { Dropdown, DropdownItem, DropdownDivider } from './components/ui';
import { User, Settings, LogOut } from 'lucide-react';

<Dropdown trigger={<Button variant="primary">Actions</Button>}>
  <DropdownItem icon={User}>Profile Settings</DropdownItem>
  <DropdownItem icon={Settings}>Security</DropdownItem>
  <DropdownDivider />
  <DropdownItem danger icon={LogOut}>Sign Out</DropdownItem>
</Dropdown>`,
        render: () => (
          <div className="preview-row">
            <Dropdown trigger={<Button variant="primary">Actions <ChevronDown size={14} /></Button>}>
              <DropdownItem icon={User}>Profile Settings</DropdownItem>
              <DropdownItem icon={Settings}>Security</DropdownItem>
              <DropdownItem icon={Activity}>View Logs</DropdownItem>
              <DropdownDivider />
              <DropdownItem danger icon={LogOut}>Sign Out</DropdownItem>
            </Dropdown>

            <Dropdown trigger={<Button variant="ghost" icon={MoreHorizontal} />} align="right">
              <DropdownItem icon={Copy}>Duplicate</DropdownItem>
              <DropdownItem icon={ExternalLink}>Open in new tab</DropdownItem>
              <DropdownDivider />
              <DropdownItem danger icon={Trash2}>Delete</DropdownItem>
            </Dropdown>
          </div>
        ),
      },
      {
        name: 'User Profile Menu',
        desc: 'Custom trigger element — any component works as the dropdown anchor.',
        code: `<Dropdown
  align="right"
  trigger={
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <Avatar src="/user.png" size="sm" ring />
      <span>Alex Kim</span>
      <ChevronDown size={14} />
    </div>
  }
>
  <DropdownItem icon={User}>My Profile</DropdownItem>
  <DropdownItem icon={CreditCard}>Billing</DropdownItem>
  <DropdownDivider />
  <DropdownItem danger icon={LogOut}>Log Out</DropdownItem>
</Dropdown>`,
        render: () => (
          <div className="preview-row">
            <Dropdown
              align="right"
              trigger={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" size="sm" />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Alex Kim</span>
                  <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                </div>
              }
            >
              <DropdownItem icon={User}>My Profile</DropdownItem>
              <DropdownItem icon={Settings}>Account Settings</DropdownItem>
              <DropdownItem icon={CreditCard}>Billing & Plans</DropdownItem>
              <DropdownDivider />
              <DropdownItem danger icon={LogOut}>Log Out</DropdownItem>
            </Dropdown>
          </div>
        ),
      },
    ],
  },

  {
    id: 'inputs',
    name: 'Input',
    description: 'Text input with icon, error, and glass variants.',
    classes: ['ou-input', 'ou-input-glass', 'ou-input-error', 'ou-input-icon-wrapper'],
    variants: [
      {
        name: 'Input States',
        desc: 'Pass icon for a leading icon. Use error for validation. variant="glass" for frosted style.',
        code: `import { Input } from './components/ui';
import { User, Search, Mail } from 'lucide-react';

<Input placeholder="Username…" />
<Input icon={Search} placeholder="Search…" />
<Input icon={Mail} defaultValue="bad-email" error="Invalid email address" />
<Input variant="glass" placeholder="Glass input…" />`,
        render: () => (
          <div className="flex-col" style={{ width: '100%', maxWidth: '380px', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Username</label>
              <Input icon={User} placeholder="Enter username…" />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Search</label>
              <Input icon={Search} placeholder="Search anything…" />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email (error)</label>
              <Input icon={Mail} defaultValue="not-an-email" error="Invalid email address" />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Glass Variant</label>
              <Input variant="glass" placeholder="Glass input…" />
            </div>
          </div>
        ),
      },
      {
        name: 'Password Reveal',
        desc: 'Position an eye-toggle button inside the input using relative/absolute positioning.',
        code: `const [show, setShow] = useState(false);

<div style={{ position: 'relative' }}>
  <Input
    icon={Lock}
    type={show ? 'text' : 'password'}
    value={password}
    onChange={e => setPassword(e.target.value)}
    style={{ paddingRight: '40px' }}
  />
  <button
    onClick={() => setShow(s => !s)}
    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
  >
    {show ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
</div>`,
        render: () => <InputPasswordDemo />,
      },
    ],
  },

  {
    id: 'lists',
    name: 'List',
    description: 'Vertical item stack with icon and action support.',
    classes: ['ou-list', 'ou-list-item'],
    variants: [
      {
        name: 'Vertical Stack',
        desc: 'Wrap ListItem components inside List. Pass icon for a leading icon.',
        code: `import { List, ListItem } from './components/ui';
import { Terminal, Shield, Code, Activity } from 'lucide-react';

<List>
  <ListItem icon={Terminal}>Terminal instance #882-X started</ListItem>
  <ListItem icon={Shield}>Security scan — 0 issues found</ListItem>
  <ListItem icon={Code}>Branch "auth-fix" merged to main</ListItem>
</List>`,
        render: () => (
          <div style={{ width: '100%', background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <List>
              <ListItem icon={Terminal}>Terminal instance #882-X started</ListItem>
              <ListItem icon={Shield}>Security scan completed — 0 issues</ListItem>
              <ListItem icon={Code}>Branch "auth-fix" merged to main</ListItem>
              <ListItem icon={Activity}>CPU load normalized to 24%</ListItem>
            </List>
          </div>
        ),
      },
      {
        name: 'Dismissible Items',
        desc: 'Custom list with remove buttons — click the × to dismiss any event.',
        code: `const [items, setItems] = useState([...]);
const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

{items.map(item => (
  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
    <item.Icon size={15} />
    <span style={{ flex: 1 }}>{item.label}</span>
    <button onClick={() => remove(item.id)}><X size={14} /></button>
  </div>
))}`,
        render: () => <ListActionsDemo />,
      },
    ],
  },

  {
    id: 'modals',
    name: 'Modal',
    description: 'Focused overlay dialogs with header, scrollable body, and footer actions.',
    classes: ['ou-modal-overlay', 'ou-modal', 'ou-modal-header', 'ou-modal-content', 'ou-modal-footer'],
    variants: [
      {
        name: 'Overlay Dialog',
        desc: 'Controlled with isOpen + onClose. Use footer prop for action buttons.',
        code: `import { Modal, Button } from './components/ui';
import { useState } from 'react';

const [open, setOpen] = useState(false);

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Verify Identity"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={() => setOpen(false)}>Confirm</Button>
    </>
  }
>
  <p>Confirm this action to proceed.</p>
</Modal>`,
        render: () => <ModalDemo />,
      },
      {
        name: 'Delete Confirmation',
        desc: 'Destructive action pattern — always confirm before deleting irreversible data.',
        code: `<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Delete Cluster?"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" icon={Trash2} onClick={confirmDelete}>
        Yes, Delete
      </Button>
    </>
  }
>
  <p>
    This will permanently destroy{' '}
    <strong>prod-cluster-07</strong> and all its data.
  </p>
</Modal>`,
        render: () => <DeleteConfirmDemo />,
      },
    ],
  },

  {
    id: 'navbar',
    name: 'Navbar',
    description: 'Flexible header component for navigation, search, and brand identity.',
    classes: ['ou-navbar', 'ou-navbar-glass', 'ou-navbar-sticky', 'ou-navbar-brand', 'ou-navbar-actions'],
    variants: [
      {
        name: 'Standard & Glass',
        desc: 'NavbarBrand for left content, NavbarActions for right. Set variant="glass" for blur.',
        code: `import { Navbar, NavbarBrand, NavbarActions, Button, Input } from './components/ui';

// Default
<Navbar>
  <NavbarBrand>openUI</NavbarBrand>
  <NavbarActions>
    <Button variant="ghost" size="sm">Docs</Button>
    <Button variant="primary" size="sm">Get Started</Button>
  </NavbarActions>
</Navbar>

// Glass
<Navbar variant="glass" sticky>
  <NavbarBrand>…</NavbarBrand>
  <NavbarActions>
    <Input variant="glass" icon={Search} placeholder="Search…" />
  </NavbarActions>
</Navbar>`,
        render: () => (
          <div className="flex-col" style={{ width: '100%', gap: '20px' }}>
            <Navbar style={{ borderRadius: '10px', position: 'relative' }}>
              <NavbarBrand>
                <div className="logo-sq" style={{ width: '28px', height: '28px', fontSize: '13px' }}>L</div>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>openUI</span>
              </NavbarBrand>
              <NavbarActions>
                <Button variant="ghost" size="sm">Docs</Button>
                <Button variant="primary" size="sm">Get Started</Button>
              </NavbarActions>
            </Navbar>
            <Navbar variant="glass" style={{ borderRadius: '10px', position: 'relative' }}>
              <NavbarBrand>
                <Breadcrumbs items={['App', 'Dashboard', 'Analytics']} />
              </NavbarBrand>
              <NavbarActions>
                <Input variant="glass" icon={Search} placeholder="Search…" style={{ width: '200px', height: '34px' }} />
                <Tooltip content="Notifications" position="bottom">
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Bell size={18} />
                  </button>
                </Tooltip>
                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nav" size="sm" ring />
              </NavbarActions>
            </Navbar>
          </div>
        ),
      },
    ],
  },

  {
    id: 'navigation',
    name: 'NavItem',
    description: 'Sidebar and app menu navigation elements with icon and active state.',
    classes: ['ou-nav-item', 'ou-nav-item-active'],
    variants: [
      {
        name: 'Sidebar Menu',
        desc: 'Use active prop to highlight the current route. Pass icon for a leading icon.',
        code: `import { NavItem } from './components/ui';
import { Home, Layers, Database, Settings } from 'lucide-react';

<NavItem icon={Home} active>Dashboard</NavItem>
<NavItem icon={Layers}>Applications</NavItem>
<NavItem icon={Database}>Database</NavItem>
<NavItem icon={Settings}>Settings</NavItem>`,
        render: () => (
          <div style={{ width: '220px', background: 'var(--surface)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <NavItem icon={Home} active>Dashboard</NavItem>
            <NavItem icon={Layers}>Applications</NavItem>
            <NavItem icon={Database}>Database</NavItem>
            <NavItem icon={Settings}>Settings</NavItem>
          </div>
        ),
      },
      {
        name: 'Interactive with Badges',
        desc: 'Click to navigate between items. Badges show live counts per section.',
        code: `const [active, setActive] = useState('dashboard');

// Custom nav items with badge counts
{navItems.map(item => (
  <div key={item.id} onClick={() => setActive(item.id)} style={{ display: 'flex', alignItems: 'center', ... }}>
    <item.Icon size={16} />
    <span style={{ flex: 1 }}>{item.label}</span>
    {item.badge && <span className="badge">{item.badge}</span>}
  </div>
))}`,
        render: () => <NavBadgeDemo />,
      },
    ],
  },

  {
    id: 'progress',
    name: 'Progress',
    description: 'Visual progress bars for tasks, uploads, and resource metrics.',
    classes: ['ou-progress-container', 'ou-progress-bar', 'ou-progress-striped', 'ou-progress-primary', 'ou-progress-secondary'],
    variants: [
      {
        name: 'Variants & Striped',
        desc: 'value is a percentage 0–100. Use variant for color, striped for animated stripes.',
        code: `import { Progress } from './components/ui';

<Progress value={78} />
<Progress value={45} variant="secondary" />
<Progress value={92} striped />`,
        render: () => (
          <div className="flex-col" style={{ width: '100%', gap: '20px' }}>
            {[
              { label: 'CPU Usage', value: 78, variant: 'primary', striped: false },
              { label: 'Memory', value: 45, variant: 'secondary', striped: false },
              { label: 'Bandwidth (striped)', value: 92, variant: 'primary', striped: true },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{m.label}</span><span>{m.value}%</span>
                </div>
                <Progress value={m.value} variant={m.variant} striped={m.striped} />
              </div>
            ))}
          </div>
        ),
      },
      {
        name: 'Animated Fill',
        desc: 'Press Animate to watch all three bars fill in sequence.',
        code: `const [values, setValues] = useState([0, 0, 0]);

const animate = () => {
  setValues([0, 0, 0]);
  setTimeout(() => setValues([78, 0, 0]), 150);
  setTimeout(() => setValues([78, 45, 0]), 500);
  setTimeout(() => setValues([78, 45, 92]), 850);
};

// Progress transitions automatically via CSS transition: width 0.3s ease`,
        render: () => <ProgressAnimateDemo />,
      },
    ],
  },

  {
    id: 'radios',
    name: 'Radio',
    description: 'Exclusive single-option selection within a named group.',
    classes: ['ou-radio-container', 'ou-radio-input'],
    variants: [
      {
        name: 'Single Selection',
        desc: 'Controlled with checked + onChange. Group options using the same name prop.',
        code: `import { Radio } from './components/ui';
import { useState } from 'react';

const [env, setEnv] = useState('production');

<Radio label="Production" name="env" value="production"
  checked={env === 'production'} onChange={() => setEnv('production')} />
<Radio label="Staging" name="env" value="staging"
  checked={env === 'staging'} onChange={() => setEnv('staging')} />
<Radio label="Disabled" name="env" checked={false} onChange={() => {}} disabled />`,
        render: () => <RadioDemo />,
      },
      {
        name: 'Plan Card Selector',
        desc: 'Visual card-based radio — each card wraps a Radio with click-to-select layout.',
        code: `const [plan, setPlan] = useState('pro');

{plans.map(p => (
  <div
    key={p.id}
    onClick={() => setPlan(p.id)}
    style={{
      border: \`2px solid \${plan === p.id ? 'var(--primary)' : 'var(--border)'}\`,
      background: plan === p.id ? 'var(--primary-soft)' : 'var(--surface)',
    }}
  >
    <Radio name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} />
    <span>{p.name}</span>
    <span>{p.price}/mo</span>
  </div>
))}`,
        render: () => <RadioCardDemo />,
      },
    ],
  },

  {
    id: 'skeletons',
    name: 'Skeleton',
    description: 'Loading placeholders that match the shape of incoming content.',
    classes: ['ou-skeleton', 'ou-skeleton-shimmer'],
    variants: [
      {
        name: 'Content Placeholders',
        desc: 'Set width, height, and circle for rounded shapes. Shimmer runs automatically.',
        code: `import { Skeleton } from './components/ui';

// Avatar + text row
<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
  <Skeleton width="48px" height="48px" circle />
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <Skeleton width="40%" height="14px" />
    <Skeleton width="65%" height="10px" />
  </div>
</div>

// Block placeholder
<Skeleton width="100%" height="100px" />`,
        render: () => (
          <div className="flex-col" style={{ width: '100%', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <Skeleton width="48px" height="48px" circle />
              <div className="flex-col" style={{ flex: 1, gap: '8px' }}>
                <Skeleton width="42%" height="14px" />
                <Skeleton width="66%" height="10px" />
              </div>
            </div>
            <div className="flex-col" style={{ gap: '8px' }}>
              <Skeleton width="100%" height="12px" />
              <Skeleton width="88%" height="12px" />
              <Skeleton width="72%" height="12px" />
            </div>
            <Skeleton width="100%" height="80px" />
          </div>
        ),
      },
      {
        name: 'Table & Card Skeleton',
        desc: 'Compose multiple skeletons to match the exact layout being loaded.',
        code: `// Table rows skeleton
{[1,2,3].map(i => (
  <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
    <Skeleton width="48px" height="48px" circle />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton width="30%" height="14px" />
      <Skeleton width="60%" height="10px" />
    </div>
    <Skeleton width="80px" height="24px" />
  </div>
))}`,
        render: () => (
          <div className="flex-col" style={{ width: '100%', gap: '0', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', padding: '4px 16px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                <Skeleton width="36px" height="36px" circle />
                <div className="flex-col" style={{ flex: 1, gap: '7px' }}>
                  <Skeleton width={`${30 + i * 8}%`} height="12px" />
                  <Skeleton width={`${50 + i * 5}%`} height="10px" />
                </div>
                <Skeleton width="72px" height="22px" />
              </div>
            ))}
          </div>
        ),
      },
    ],
  },

  {
    id: 'switches',
    name: 'Switch',
    description: 'Smooth animated toggle for binary on/off states.',
    classes: ['ou-switch', 'ou-switch-active', 'ou-disabled'],
    variants: [
      {
        name: 'Toggle Controls',
        desc: 'Controlled with active + onChange. Pass disabled to prevent interaction.',
        code: `import { Switch } from './components/ui';
import { useState } from 'react';

const [autoScale, setAutoScale] = useState(true);

<Switch active={autoScale} onChange={setAutoScale} />

// Disabled
<Switch active={true} disabled />`,
        render: () => <SwitchDemo />,
      },
      {
        name: 'Feature Flags Panel',
        desc: 'Real-world use case: a list of toggleable feature flags with descriptions.',
        code: `const flags = [
  { id: 'dark', label: 'Dark mode', desc: 'System-wide dark theme' },
  { id: 'ai', label: 'AI suggestions', desc: 'Inline code completions' },
  { id: 'beta', label: 'Beta features', desc: 'Early access to new APIs' },
];
const [enabled, setEnabled] = useState({ dark: true, ai: true, beta: false });
const toggle = (id) => setEnabled(prev => ({ ...prev, [id]: !prev[id] }));

{flags.map(f => (
  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span>{f.label}</span>
    <Switch active={enabled[f.id]} onChange={() => toggle(f.id)} />
  </div>
))}`,
        render: () => <FeatureFlagsDemo />,
      },
    ],
  },

  {
    id: 'tables',
    name: 'Table',
    description: 'Data table with hover rows, status badges, and scrollable overflow.',
    classes: ['ou-table-wrapper', 'ou-table'],
    variants: [
      {
        name: 'Data Table',
        desc: 'Wrap standard thead/tbody inside Table. It adds the scroll wrapper and styles.',
        code: `import { Table, Badge } from './components/ui';

<Table>
  <thead>
    <tr>
      <th>Service</th><th>Region</th><th>Status</th><th>Uptime</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>API Gateway</td>
      <td>us-east-1</td>
      <td><Badge variant="success">Healthy</Badge></td>
      <td>99.9%</td>
    </tr>
  </tbody>
</Table>`,
        render: () => (
          <Table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Region</th>
                <th>Status</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['API Gateway', 'us-east-1', 'success', 'Healthy', '99.9%'],
                ['Auth Service', 'eu-west-1', 'warning', 'Degraded', '98.1%'],
                ['Storage', 'ap-south-1', 'primary', 'Stable', '100%'],
              ].map(([name, region, status, label, uptime]) => (
                <tr key={name}>
                  <td style={{ fontWeight: 500 }}>{name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{region}</td>
                  <td><Badge variant={status}>{label}</Badge></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{uptime}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ),
      },
      {
        name: 'Selectable Rows',
        desc: 'Click rows to select. A bulk-action toolbar appears when selections are made.',
        code: `const [selected, setSelected] = useState(new Set());

const toggle = (id) => setSelected(prev => {
  const s = new Set(prev);
  s.has(id) ? s.delete(id) : s.add(id);
  return s;
});

{selected.size > 0 && (
  <div>
    <span>{selected.size} selected</span>
    <Button icon={Download}>Export</Button>
    <Button variant="danger" icon={Trash2}>Delete</Button>
  </div>
)}`,
        render: () => <TableSelectDemo />,
      },
    ],
  },

  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Pill-style navigation for switching between views.',
    classes: ['ou-tabs', 'ou-tab', 'ou-tabs-pill'],
    variants: [
      {
        name: 'Pill Tabs',
        desc: 'Controlled with activeTab + onChange. tabs is an array of { id, label }.',
        code: `import { Tabs } from './components/ui';
import { useState } from 'react';

const [active, setActive] = useState('overview');

<Tabs
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'security', label: 'Security' },
    { id: 'logs', label: 'Logs' },
  ]}
  activeTab={active}
  onChange={setActive}
/>

{active === 'overview' && <OverviewPanel />}
{active === 'security' && <SecurityPanel />}`,
        render: () => <TabsDemo />,
      },
      {
        name: 'With Content Panels',
        desc: 'Each tab reveals a different content panel. Click the tabs to switch views.',
        code: `const content = {
  overview: <StatsGrid />,
  security: <AlertList />,
  logs: <LogFeed />,
};

<Tabs tabs={tabs} activeTab={active} onChange={setActive} />
{content[active]}`,
        render: () => <TabsContentDemo />,
      },
    ],
  },

  {
    id: 'toasts',
    name: 'Toast',
    description: 'Auto-dismissing notification toasts triggered via the useToast hook.',
    classes: ['ou-toast-container', 'ou-toast', 'ou-toast-success', 'ou-toast-warning', 'ou-toast-info'],
    variants: [
      {
        name: 'Notification System',
        desc: 'Wrap your app in ToastProvider. Call addToast from any component.',
        code: `// 1. Wrap your app
import { ToastProvider } from './components/ui';
<ToastProvider><App /></ToastProvider>

// 2. Trigger from any component
import { useToast } from './components/ui';

const { addToast } = useToast();

addToast({
  title: 'Deployment complete',
  message: 'auth-v3 is now live.',
  variant: 'success', // 'success' | 'warning' | 'info' | 'error'
});`,
        render: () => <ToastDemo />,
      },
    ],
  },

  {
    id: 'tooltips',
    name: 'Tooltip',
    description: 'Lightweight hover tooltips with four directional positions.',
    classes: ['ou-tooltip-wrapper', 'ou-tooltip'],
    variants: [
      {
        name: 'Directional Positions',
        desc: 'Wrap any element. Use position prop: top, bottom, left, right.',
        code: `import { Tooltip, Button } from './components/ui';

<Tooltip content="Edit project settings" position="top">
  <Button variant="outline" size="sm">Top</Button>
</Tooltip>

<Tooltip content="Delete permanently" position="bottom">
  <Button variant="danger" size="sm">Bottom</Button>
</Tooltip>

<Tooltip content="Copy link" position="right">
  <Button variant="ghost" size="sm">Right</Button>
</Tooltip>`,
        render: () => (
          <div className="preview-row" style={{ flexWrap: 'wrap', gap: '20px' }}>
            <Tooltip content="Edit project settings" position="top">
              <Button variant="outline" size="sm">Hover — Top</Button>
            </Tooltip>
            <Tooltip content="Delete permanently" position="bottom">
              <Button variant="danger" size="sm">Hover — Bottom</Button>
            </Tooltip>
            <Tooltip content="More options" position="right">
              <Button variant="ghost" size="sm">Hover — Right</Button>
            </Tooltip>
            <Tooltip content="Go back" position="left">
              <Button variant="secondary" size="sm">Hover — Left</Button>
            </Tooltip>
          </div>
        ),
      },
      {
        name: 'Icon Button Tooltips',
        desc: 'Great for icon-only buttons where labeling the action via tooltip keeps the UI clean.',
        code: `<Tooltip content="Download report" position="bottom">
  <button className="ou-demo-icon-btn">
    <Download size={16} />
  </button>
</Tooltip>

<Tooltip content="Filter results" position="bottom">
  <button className="ou-demo-icon-btn">
    <Filter size={16} />
  </button>
</Tooltip>`,
        render: () => (
          <div className="preview-row" style={{ gap: '12px' }}>
            {[
              { Icon: Download, label: 'Download report' },
              { Icon: Copy, label: 'Copy to clipboard' },
              { Icon: ExternalLink, label: 'Open in new tab' },
              { Icon: Trash2, label: 'Delete permanently' },
              { Icon: Settings, label: 'Configure settings' },
              { Icon: Filter, label: 'Filter results' },
            ].map(({ Icon, label }) => (
              <Tooltip key={label} content={label} position="bottom">
                <button
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Icon size={15} />
                </button>
              </Tooltip>
            ))}
          </div>
        ),
      },
    ],
  },
];
