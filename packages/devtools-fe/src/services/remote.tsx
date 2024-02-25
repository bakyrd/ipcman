import { freeze } from 'immer'
import type { IpcManBindData, IpcManData } from 'ipcman'
import type { FC, ReactNode } from 'react'
import { createContext, useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'

export interface IpcManInfo {
  startTime: number
}

export interface IpcManItem {
  index: number
  timestamp: number
  data: IpcManData & {
    requestArgs?: unknown[]
    responseArgs?: unknown[]
  }
}

export interface RemoteIntl {
  data: IpcManItem[]
  info: IpcManInfo
}

const defultRemote = {
  data: [],
  info: {
    startTime: new Date().getTime(),
  },
}

export interface Remote extends RemoteIntl {}

export const RemoteContext = createContext<RemoteIntl>(defultRemote)

export const useRemote = (): Remote => {
  const { data, info } = useContext(RemoteContext)

  return {
    data,
    info,
  }
}

export const RemoteProvider: FC<{
  children?: ReactNode
}> = ({ children }) => {
  const [data, editData] = useImmer<RemoteIntl>(defultRemote)

  useEffect(() => {
    const ws = new WebSocket(
      location.origin.replace(/^http/, 'ws') + '/v0/events',
    )

    ws.addEventListener('message', (e) => {
      const newData = JSON.parse(e.data as string) as IpcManItem[]

      editData((draft) => {
        newData.forEach((d) => {
          switch (d.data.type) {
            case 'event':
              d.data.responseArgs = d.data.args
              break

            case 'request':
              d.data.requestArgs = d.data.args
              break

            case 'handle-request':
              d.data.requestArgs = d.data.args
              break

            case 'handle-response':
              d.data.responseArgs = d.data.args
              break

            case 'wrapped-request':
              d.data.requestArgs = d.data.args
              break

            case 'wrapped-response':
              d.data.responseArgs = d.data.args
              break
          }

          freeze(d)

          draft.data.push(d)
        })

        draft.data.forEach((x) => {
          if (x.data.responseArgs) return
          if (
            x.data.type !== 'handle-request' &&
            x.data.type !== 'wrapped-request'
          )
            return
          // if (!x.data.id) return

          // const rType = x.data.type.replace('request', 'response') as
          //   | 'handle-response'
          //   | 'wrapped-response'

          // const r = newData.find((y) => y.data.type === rType)

          const r = newData.find(
            (y) =>
              (x.data as IpcManBindData).id === (y.data as IpcManBindData).id,
          )

          if (r) {
            // x.data.requestArgs = x.data.args
            x.data.responseArgs = r.data.args
            r.data.requestArgs = x.data.args
            // r.data.responseArgs = r.data.args
          }
        })
      })
    })

    return () => ws.close()
  }, [])

  useEffect(
    () =>
      void (async () => {
        const info = (await (await fetch('/v0/info')).json()) as IpcManInfo
        editData((draft) => void (draft.info = info))
      })(),
    [],
  )

  return <RemoteContext.Provider value={data} children={children} />
}
