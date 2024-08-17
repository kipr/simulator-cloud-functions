module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // Project-specific ESLint rules
    'array-bracket-spacing': 'error',
    'arrow-spacing': 'error',
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'comma-style': 'error',
    'eqeqeq': 'error',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'keyword-spacing': 'error',
    'newline-per-chained-call': 'error',
    'no-confusing-arrow': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-new-wrappers': 'error',
    'no-param-reassign': 'error',
    'no-useless-constructor': 'error',
    'no-whitespace-before-property': 'error',
    'nonblock-statement-body-position': 'error',
    'object-curly-spacing': ['error', 'always'],
    'operator-linebreak': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'semi': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', { 'named': 'never' }],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'spaced-comment': 'error',
    'template-curly-spacing': 'error',

    // Project-specific ESLint rules for TypeScript
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/explicit-module-boundary-types' : 'off',
    '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
    '@typescript-eslint/no-unused-vars': ['off'],
  },
};
