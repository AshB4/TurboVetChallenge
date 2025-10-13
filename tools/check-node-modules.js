#!/usr/bin/env node
const { existsSync } = require('fs');
const { join } = require('path');

const workspaceRoot = join(__dirname, '..');
const nodeModulesPath = join(workspaceRoot, 'node_modules');
const nxBinary = join(nodeModulesPath, '.bin', process.platform === 'win32' ? 'nx.cmd' : 'nx');

const missingNodeModules = !existsSync(nodeModulesPath);
const missingNxBinary = !existsSync(nxBinary);

if (missingNodeModules || missingNxBinary) {
  console.error(
    '\nDependencies for the workspace are missing. Run `npm install` (or `npm ci`) before `npm run dev`.\n',
  );
  console.error('The `nx` CLI is installed locally in `node_modules/.bin` and is required to launch the dev servers.');
  process.exit(1);
}
