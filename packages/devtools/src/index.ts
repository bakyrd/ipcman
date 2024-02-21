import { bodyParser } from '@koa/bodyparser'
import Router from '@koa/router'
import type { IpcManConfig, IpcManData } from 'ipcman'
import { ipcMan } from 'ipcman'
import Koa from 'koa'
import serve from 'koa-static'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { WebSocketServer } from 'ws'

export * from 'ipcman'

export interface IpcManDevtoolsConfig extends Omit<IpcManConfig, 'handler'> {}

interface Item {
  index: number
  data: IpcManData
}

export const ipcManDevtools = async (config: IpcManDevtoolsConfig) => {
  const parsedConfig = Object.assign({}, config)

  let i = 0
  const items: Item[] = []

  const pushHandlers: ((raw: string) => void)[] = []

  const handler = (data: IpcManData) => {
    const index = i++
    const item = {
      index,
      data,
    }
    items.push(item)
    pushHandlers.forEach((x) => x(JSON.stringify([item])))
  }

  ipcMan({
    ...parsedConfig,
    handler,
  })

  const app = new Koa()
  const router = new Router({
    prefix: '/v0',
  })

  router.post('/get', (ctx) => {
    const { start, end } = ctx.request.body as {
      start?: number
      end?: number
    }

    ctx.body = items.slice(start, end)
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const server = createServer(app.callback())

  const wsServer = new WebSocketServer({
    server,
    path: '/v0/events',
  })

  wsServer.on('connection', (ws) => {
    const fn = ws.send.bind(ws)
    ws.on('close', () => {
      pushHandlers.splice(pushHandlers.indexOf(fn), 1)
    })
    pushHandlers.push(fn)

    ws.send(JSON.stringify(items))
  })

  app

    .use(serve(join(__dirname, 'build')))

    .use(bodyParser())
    .use(async (ctx, next) => {
      ctx.request.body ||= {}
      await next()
    })

    .use(router.routes())
    .use(router.allowedMethods())

  server.listen(9009)
}
