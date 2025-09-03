module.exports = {
  env: {
    node: true,
    jest: true,
    es2022: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  root: true,
  ignorePatterns: [
    '.eslintrc.js',
    'dist/',
    'node_modules/',
    'src/**/*.ts', // Ignore TypeScript files for now
  ],
  rules: {
    // General rules
    'no-console': 'off', // Allow console in server-side code
    'prefer-const': 'error',
    'no-var': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    'linebreak-style': ['error', 'unix'],
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
  },
};
