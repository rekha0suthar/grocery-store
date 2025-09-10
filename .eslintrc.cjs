module.exports = {
  root: true,
  env: { 
    es2022: true, 
    node: true, 
    jest: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: ['import'],
  extends: [
    'eslint:recommended', 
    'plugin:import/errors', 
    'plugin:import/warnings'
  ],
  rules: {
    // General import rules
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    
    // Ban frameworks in core
    'import/no-restricted-paths': ['error', {
      zones: [
        {
          target: './packages/core',
          from: ['./backend', './frontend'],
          message: 'Core cannot import from backend or frontend. This violates Clean Architecture dependency rule.',
        },
        {
          target: './packages/core/entities',
          from: ['./packages/core/use-cases', './packages/core/services', './packages/core/interfaces'],
          message: 'Entities cannot import use-cases, services, or interfaces. They should be the innermost layer.',
        }
      ],
    }],
    
    // Global Date restriction removed - handled in core-specific override
    
    // Prevent process.env usage in core
    'no-restricted-syntax': [
      'error',
      {
        selector: 'MemberExpression[object.name="process"][property.name="env"]',
        message: 'Direct process.env usage in core violates Clean Architecture. Use dependency injection for configuration.'
      }
    ]
  },
  overrides: [
    // Relax rules for test files
    {
      files: ['**/*.test.js', '**/tests/**/*.js', '**/__tests__/**/*.js'],
      rules: {
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off'
      }
    },
    // Stricter rules for core package
    {
      files: ['packages/core/**/*.js'],
      excludedFiles: ['packages/core/**/*.test.js', 'packages/core/tests/**/*.js', 'packages/core/adapters/**/*.js'],
      rules: {
        'import/no-nodejs-modules': 'error',
        'no-restricted-globals': ['error', {
          name: 'Date',
          message: 'Direct Date usage in core violates determinism. Use dependency injection for time operations.'
        }],
        'no-restricted-syntax': [
          'error',
          {
            selector: 'MemberExpression[object.name="process"][property.name="env"]',
            message: 'Direct process.env usage in core violates Clean Architecture. Use dependency injection for configuration.'
          },
          {
            selector: 'CallExpression[callee.name="require"]',
            message: 'Use ES6 imports instead of require() in core package.'
          }
        ]
      }
    },
    // Relax rules for backend and frontend
    {
      files: ['backend/**/*.js', 'frontend/**/*.js'],
      rules: {
        'import/no-nodejs-modules': 'off',
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off'
      }
    }
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'packages', 'backend', 'frontend']
      }
    }
  }
};
