import type {
  IpcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  WebContents,
} from 'electron'
import { ipcMain } from 'electron'
import type EventEmitter from 'node:events'

export type IpcEvent<S extends symbol> = Omit<IpcMainEvent, 'sender'> & {
  sender: WebContents & Record<S, boolean>
}

export type IpcSender<IpcArgs extends unknown[] = unknown[]> = (
  channel: string,
  ...detail: IpcArgs
) => void

export interface IpcManDataBase {
  channel: string
  args: unknown[]
}

export interface IpcManBindData extends IpcManDataBase {
  id: string
}

export interface IpcManEventData extends IpcManDataBase {
  type: 'event'
}

export interface IpcManRequestData extends IpcManDataBase {
  type: 'request'
}

export interface IpcManHandleRequestData extends IpcManBindData {
  type: 'handle-request'
}

export interface IpcManHandleResponseData extends IpcManBindData {
  type: 'handle-response'
}

export interface IpcManWrappedRequestData extends IpcManBindData {
  type: 'wrapped-request'
}

export interface IpcManWrappedResponseData extends IpcManBindData {
  type: 'wrapped-response'
}

export type IpcManRequestDataAll =
  | IpcManRequestData
  | IpcManHandleRequestData
  | IpcManWrappedRequestData

export type IpcManResponseDataAll =
  | IpcManEventData
  | IpcManHandleResponseData
  | IpcManWrappedResponseData

export type IpcManData =
  | IpcManEventData
  | IpcManRequestData
  | IpcManHandleRequestData
  | IpcManWrappedRequestData
  | IpcManHandleResponseData
  | IpcManWrappedResponseData

type Awaitable<T> = T | Promise<T>

export interface IpcManConfig<IpcArgs extends unknown[] = unknown[]> {
  handler: (data: IpcManData) => Awaitable<unknown>
  getId?: (p: IpcArgs) => string | undefined
}

export interface IpcManContext {
  emit: EventEmitter['emit']
  senderExcludeSymbol: symbol
}

export const ipcMan = <IpcArgs extends unknown[] = unknown[]>(
  config: IpcManConfig<IpcArgs>,
): IpcManContext => {
  const senderExcludeSymbol: unique symbol = Symbol()

  let iHandle = 0

  const emit = ipcMain.emit.bind(ipcMain)
  ipcMain.emit = function (
    this: IpcMain,
    eventName: string | symbol,
    event: IpcEvent<typeof senderExcludeSymbol>,
    ...p: IpcArgs
  ) {
    const sender = event.sender
    if (!sender[senderExcludeSymbol]) {
      sender[senderExcludeSymbol] = true

      const send = sender.send.bind(sender)
      sender.send = function (channel, ...e) {
        send.call(this, channel, ...(e as unknown[]))

        const id = config.getId?.(e as IpcArgs)
        if (id)
          config.handler({
            type: 'wrapped-response',
            channel,
            args: e,
            id,
          })
        else
          config.handler({
            type: 'event',
            channel,
            args: e,
          })
      }
    }

    emit.call(this, eventName, event, ...p)

    const id = config.getId?.(p)
    if (id)
      config.handler({
        type: 'wrapped-request',
        channel: eventName as string,
        args: p,
        id,
      })
    else
      config.handler({
        type: 'request',
        channel: eventName as string,
        args: p,
      })

    return false
  }

  const handle = ipcMain.handle.bind(ipcMain)
  ipcMain.handle = function (method, fn) {
    const wrappedFn = async (event: IpcMainInvokeEvent, ...args: unknown[]) => {
      const id = `IPCMAN_HANDLE_${iHandle++}`

      config.handler({
        type: 'handle-request',
        channel: method,
        args,
        id,
      })

      const result = (await Promise.resolve(fn(event, ...args))) as unknown

      config.handler({
        type: 'handle-response',
        channel: method,
        args: [result],
        id,
      })

      return result
    }

    handle.call(this, method, wrappedFn)
  }

  return {
    emit,
    senderExcludeSymbol,
  }
}
