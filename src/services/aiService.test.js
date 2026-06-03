import { describe, it, expect } from 'vitest';
import {
  parseAIChanges,
  stripJsonBlock,
  parseBuilderJSX,
  parseAgentResponse,
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
