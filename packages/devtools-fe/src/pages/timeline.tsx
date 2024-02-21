import type { FC } from 'react'
import { useRemote } from '../services/remote'

export const TimelinePage: FC = () => {
  const remote = useRemote()

  return <p>{JSON.stringify(remote.data)}</p>
}
