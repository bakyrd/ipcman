import { Stack } from '@fluentui/react'
import type { FC } from 'react'
import { TimelineTable } from '../components/timeline/table'
import { useRemote } from '../services/remote'

export const TimelinePage: FC = () => {
  const remote = useRemote()

  return (
    <Stack horizontal>
      <Stack grow>
        <TimelineTable items={remote.data} />
      </Stack>
      <Stack />
    </Stack>
  )
}
