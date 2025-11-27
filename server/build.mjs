import * as esbuild from 'esbuild';
import fs from 'fs';

await esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'server/dist/server.cjs',
  format: 'cjs',  // Use CommonJS to avoid ESM hoisting issues
  packages: 'external',
  sourcemap: true,
});

// Create a wrapper that loads dotenv first (use .cjs to force CommonJS)
const wrapper = `
require('dotenv').config();

// Verify required environment variables
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}

require('./server.cjs');
`;

fs.writeFileSync('server/dist/index.cjs', wrapper);
console.log('Server built successfully!');

