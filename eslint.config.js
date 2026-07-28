import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const frontendFiles = ['frontend-{public,admin}/src/**/*.{ts,tsx}'];

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'backups/**', 'springboot/**'],
  },
  {
    files: frontendFiles,
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
        },
      ],
      'react/prop-types': 'off',
      'react/self-closing-comp': 'error',
      'react-hooks/incompatible-library': 'off',
    },
  },
  {
    files: ['frontend-{public,admin}/src/**/router.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['frontend-public/src/app/AppLayout.tsx', 'frontend-public/src/pages/**/*Page.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  prettier,
]);
