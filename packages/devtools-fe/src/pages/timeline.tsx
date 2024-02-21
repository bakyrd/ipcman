import { Stack } from '@fluentui/react'
import type { FC } from 'react'
import { TimelineTable } from '../components/timeline/table'
import { useRemote } from '../services/remote'
import styles from './timeline.module.scss'

export const TimelinePage: FC = () => {
  const remote = useRemote()

  return (
    <Stack horizontal>
      <Stack className={styles.tableContainer!} grow>
        <TimelineTable items={remote.data} />
      </Stack>
      <Stack />
    </Stack>
  )
}
