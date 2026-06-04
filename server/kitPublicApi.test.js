import { describe, it, expect } from 'vitest';
import {
  parseReactBarrel,
  parseAngularBarrel,
  validateKitPublicApi,
  repoRootFromModule,
} from './kitPublicApi.js';

const root = repoRootFromModule(import.meta.url);

describe('parseReactBarrel', () => {
  it('extracts component stems', () => {
    const stems = parseReactBarrel("export * from './Button';\nexport * from './Card';\n");
    expect(stems).toEqual(['Button', 'Card']);
  });
});

describe('parseAngularBarrel', () => {
  it('extracts symbols including type exports', () => {
    const syms = parseAngularBarrel(
      "export { ButtonComponent } from './button.component';\nexport { TableComponent, type TableColumn } from './table.component';\n"
    );
    expect(syms).toContain('ButtonComponent');
    expect(syms).toContain('TableColumn');
    expect(syms).toContain('TableComponent');
  });
});

describe('validateKitPublicApi', () => {
  it('template and workspace barrels match the manifest', () => {
    const r = validateKitPublicApi(root);
    expect(r.ok, r.errors?.join('\n')).toBe(true);
    expect(r.react.components).toBe(24);
    expect(r.angular.symbols).toBeGreaterThan(20);
  });
});
