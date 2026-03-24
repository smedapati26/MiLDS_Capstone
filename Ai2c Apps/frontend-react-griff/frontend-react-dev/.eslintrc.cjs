module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint-config-prettier',
  ],
  ignorePatterns: ['dist', 'coverage', 'node_modules', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'react-refresh', 'simple-import-sort', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: ['./'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'import/named': 'off',
    'import/no-unresolved': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['off', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.ts', '**/*.tsx'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'simple-import-sort/imports': [
          'warn',
          {
            groups: [
              // `react` first, then packages starting with a character
              ['^react$', '^[a-z]'],
              // Packages starting with `@`
              ['^@'],
              // AI2C Packages starting with `@ai2c`
              ['^@ai2c'],
              // Path Alias`
              [
                '^@components',
                '^@features',
                '^@hooks',
                '^@loaders',
                '^@models',
                '^@pages',
                '^@theme',
                '^@utils',
                '^@static',
              ],
              ['^@store'], // on a new line
              ['^@vitest'], // on a new line
              // Packages starting with `~`
              ['^~'],
              // Imports starting with `./*/`
              ['^\\./(?=.*/)(?!/?$)'],
              // Imports starting with `../`
              // Imports starting with `./`
              ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\.(?!/?$)', '^\\./?$'],
              // Style imports
              ['^.+\\.s?css$'],
              // Side effect imports
              ['^\\u0000'],
            ],
          },
        ],
      },
    },
  ],
};
