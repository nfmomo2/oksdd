const esbuild = require('esbuild');
const path = require('path');

const buildOptions = {
  entryPoints: [path.join(__dirname, 'src', 'cli', 'index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: path.join(__dirname, 'dist', 'index.js'),
  external: ['node_modules'],
  minify: true,
  sourcemap: true,
};

esbuild.build(buildOptions).then(() => {
  console.log('Build completed successfully!');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});