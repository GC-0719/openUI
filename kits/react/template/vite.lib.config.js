// Library build for the @openui/react package.
// Builds the component barrel to ESM and ships the kit stylesheet as styles.css.
// Paths are resolved from this file so the build is cwd-independent.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));

const copyStyles = {
  name: 'openui-copy-styles',
  closeBundle() {
    copyFileSync(path.join(dir, 'src/styles/openui.css'), path.join(dir, 'dist/styles.css'));
  },
};

export default defineConfig({
  plugins: [react(), copyStyles],
  publicDir: false,
  build: {
    outDir: path.join(dir, 'dist'),
    emptyOutDir: true,
    lib: {
      entry: path.join(dir, 'src/components/ui/index.jsx'),
      formats: ['es'],
      fileName: () => 'openui-react.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
    },
  },
});
