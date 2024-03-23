import type EventEmitter from 'node:events'

import type {
  IpcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  WebContents,
} from 'electron'

// eslint-disable-next-line import/no-unresolved
import { ipcMain } from 'electron'

export namespace IpcMan {
  export type IpcEvent<S extends symbol> = Omit<IpcMainEvent, 'sender'> & {
    sender: WebContents & Record<S, boolean>
  }

  export type IpcSender<IpcArgs extends unknown[] = unknown[]> = (
    channel: string,
    ...detail: IpcArgs
  ) => void

  export interface BaseData {
    channel: string
    args: unknown[]
  }

  export type SendData = (
    | {
        type: 'send'
        cancellable: true
      }
    | {
        type: 'send-after'
        cancellable: false
      }
  ) &
    BaseData &
    (
      | {
          binded: true
          bindId: string
          bindData: ReceiveData | null
        }
      | {
          binded: false
          bindId: null
          bindData: null
        }
    )

  export type ReceiveData = (
    | {
        type: 'receive'
        cancellable: true
      }
    | {
        type: 'receive-after'
        cancellable: false
      }
  ) &
    BaseData &
    (
      | {
          binded: true
          bindId: string
          bindData: SendData | null
        }
      | {
          binded: false
          bindId: null
          bindData: null
        }
    )

  export type Data = SendData | ReceiveData

  export type EventContext<T extends Data['type']> = {
    stopPropagation: () => void
  } & (Extract<Data, { type: T }> extends infer U
    ? U extends Data
      ? U
      : never
    : never) &
    (Extract<Data, { type: T }> extends {
      cancellable: true
    }
      ? { cancel: () => void }
      : object)

  type Awaitable<T> = T | Promise<T>

  export interface IpcManConfig<IpcArgs extends unknown[] = unknown[]> {
    rawHandler: (data: EventContext<Data['type']>) => Awaitable<unknown>
    getId?: (p: IpcArgs) => string | undefined
    enableRequestCache?: boolean
    requestCacheMaxAge?: number
  }

  export type IpcManEventHandler<T extends Data['type']> =
    Extract<Data, { type: T }> extends { cancellable: true }
      ? (
          data: EventContext<T>,
        ) => Awaitable<
          | ((
              data: EventContext<
                T extends 'send' ? 'send-after' : 'receive-after'
              >,
            ) => Awaitable<void>)
          | undefined
        >
      : (data: EventContext<T>) => Awaitable<void>

  export interface IpcManContext {
    emit: EventEmitter['emit']
    senderExcludeSymbol: symbol
    on: <T extends Data['type']>(
      type: T,
      handler: IpcManEventHandler<T>,
    ) => IpcManContext
    remove: (handler: unknown) => void
    once: <T extends Data['type']>(
      type: T,
      handler: IpcManEventHandler<T>,
    ) => IpcManContext
  }

