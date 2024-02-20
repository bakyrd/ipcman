import { analyzeMetafile, context } from 'esbuild'
import { join } from 'node:path'
import { argv, cwd } from 'node:process'

const [_node, _tsNode, mode] = argv
const wd = cwd()

void (async () => {
  const ctx = await context({
    entryPoints: [join(wd, 'src/index.ts')],
    write: true,
    outdir: 'lib',

    platform: 'node',
    format: 'cjs',
    tsconfig: join(wd, 'tsconfig.json'),

    define: {},
    external: ['electron'],

    bundle: true,
    minify: true,
    sourcemap: false,

    metafile: true,
    color: true,
  })

  if (mode === 'watch') await ctx.watch()
  else {
    console.log(await analyzeMetafile((await ctx.rebuild()).metafile))
    await ctx.dispose()
  }
})()
