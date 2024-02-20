import { rm } from 'fs/promises'
import { resolve } from 'node:path'

void Promise.all(
  [
    '../build',
    '../packages/ipcman/cjs',
    '../packages/ipcman/esm',
    '../packages/ipcman/tsconfig.cjs.tsbuildinfo',
    '../packages/ipcman/tsconfig.tsbuildinfo',
    '../packages/devtools/lib',
    '../packages/devtools-fe/build',
  ].map((x) =>
    rm(resolve(__dirname, x), {
      force: true,
      recursive: true,
    }),
  ),
)
