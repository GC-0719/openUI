import { describe, it, expect } from 'vitest';
import {
  parseAIChanges,
  stripJsonBlock,
  parseBuilderJSX,
  parseAgentResponse,
  parsePlanChecklist,
  parseAuditResult,
  buildAuditPrompt,
  buildAgentPrompt,
} from './aiService.js';

describe('parseAIChanges', () => {
  it('extracts changes from a fenced json block', () => {
    const text = 'Here you go:\n```json\n{"changes":[{"path":"a.jsx","content":"x"}]}\n```\nDone.';
    expect(parseAIChanges(text)).toEqual([{ path: 'a.jsx', content: 'x' }]);
  });

  it('returns null when no json fence', () => {
    expect(parseAIChanges('no json here')).toBeNull();
  });

  it('returns null for invalid json', () => {
    expect(parseAIChanges('```json\n{not valid}\n```')).toBeNull();
  });
});

describe('stripJsonBlock', () => {
  it('removes fenced json and trims prose', () => {
    const text = 'Summary\n```json\n{"x":1}\n```\nThanks.';
    expect(stripJsonBlock(text)).toBe('Summary\nThanks.');
  });
});

describe('parseBuilderJSX', () => {
  it('extracts code from a jsx fence', () => {
    expect(parseBuilderJSX('```jsx\n<div />\n```')).toBe('<div />');
  });

  it('returns trimmed text when no fence', () => {
    expect(parseBuilderJSX('  <span />  ')).toBe('<span />');
  });
});

describe('parsePlanChecklist', () => {
  it('extracts unchecked and checked items', () => {
    const text = `## Checklist\n- [ ] Create src/pages/Home.jsx\n- [x] Read Dashboard.jsx\n`;
    expect(parsePlanChecklist(text)).toEqual([
      { done: false, text: 'Create src/pages/Home.jsx' },
      { done: true, text: 'Read Dashboard.jsx' },
    ]);
  });

  it('returns empty when no checklist syntax', () => {
    expect(parsePlanChecklist('just prose')).toEqual([]);
  });
});

describe('buildAgentPrompt', () => {
  it('includes kit name, memory, and theme in react mode', () => {
    const prompt = buildAgentPrompt({
      components: [{ id: 'buttons', name: 'Button' }],
      kitName: 'AcmeUI',
      kitPrefix: 'ac',
      framework: 'react',
      memory: '- The app is a CRM for sales teams',
      cssVars: { '--primary': '#6366F1' },
    });
    expect(prompt).toContain('AcmeUI');
    expect(prompt).toContain('PROJECT MEMORY');
    expect(prompt).toContain('CRM');
    expect(prompt).toContain('--primary');
    expect(prompt).toContain('OUTPUT FORMAT');
  });

  it('uses Angular selectors when framework is angular', () => {
    const prompt = buildAgentPrompt({
      components: [{ id: 'button', name: 'Button' }],
      kitName: 'AcmeUI',
      kitPrefix: 'ou',
      framework: 'angular',
    });
    expect(prompt).toContain('Angular');
    expect(prompt).toContain('@angular/material');
    expect(prompt).toContain('```ts:');
  });
});

describe('parseAuditResult', () => {
  it('parses JSON wrapped in markdown fences', () => {
    const text = '```json\n{"violations":[],"summary":"clean"}\n```';
    expect(parseAuditResult(text)).toEqual({ violations: [], summary: 'clean' });
  });
});

describe('buildAuditPrompt', () => {
  it('includes Angular rules when framework is angular', () => {
    const prompt = buildAuditPrompt('<button>Go</button>', {
      components: [{ id: 'button', name: 'Button' }],
      framework: 'angular',
      kitPrefix: 'ou',
    });
    expect(prompt).toContain('Angular template');
    expect(prompt).toContain('@angular/material');
  });

  it('includes specs from disk when provided', () => {
    const prompt = buildAuditPrompt('code', {
      components: [{ id: 'buttons', name: 'Button' }],
      specs: { buttons: { purpose: 'Primary actions', useWhen: ['CTAs'], avoidWhen: [] } },
    });
    expect(prompt).toContain('Primary actions');
  });
});

describe('parseAgentResponse', () => {
  it('parses path-annotated jsx blocks', () => {
    const text = 'Created page.\n```jsx:src/pages/Home.jsx\nexport default function Home() { return <div />; }\n```';
    const { files, message } = parseAgentResponse(text);
    expect(files['src/pages/Home.jsx']).toContain('export default function Home');
    expect(message).toContain('Created page');
  });

  it('falls back to plain jsx blocks with inferred page path', () => {
    const text = '```jsx\nexport default function About() { return <p />; }\n```';
    const { files } = parseAgentResponse(text);
    expect(files['src/pages/About.jsx']).toBeDefined();
  });

  it('strips script tags from generated code', () => {
    const text = '```jsx:src/pages/Bad.jsx\n<script>alert(1)</script>\nexport default function Bad() { return null; }\n```';
    const { files } = parseAgentResponse(text);
    expect(files['src/pages/Bad.jsx']).not.toContain('<script');
  });
});
