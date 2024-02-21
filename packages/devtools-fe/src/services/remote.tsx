import type { IpcManData } from 'ipcman'
import type { FC, ReactNode } from 'react'
import { createContext, useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'

export interface Remote {
  data: IpcManData[]
}

export const RemoteContext = createContext<IpcManData[]>([])

export const useRemote = (): Remote => {
  const data = useContext(RemoteContext)

  return {
    data,
  }
}

export const RemoteProvider: FC<{
  children?: ReactNode
}> = ({ children }) => {
  const [data, editData] = useImmer<IpcManData[]>([])

  useEffect(() => {
    const ws = new WebSocket(
      location.origin.replace(/^http/, 'ws') + '/v0/events',
    )

    ws.addEventListener('message', (e) => {
      const newData = JSON.parse(e.data as string) as {
        index: number
        data: IpcManData
      }[]

      editData((draft) => newData.forEach((d) => (draft[d.index] ||= d.data)))
    })

    return () => ws.close()
  }, [])

  return <RemoteContext.Provider value={data} children={children} />
}
