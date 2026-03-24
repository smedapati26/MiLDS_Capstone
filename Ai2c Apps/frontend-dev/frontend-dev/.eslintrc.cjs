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
    'plugin:sonarjs/recommended-legacy',
  ],
  ignorePatterns: ['dist', 'coverage', 'node_modules', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'react-refresh', 'simple-import-sort', 'prettier', 'sonarjs'],
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
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'sonarjs/assertions-in-tests': 'off',
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
              ['^@components', '^@features', '^@loaders', '^@models', '^@pages', '^@store', '^@theme', '^@utils'],
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
