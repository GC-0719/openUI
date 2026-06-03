import { describe, it, expect } from 'vitest';
import { getStarterTemplates } from './starter-templates.js';

describe('getStarterTemplates', () => {
  it('returns dashboard, auth, and settings for react', () => {
    const templates = getStarterTemplates('react');
    expect(templates.map(t => t.id)).toEqual(['dashboard', 'auth', 'settings']);
    expect(templates[0].prompt).toContain('src/pages/AnalyticsDashboard.jsx');
    expect(templates[1].prompt).toContain('SignIn.jsx');
    expect(templates[2].prompt).toContain('Settings.jsx');
  });

  it('uses angular paths when framework is angular', () => {
    const templates = getStarterTemplates('angular');
    expect(templates[0].prompt).toContain('src/app/pages/AnalyticsDashboard.component.ts');
    expect(templates[0].prompt).toContain('app.component.ts');
  });

  it('requires kit components in every prompt', () => {
    for (const t of getStarterTemplates('react')) {
      expect(t.prompt).toMatch(/kit components/i);
    }
  });
});
