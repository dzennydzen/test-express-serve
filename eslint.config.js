import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/',
      'dist/',
      '*.config.js',
      '**/temp/*'
    ]
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node // node-глобалы для универсальности
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off', // отключаем для тестовых глобалов
      'no-unused-expressions': 'warn',
      'no-unused-vars': 'warn', // ⚠️ предупреждение вместо ошибки
      'no-empty': 'warn',       // ⚠️ предупреждение вместо ошибки
      // правила для пробелов и табов
      'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
      'indent': 'off',
      'no-multi-spaces': ['error', { ignoreEOLComments: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-infix-ops': 'error',
      'no-irregular-whitespace': 'error'
    }
  }
];