module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'semi': 'off',
    'space-before-function-paren': 'off',
    'quotes': 'off',
    'comma-dangle': 'off',
    'no-trailing-spaces': 'off',
    'object-shorthand': 'off',
    'no-useless-escape': 'off',
    'dot-notation': 'off',
    'padded-blocks': 'off',
    'no-useless-constructor': 'off',
    'quote-props': 'off',
    'no-dupe-class-members': 'off'
  },
  globals: {
    process: 'readonly'
  }
}
