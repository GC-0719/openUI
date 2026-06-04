import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseReactGalleryShowcase,
  parseAngularGalleryShowcase,
  validateKitGalleryCoverage,
  generateGalleryHtml,
  syncKitGalleryFiles,
} from './kitGallery.js';
import { repoRootFromModule } from './kitPublicApi.js';

const root = repoRootFromModule(import.meta.url);

describe('kitGallery parsers', () => {
  it('parses React RENDERS map', () => {
    const src = fs.readFileSync(
      path.join(root, 'kits/react/template/src/pages/ComponentShowcase.jsx'),
      'utf-8'
    );
    const names = parseReactGalleryShowcase(src);
    expect(names).toContain('Button');
    expect(names.length).toBe(24);
  });

  it('parses Angular preview switches', () => {
    const src = fs.readFileSync(
      path.join(root, 'kits/angular/template/src/showcase.component.ts'),
      'utf-8'
    );
    const names = parseAngularGalleryShowcase(src);
    expect(names).toContain('Table');
    expect(names.length).toBe(24);
  });
});

describe('validateKitGalleryCoverage', () => {
  it('template and workspace galleries cover the manifest', () => {
    const r = validateKitGalleryCoverage(root);
    expect(r.ok, r.errors?.join('\n')).toBe(true);
    expect(r.componentCount).toBe(24);
  });
});

describe('generateGalleryHtml', () => {
  it('includes all component cards', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, 'kits/public-api.manifest.json'), 'utf-8')
    );
    const html = generateGalleryHtml(manifest);
    expect(html).toContain('gallery-card');
    expect(html).toContain('preview=Button');
  });
});

describe('syncKitGalleryFiles', () => {
  it('writes index.html and components.json', () => {
    const r = syncKitGalleryFiles(root);
    expect(r.ok).toBe(true);
    expect(fs.existsSync(path.join(root, 'kits/gallery/index.html'))).toBe(true);
  });
});
