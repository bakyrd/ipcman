import { Stack } from '@fluentui/react'
import type { FC } from 'react'
import { TimelineTable } from '../components/timeline/table'
import { useRemote } from '../services/remote'
import styles from './timeline.module.scss'
import { TimelineInspector } from '../components/timeline/inspector'

export const TimelinePage: FC = () => {
  const remote = useRemote()

  return (
    <Stack className={styles.timelinePageContainer!} horizontal grow>
      <Stack className={styles.tableContainer!} grow={2}>
        <TimelineTable items={remote.data} />
      </Stack>
      <Stack className={styles.inspectorContainer!} grow={1}>
        <TimelineInspector />
      </Stack>
    </Stack>
  )
}
