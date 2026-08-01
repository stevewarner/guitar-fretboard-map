import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import tailwindcss from 'eslint-plugin-tailwindcss';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  ...nextCoreWebVitals,
  ...tailwindcss.configs['flat/recommended'],
  prettierRecommended,
  {
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
