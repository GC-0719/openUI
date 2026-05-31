import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore build output, dependencies, macOS AppleDouble junk, and the
  // generated workspace copy (the kit templates are the linted source).
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '**/._*',
    'kits/*/workspace/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Correctness rules stay as errors (CI gate). The rules below are
      // non-correctness / intentional-pattern findings kept as warnings —
      // a pre-1.0 cleanup backlog that should not block CI.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-useless-escape': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'react-refresh/only-export-components': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Node-context files: Vite configs, build scripts, the prod server.
  {
    files: ['*.config.js', '**/vite.*.config.js', 'vite.config.js', 'server.js'],
    languageOptions: { globals: { ...globals.node } },
  },
])
