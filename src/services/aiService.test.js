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

  it('omits the memory section when there is none', () => {
    const base = { components: [], kitPrefix: 'ou', kitName: 'openUI' };
    expect(buildAgentPrompt(base)).not.toContain('PROJECT MEMORY');
    expect(buildAgentPrompt({ ...base, memory: '   ' })).not.toContain('PROJECT MEMORY');
  });

  it('injects project memory into the angular prompt too', () => {
    const prompt = buildAgentPrompt({
      components: [], kitPrefix: 'ou', kitName: 'openUI',
      framework: 'angular', memory: '- Tabs are capitalized.',
    });
    expect(prompt).toContain('PROJECT MEMORY');
    expect(prompt).toContain('Tabs are capitalized.');
  });

  it('teaches the localStorage-over-seed-JSON storage pattern (react)', () => {
    const prompt = buildAgentPrompt({ components: [], kitPrefix: 'ou', kitName: 'openUI' });
    expect(prompt).toContain('localStorage');
    expect(prompt).toContain('src/hooks/useStore.js');
  });

  it('requires emitting every referenced file in one response (react)', () => {
    const prompt = buildAgentPrompt({ components: [], kitPrefix: 'ou', kitName: 'openUI' });
    expect(prompt).toContain('MULTI-FILE BUILDS');
    expect(prompt).toMatch(/NEVER import a file you do not also create/i);
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

  // Regression: template-literal backticks inside fences were once mangled by
  // the chat renderer; the parser must hand them through byte-for-byte.
  it('preserves template-literal backticks inside code', () => {
    const code = 'const msg = `"${name}" added successfully!`;';
    const text = `\`\`\`jsx:src/pages/Toasty.jsx\n${code}\nexport default function Toasty() { return null; }\n\`\`\``;
    const { files } = parseAgentResponse(text);
    expect(files['src/pages/Toasty.jsx']).toContain(code);
  });

  // Regression: a truncated response leaves an unclosed trailing fence; the
  // partial code must not leak into the chat message as prose.
  it('strips an unclosed trailing fence from the message', () => {
    const text = 'Building it.\n```jsx:src/pages/Done.jsx\nexport default function Done() { return null; }\n```\nNow the modal.\n```jsx:src/components/Modal.jsx\nimport React from';
    const { files, message } = parseAgentResponse(text);
    expect(files['src/pages/Done.jsx']).toBeDefined();
    expect(files['src/components/Modal.jsx']).toBeUndefined();
    expect(message).not.toContain('import React from');
  });

  it('parses several path-annotated files from one response', () => {
    const text = [
      '```js:src/hooks/useStore.js', 'export default function useStore() {}', '```',
      '```jsx:src/components/StatsBar.jsx', 'export const StatsBar = () => null;', '```',
      '```jsx:src/pages/Dashboard.jsx', 'export default function Dashboard() { return null; }', '```',
    ].join('\n');
    const { files } = parseAgentResponse(text);
    expect(Object.keys(files)).toEqual([
      'src/hooks/useStore.js',
      'src/components/StatsBar.jsx',
      'src/pages/Dashboard.jsx',
    ]);
  });
});
