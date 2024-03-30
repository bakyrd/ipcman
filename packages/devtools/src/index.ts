/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { bodyParser } from '@koa/bodyparser'
import cors from '@koa/cors'
import Router from '@koa/router'
import type { IpcMan } from 'ipcman'
import { ipcMan } from 'ipcman'
import Koa from 'koa'
import serve from 'koa-static'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { WebSocketServer } from 'ws'

export * from 'ipcman'

export interface IpcManDevtoolsConfig
  extends Omit<IpcMan.IpcManConfig, 'handler'> {
  port?: number
  host?: string
}

interface Item {
  index: number
  timestamp: number
  data: IpcMan.Data
}

interface DevtoolsPlugin {
  name: string
  apply: (ctx: IpcManDevtoolsContext) => void
}

interface IpcManDevtoolsContext {
  register: (plugin: DevtoolsPlugin) => void
  emit: (data: IpcMan.Data) => void
  config: IpcManDevtoolsConfig
}

export const ipcManDevtoolsRaw: (config: IpcManDevtoolsConfig) => IpcManDevtoolsContext
  = (config: IpcManDevtoolsConfig) => {
    const parsedConfig = Object.assign(
      {
        port: 9009,
      },
      config,
    )

    const startTime = new Date().getTime()

    let i = 1
    const items: Item[] = []

    const pushHandlers: ((raw: string) => void)[] = []

    const emit = (data: IpcMan.Data) => {
      if (data.type.endsWith('after')) return
      const index = i++
      const item = {
        index,
        timestamp: new Date().getTime(),
        data,
      }
      items.push(item)
      pushHandlers.forEach((x) => x(JSON.stringify([item])))
    }

    const app = new Koa()
    const router = new Router({
      prefix: '/v0',
    })

    router.get('/info', (ctx) => {
      ctx.body = {
        startTime,
      }
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fn = ws.send.bind(ws)
      ws.on('close', () => {
        pushHandlers.splice(pushHandlers.indexOf(fn), 1)
      })
      pushHandlers.push(fn)

      ws.send(JSON.stringify(items))
    })

    const DEVTOOLS_BUILD_PATH =
      process.env.DEVTOOLS_BUILD_PATH || join(__dirname, 'build')

    let frontendErrMsg: string | null = null
    // Check if build folder exists
    if (
      !existsSync(DEVTOOLS_BUILD_PATH) ||
      !existsSync(join(DEVTOOLS_BUILD_PATH, 'index.html'))
    ) {
      frontendErrMsg = `ipcman: Frontend build does not exist, should be placed in ${DEVTOOLS_BUILD_PATH}`
      console.warn(frontendErrMsg)
    }

    app.use(cors())

    if (!frontendErrMsg) {
      app.use(serve(DEVTOOLS_BUILD_PATH))
    } else {
      app.use(async (ctx) => {
        ctx.body = frontendErrMsg
      })
    }

    app
      .use(bodyParser())
      .use(async (ctx, next) => {
        ctx.request.body ||= {}
        await next()
      })

      .use(router.routes())
      .use(router.allowedMethods())

    server.listen(parsedConfig.port, parsedConfig.host)

    console.log(
      `ipcman-devtools: Listening on ${parsedConfig.host}:${parsedConfig.port}`,
    )

    const ctx = {
      register: (plugin: DevtoolsPlugin) => plugin.apply(ctx),
      emit,
      config: parsedConfig,
    }

    return ctx
  }

export const ipcManDevtoolsIPC: (config: IpcManDevtoolsConfig) => IpcManDevtoolsContext = (config: IpcManDevtoolsConfig)=>{
  const ctx = ipcManDevtoolsRaw(config)
  ipcMan({
    ...config,
    rawHandler: ctx.emit,
  })
  return ctx;
}

export const ipcManDevtools = ipcManDevtoolsIPC
