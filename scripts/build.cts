import { build } from 'esbuild'
import { copyFile } from 'fs/promises'

void (async () => {
  const startTs = Date.now()
  await Promise.all([build({
    entryPoints: ['packages/ipcman/src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    external: ['fs/promises', 'node:path', 'electron'],
    sourcemap: true,
    outfile: 'build/ipcman.js',
  }), build({
    entryPoints: ['packages/ipcman/src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    external: ['fs/promises', 'node:path', 'electron'],
    sourcemap: true,
    outfile: 'packages/ipcman/cjs/index.js',
    format: 'cjs'
  }), build({
    entryPoints: ['packages/ipcman/src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    external: ['fs/promises', 'node:path', 'electron'],
    sourcemap: true,
    outfile: 'packages/ipcman/esm/index.js',
    format: 'esm'
  })])



  await build({
    entryPoints: ['packages/devtools/src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    external: ['fs/promises', 'node:path', 'electron'],
    sourcemap: true,
    outfile: 'build/devtools.js',
  })

  await copyFile('build/devtools.js','packages/devtools/lib/index.js')

  console.log(`Build complete in ${Date.now() - startTs}ms`)
})()
