/* eslint-disable import/no-anonymous-default-export */
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:@next/next/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:tailwindcss/recommended',
  ),
  {
    plugins: {
      react,
      prettier,
    },

    languageOptions: {
      globals: {
        React: 'writable',
      },
    },

    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'prettier/prettier': 'error',
      'no-console': 'warn',
    },
  },
];
