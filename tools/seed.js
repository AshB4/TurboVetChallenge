const path = require('path');
const tsConfig = require('../tsconfig.base.json');

require('ts-node').register({
  project: path.resolve(__dirname, '../tsconfig.base.json'),
  transpileOnly: false,
  compilerOptions: { module: 'CommonJS' },
});

const tsconfigPaths = require('tsconfig-paths');
tsconfigPaths.register({
  baseUrl: path.resolve(__dirname, '..'),
  paths: tsConfig.compilerOptions.paths,
});

require('../api/src/seed');
