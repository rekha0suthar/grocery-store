const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..');

const readAllFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? readAllFiles(p) : [p];
  });
};

const forbidInCore = [
  '/backend/',
  '/frontend/',
  '/node_modules/express',
  '/node_modules/mongoose',
  '/node_modules/sequelize',
  '/node_modules/typeorm',
  '/node_modules/axios',
  '/node_modules/firebase',
  '/node_modules/firebase-admin',
  '/node_modules/aws-sdk',
  '/node_modules/react',
  '/node_modules/next',
  '/node_modules/koa',
  '/node_modules/fastify'
];

const ioBuiltins = [
  'fs', 'http', 'https', 'child_process', 'worker_threads', 
  'cluster', 'net', 'tls', 'dgram', 'dns', 'os', 'util', 
  'stream', 'buffer', 'events', 'url', 'querystring', 
  'readline', 'repl', 'tty', 'vm', 'zlib', 'crypto'
];

const extractImports = (code) => {
  const imports = [];
  
  // ES6 imports
  const es6Imports = code.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
  es6Imports.forEach(imp => {
    const match = imp.match(/from\s+['"]([^'"]+)['"]/);
    if (match) imports.push(match[1]);
  });
  
  // Dynamic imports
  const dynamicImports = code.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || [];
  dynamicImports.forEach(imp => {
    const match = imp.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (match) imports.push(match[1]);
  });
  
  // require() calls
  const requireImports = code.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || [];
  requireImports.forEach(imp => {
    const match = imp.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (match) imports.push(match[1]);
  });
  
  return imports;
};

describe('Architecture: Clean boundaries', () => {
  test('core files do not import infra/frameworks', () => {
    const coreDir = path.join(SRC, 'packages', 'core');
    const files = readAllFiles(coreDir)
      .filter((f) => f.endsWith('.js') && !f.includes('.test.js') && !f.includes('/adapters/') && !f.includes('/tests/'));

    const violations = [];

    for (const file of files) {
      const code = fs.readFileSync(file, 'utf8');
      const imports = extractImports(code);
      
      // Check for forbidden paths
      forbidInCore.forEach((bad) => {
        if (code.includes(bad)) {
          violations.push(`${file}: Contains forbidden path "${bad}"`);
        }
      });
      
      // Check for IO builtins
      imports.forEach((spec) => {
        if (ioBuiltins.includes(spec)) {
          violations.push(`${file}: Imports IO builtin "${spec}"`);
        }
      });
      
      // Check for process.env usage
      if (code.includes('process.env')) {
        violations.push(`${file}: Uses process.env directly`);
      }
      
      // Check for direct Date usage (except in constructors for default values)
      const dateMatches = code.match(/new\s+Date\(\)/g) || [];
      const dateNowMatches = code.match(/Date\.now\(\)/g) || [];
      if (dateMatches.length > 0 || dateNowMatches.length > 0) {
        violations.push(`${file}: Uses Date directly (${dateMatches.length + dateNowMatches.length} occurrences)`);
      }
    }

    if (violations.length > 0) {
      console.error('Architecture violations found:');
      violations.forEach(v => console.error(`  - ${v}`));
    }
    
    expect(violations).toHaveLength(0);
  });

  test('entities do not import use-cases/services/interfaces', () => {
    const entitiesDir = path.join(SRC, 'packages', 'core', 'entities');
    const files = readAllFiles(entitiesDir)
      .filter((f) => f.endsWith('.js') && !f.includes('.test.js') && !f.includes('/adapters/') && !f.includes('/tests/'));

    const violations = [];

    for (const file of files) {
      const code = fs.readFileSync(file, 'utf8');
      const imports = extractImports(code);
      
      // Check for imports from use-cases, services, or interfaces
      imports.forEach((spec) => {
        if (spec.includes('use-cases/') || 
            spec.includes('services/') || 
            spec.includes('interfaces/')) {
          violations.push(`${file}: Imports from ${spec}`);
        }
      });
    }

    if (violations.length > 0) {
      console.error('Entity layer violations found:');
      violations.forEach(v => console.error(`  - ${v}`));
    }
    
    expect(violations).toHaveLength(0);
  });

  test('use-cases do not import infrastructure', () => {
    const useCasesDir = path.join(SRC, 'packages', 'core', 'use-cases');
    const files = readAllFiles(useCasesDir)
      .filter((f) => f.endsWith('.js') && !f.includes('.test.js') && !f.includes('/adapters/') && !f.includes('/tests/'));

    const violations = [];

    for (const file of files) {
      const code = fs.readFileSync(file, 'utf8');
      const imports = extractImports(code);
      
      // Check for imports from backend or frontend
      imports.forEach((spec) => {
        if (spec.includes('backend/') || spec.includes('frontend/')) {
          violations.push(`${file}: Imports from infrastructure ${spec}`);
        }
      });
    }

    if (violations.length > 0) {
      console.error('Use case layer violations found:');
      violations.forEach(v => console.error(`  - ${v}`));
    }
    
    expect(violations).toHaveLength(0);
  });

  test('core package has no runtime dependencies on frameworks', () => {
    const corePackageJson = path.join(SRC, 'packages', 'core', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(corePackageJson, 'utf8'));
    
    const forbiddenDeps = [
      'express', 'koa', 'fastify', 'react', 'next', 'vue', 'angular',
      'mongoose', 'sequelize', 'typeorm', 'knex', 'aws-sdk', 'axios',
      'firebase', 'firebase-admin'
    ];
    
    const violations = [];
    
    // Check dependencies
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach(dep => {
        if (forbiddenDeps.some(forbidden => dep.includes(forbidden))) {
          violations.push(`Runtime dependency: ${dep}`);
        }
      });
    }
    
    // Check peerDependencies
    if (packageJson.peerDependencies) {
      Object.keys(packageJson.peerDependencies).forEach(dep => {
        if (forbiddenDeps.some(forbidden => dep.includes(forbidden))) {
          violations.push(`Peer dependency: ${dep}`);
        }
      });
    }
    
    if (violations.length > 0) {
      console.error('Package dependency violations found:');
      violations.forEach(v => console.error(`  - ${v}`));
    }
    
    expect(violations).toHaveLength(0);
  });
});
