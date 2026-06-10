import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.js', 'server/**/*.test.js'],
    // macOS writes AppleDouble resource forks (._foo.test.js) on exFAT volumes;
    // they're binary, not tests.
    exclude: ['**/node_modules/**', '**/._*'],
    environment: 'node',
  },
});
