import type { IpcManData } from 'ipcman'
import type { FC, ReactNode } from 'react'
import { createContext, useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'

export interface IpcManInfo {
  startTime: number
}

export interface IpcManItem {
  index: number
  timestamp: number
  data: IpcManData
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

      editData((draft) =>
        newData.forEach((d) => {
          if (draft.data.findIndex((x) => x.index === d.index) === -1)
            draft.data.push(d)
        }),
      )
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
