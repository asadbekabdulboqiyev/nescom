import nextConfig from 'eslint-config-next';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      'src/generated/**',
      '*.config.mjs',
      'tests/**',
    ],
  },
  ...nextConfig,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      '@next/next/no-img-element': 'off',
    },
  }
);
