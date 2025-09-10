/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    doNotFollow: { 
      path: 'node_modules',
      dependencyTypes: ['npm']
    },
    tsPreCompilationDeps: false,
    includeOnly: ['^(packages|backend|frontend)/'],
    exclude: {
      path: 'node_modules|\.swf$|\.bin$|\.exe$|\.dll$|\.so$|\.dylib$'
    },
    reporterOptions: { 
      dot: { collapsePattern: 'node_modules/[^/]+' },
      text: { highlightFocused: true }
    }
  },
  forbidden: [
    // 0) No circular dependencies anywhere
    { 
      name: 'no-cycles', 
      severity: 'error', 
      from: {}, 
      to: { circular: true } 
    },

    // 1) Core must not import backend/frontend
    {
      name: 'core-no-imports-infra',
      severity: 'error',
      from: { path: '^packages/core/' },
      to: { path: '^(backend|frontend)/' }
    },

    // 2) Core must not import frameworks or external libraries
    {
      name: 'core-no-frameworks',
      severity: 'error',
      from: { path: '^packages/core/' },
      to: {
        path: '^(express|koa|fastify|react|next|vue|angular|mongoose|sequelize|typeorm|knex|aws-sdk|axios|firebase|firebase-admin)(/|$)',
        dependencyTypes: ['npm']
      }
    },

    // 3) Core must not import node builtins that imply I/O
    {
      name: 'core-no-io',
      severity: 'error',
      from: { path: '^packages/core/' },
      to: { 
        path: '^(fs|path|http|https|crypto|child_process|worker_threads|cluster|net|tls|dgram|dns|os|util|stream|buffer|events|url|querystring|readline|repl|tty|vm|zlib)(/|$)', 
        dependencyTypes: ['core'] 
      }
    },

    // 4) Use-cases must not depend on infrastructure
    {
      name: 'usecases-no-infra',
      severity: 'error',
      from: { path: '^packages/core/use-cases/' },
      to: { path: '^(backend|frontend)/' }
    },

    // 5) Enforce layer direction inside core (entities <- use-cases <- services|interfaces)
    {
      name: 'entities-no-outwards',
      severity: 'error',
      from: { path: '^packages/core/entities/' },
      to: { path: '^packages/core/(use-cases|services|interfaces)/' }
    },

    // 6) Backend adapters should not import frontend and vice versa
    {
      name: 'no-cross-app-deps',
      severity: 'error',
      from: { path: '^backend/' },
      to: { path: '^frontend/' }
    },
    {
      name: 'no-cross-app-deps-frontend',
      severity: 'error',
      from: { path: '^frontend/' },
      to: { path: '^backend/' }
    }
  ],
  allowed: [
    // Allow core to import from its own subdirectories
    {
      from: { path: '^packages/core/' },
      to: { path: '^packages/core/' }
    },
    // Allow backend to import from core
    {
      from: { path: '^backend/' },
      to: { path: '^packages/core/' }
    },
    // Allow frontend to import from core
    {
      from: { path: '^frontend/' },
      to: { path: '^packages/core/' }
    },
    // Allow backend internal dependencies
    {
      from: { path: '^backend/src/' },
      to: { path: '^backend/src/' }
    },
    // Allow frontend internal dependencies
    {
      from: { path: '^frontend/src/' },
      to: { path: '^frontend/src/' }
    }
  ]
};
