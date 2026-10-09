import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'node_modules/**',
      'package/**',
      'dist/**',
      'esm/**',
      'es/**',
      'coverage/**',
      'artifacts/**',
      'vendor/**',
      '.tmp/**',
      '.yarn/**',
      'nbproject/**',
      '.build-*/**',
      '.package-*/**',
      '.go-types-build-*/**',
      '**/*.min.js',
      '**/*.map'
    ]
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,cjs,mjs,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {}
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }]
    }
  },
  { files: ['**/*.mjs'], languageOptions: { sourceType: 'module' } },
  {
    files: ['scripts/**/*.{js,cjs,mjs}', 'benchmarks/**/*.{js,cjs,mjs}', 'test/**/*.{js,cjs,mjs}', 'eslint.config.mjs'],
    ignores: ['test/browser/**'],
    languageOptions: { globals: globals.node }
  },
  // Portable runtime code receives only the optional host names each implementation checks.
  { files: ['src/util/nativeTypes.js'], languageOptions: { globals: { process: 'readonly' } } },
  { files: ['src/isNode.js'], languageOptions: { globals: { Node: 'readonly' } } },
  { files: ['src/isElement.js'], languageOptions: { globals: { Element: 'readonly' } } },
  { files: ['src/isFragment.js'], languageOptions: { globals: { DocumentFragment: 'readonly' } } },
  {
    files: ['test/browser/**/*.js'],
    languageOptions: { sourceType: 'script', globals: globals.browser }
  },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: ['**/*.{ts,cts,mts,tsx}'] })),
  // Public declarations and compiler fixtures retain their intentional API types and import-equals forms.
  {
    files: ['**/*.{ts,cts,mts,tsx}'],
    rules: { '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/no-require-imports': 'off' }
  },
  // Compiler fixtures assert type acceptance/rejection without necessarily reading each binding at runtime.
  {
    files: ['test/**/*.{ts,cts,mts,tsx}', 'types/**/*.d.{ts,cts,mts}', '**/*.d.{ts,cts,mts}'],
    rules: { '@typescript-eslint/no-unused-vars': 'off', '@typescript-eslint/no-empty-object-type': 'off' }
  },
  // Boxed-value contracts, explicit receiver checks and ambient/browser fixtures are intentional.
  {
    files: ['**/*.d.{ts,cts,mts}', 'test/**/*.{ts,cts,mts}'],
    rules: { '@typescript-eslint/no-wrapper-object-types': 'off', '@typescript-eslint/no-unsafe-function-type': 'off' }
  },
  {
    files: ['scripts/test-browser.js'],
    languageOptions: { globals: { Types: 'readonly', runGoTypesBrowserTests: 'readonly' } }
  }
];