  export const ipcMan = <IpcArgs extends unknown[] = unknown[]>(
    _config: IpcManConfig<IpcArgs>,
  ): IpcManContext => {
    const senderExcludeSymbol: unique symbol = Symbol()
    const config = {
      enableRequestCache: true,
      requestCacheMaxAge: 1000 * 10,
      ..._config,
    }

    const eventHandlers = new Map<Data['type'], Set<unknown>>()

    const receiveEventCache = new Map<
      string,
      { data: ReceiveData; timestamp: number }
    >()

    const cleanCache = () => {
      if (config.requestCacheMaxAge === 0) return
      const now = Date.now()
      for (const [id, { timestamp }] of receiveEventCache) {
        if (now - timestamp > config.requestCacheMaxAge) {
          receiveEventCache.delete(id)
        }
      }
    }

    if (config.enableRequestCache) {
      setInterval(cleanCache, config.requestCacheMaxAge / 5)
    }

    let ctxRef: IpcManContext | null = null

    const emitManEvent = async <
      T extends EventContext<R> | { stopPropagation?: undefined },
      R extends Data['type'],
    >(
      type: R,
      _context: T,
    ) => {
      let stopPropagation = false
      const context = {
        stopPropagation() {
          stopPropagation = true
        },
        ..._context,
      } as EventContext<R>

      config.rawHandler?.(context)
      if (stopPropagation) return

      const set = eventHandlers.get(type)
      for (const handler of set ?? []) {
        const res = await (handler as IpcManEventHandler<R>)(
          context as unknown as EventContext<R>,
        )

        if (res && !type.endsWith('after')) {
          ctxRef!.once(
            (type + '-after') as unknown as R,
            res as IpcManEventHandler<R>,
          )
        }

        if (stopPropagation) return
      }
    }

    const emit = ipcMain.emit.bind(ipcMain)
    ipcMain.emit = function (
      this: IpcMain,
      eventName: string | symbol,
      event: IpcEvent<typeof senderExcludeSymbol>,
      ...p: IpcArgs
    ) {
      void (async () => {
        const sender = event.sender
        if (!sender[senderExcludeSymbol]) {
          sender[senderExcludeSymbol] = true

          const send = sender.send.bind(sender)
          sender.send = function (channel, ...e) {
            void (async () => {
              const id = config.getId?.(e as IpcArgs)
              const ref = null //receiveEventCache.get(id ?? '')
              let cancelled = false

              const data = {
                type: 'send',
                channel,
                args: e,
                binded: !!id,
                bindId: id ?? null,
                bindData: null,
                cancellable: true,
              } as SendData

              // if (ref) {
              //   ref.data.binded = true
              //   ref.data.bindId = id!
              //   ref.data.bindData = data
              // }

              await emitManEvent('send', {
                ...data,
                cancellable: true,
                cancel() {
                  cancelled = true
                },
              } as unknown as EventContext<'send'>)

              if (cancelled) return
              send.call(this, channel, ...(e as unknown[]))

              await emitManEvent('send-after', {
                ...data,
                cancellable: false,
              } as unknown as EventContext<'send-after'>)

              if (ref) {
                receiveEventCache.delete(id!)
              }
            })()
          }
        }

        const id = config.getId?.(p)

        const data: ReceiveData = {
          type: 'receive',
          channel: eventName as string,
          args: p,
          binded: !!id,
          bindId: id,
          bindData: null,
          cancellable: true,
        } as ReceiveData

        // receiveEventCache.set(id!, { data, timestamp: Date.now() })

        let cancelled = false
        await emitManEvent('receive', {
          ...data,
          cancellable: true,
          cancel() {
            cancelled = true
          },
        } as unknown as EventContext<'receive'>)

        if (cancelled) return
        emit.call(this, eventName, event, ...p)

        await emitManEvent('receive-after', {
          ...data,
          cancellable: false,
        } as unknown as EventContext<'receive-after'>)
      })()
      return false
    }

    const handle = ipcMain.handle.bind(ipcMain)
    ipcMain.handle = function (method, fn) {
      if (typeof fn !== 'function') {
        throw new TypeError(
          `ipcman: Expected handler to be a function, but found type '${typeof fn}'`,
        )
      }

      const wrappedFn = async (
        event: IpcMainInvokeEvent,
        ...args: unknown[]
      ) => {
        const dataReceive = {
          type: 'receive',
          channel: method,
          args,
          binded: false,
          bindId: null,
          bindData: null,
          cancellable: true,
        } as ReceiveData

        let cancelled = false
        await emitManEvent('receive', {
          ...dataReceive,
          cancellable: true,
          cancel() {
            cancelled = true
          },
        } as unknown as EventContext<'receive'>)

        const result = cancelled
          ? undefined
          : ((await Promise.resolve(fn(event, ...args))) as unknown)

        const resArr = [result]

        await emitManEvent('receive-after', {
          ...dataReceive,
          cancellable: false,
        } as unknown as EventContext<'receive-after'>)

        await emitManEvent('send', {
          type: 'send',
          channel: method,
          args: resArr,
          binded: false,
          bindId: null,
          bindData: null,
          cancellable: true,
        } as unknown as EventContext<'send'>)

        return resArr[0]
      }

      handle.call(this, method, wrappedFn)
    }

    const addEventListener: IpcManContext['on'] = (type, handler) => {
      if (!eventHandlers.has(type)) eventHandlers.set(type, new Set())
      const set = eventHandlers.get(type)

      if (!set?.has(handler)) set?.add(handler)
      return ctxRef!
    }

    const ctx = {
      emit,
      senderExcludeSymbol,
      on: addEventListener,
      remove(handler: unknown) {
        for (const [_, set] of eventHandlers) if (set.delete(handler)) return
      },
      once(type, handler) {
        const wrappedHandler = (async (context) => {
          const res = await handler(context)
          ctxRef!.remove(wrappedHandler)
          return res
        }) as IpcManEventHandler<typeof type>
        return ctxRef!.on(type, wrappedHandler)
      },
    } as IpcManContext

    ctxRef = ctx

    return ctx
  }
}

export const ipcMan = IpcMan.ipcMan
