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
      'no-undef': 'off',           // отключаем проверку необъявленных переменных
      'no-unused-expressions': 'off', // ✅ выключаем неиспользованные выражения
      'no-unused-vars': 'off',     // ✅ полностью выключаем неиспользованные переменные
      'no-empty': 'warn',           // ✅ выключаем пустые блоки
      // остальные правила...
      'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
      'indent': 'off',
      'no-multi-spaces': ['error', { ignoreEOLComments: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-infix-ops': 'error',
      'no-irregular-whitespace': 'error'
    }
  }
];