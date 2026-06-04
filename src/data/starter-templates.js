/**
 * One-click agent seeds for common app shells (0.4.x starter templates).
 * Prompts are framework-aware and align with openUI kit + routing conventions.
 */

function pagePath(framework, name) {
  return framework === 'angular'
    ? `src/app/pages/${name}.component.ts`
    : `src/pages/${name}.jsx`;
}

function sharedRules(framework) {
  const routing = framework === 'angular'
    ? 'Register every new page in `src/app/app.component.ts` (imports + template) so it appears in the preview.'
    : 'New pages live under `src/pages/<Name>.jsx` with a default export and should be reachable via the app nav / `#/ai/<Name>`.';
  return [
    'Use ONLY design-system kit components from the UI barrel — no raw `<button>`, `<input>`, or other HTML form controls.',
    'Use CSS variables (`var(--primary)`, `var(--text)`, `var(--text-muted)`, etc.) — no hardcoded hex colors.',
    'Responsive layouts: `auto-fit` grids, `flex-wrap`, `max-width: 100%` — no fixed desktop-only widths.',
    routing,
  ].join('\n');
}

/**
 * @param {'react' | 'angular'} framework
 * @returns {{ id: string, name: string, tagline: string, prompt: string }[]}
 */
export function getStarterTemplates(framework = 'react') {
  const rules = sharedRules(framework);
  const compDir = framework === 'angular' ? 'src/app/components' : 'src/components';

  const dashboardPage = pagePath(framework, 'AnalyticsDashboard');
  const signInPage = pagePath(framework, 'SignIn');
  const signUpPage = pagePath(framework, 'SignUp');
  const settingsPage = pagePath(framework, 'Settings');
  const authLayout = framework === 'angular'
    ? 'src/app/components/auth-layout.component.ts'
    : 'src/components/AuthLayout.jsx';

  return [
    {
      id: 'dashboard',
      name: 'Dashboard',
      tagline: 'KPI cards, activity feed, data table',
      prompt: `Build a production-style admin dashboard for this workspace.

## Scope
- Main page: \`${dashboardPage}\` with 4 KPI stat cards (revenue, active users, conversion rate, open tickets), each with label, value, and trend badge.
- Below the KPIs: a responsive data table of recent orders (10 mock rows — id, customer, amount, status, date). Use kit Table or Card + List patterns.
- Optional reusable pieces under \`${compDir}/\` (e.g. StatCard, OrdersTable) and export new UI pieces through the kit barrel if you add components.
- Include skeleton loading state for the table (kit Skeleton).
- Add nav entry so the dashboard is reachable from the existing app shell.

## Rules
${rules}`,
    },
    {
      id: 'auth',
      name: 'Auth',
      tagline: 'Sign-in, sign-up, shared layout',
      prompt: `Build an authentication flow for this workspace.

## Scope
- Shared layout: \`${authLayout}\` — centered card, product title, subtitle, and slot for child content.
- \`${signInPage}\` — email + password, remember-me checkbox, primary sign-in button, link to sign-up, secondary "Continue with Google/GitHub" stub buttons.
- \`${signUpPage}\` — full name, email, password, confirm password, terms checkbox, create-account CTA, link back to sign-in.
- Use kit Input, Button, Checkbox, Card, Alert for inline validation errors (empty email, password mismatch).
- Wire both pages into navigation / routing.

## Rules
${rules}`,
    },
    {
      id: 'settings',
      name: 'Settings',
      tagline: 'Profile, notifications, security tabs',
      prompt: `Build a settings area for this workspace.

## Scope
- Main page: \`${settingsPage}\` with kit Tabs for three sections:
  1. **Profile** — Avatar, name, email, bio (textarea), Save button with success toast stub.
  2. **Notifications** — Switches for email digests, push alerts, product updates, marketing (all mock state in component).
  3. **Security** — Change password fields, "Enable 2FA" stub button, read-only list of active sessions (mock rows in a table).
- Desktop: two-column layout where helpful; mobile: stacked sections.
- Add nav entry for Settings.

## Rules
${rules}`,
    },
  ];
}
