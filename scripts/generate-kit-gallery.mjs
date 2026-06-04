#!/usr/bin/env node
/**
 * Regenerate kits/gallery/index.html from public-api.manifest.json.
 * Run in CI and locally: npm run gallery:sync
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { syncKitGalleryFiles } from '../server/kitGallery.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = syncKitGalleryFiles(root);
if (!result.ok) {
  console.error('[gallery:sync]', result.error || result.errors);
  process.exit(1);
}
console.log(`[gallery:sync] Wrote ${result.count} components to kits/gallery/`);
