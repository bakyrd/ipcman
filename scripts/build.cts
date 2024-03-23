import { build } from 'esbuild'

void (async () => {
  const startTs = Date.now()
  await build({
    entryPoints: ['packages/ipcman/src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    external: ['fs/promises', 'node:path', 'electron'],
    sourcemap: true,
    outfile: 'build/ipcman.js',
  })

  await build({
    entryPoints: ['packages/devtools/src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    external: ['fs/promises', 'node:path', 'electron'],
    sourcemap: true,
    outfile: 'build/devtools.js',
  })

  console.log(`Build complete in ${Date.now() - startTs}ms`)
})()
