import { Stack } from '@fluentui/react'
import type { RowSelectionState } from '@tanstack/react-table'
import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { TimelineInspector } from '../components/timeline/inspector'
import { TimelineTable } from '../components/timeline/table'
import { useRemote } from '../services/remote'
import styles from './timeline.module.scss'

export const TimelinePage: FC = () => {
  const { data } = useRemote()

  const [selected, setRowSelection] = useState<number>(-1)

  return (
    <Stack className={styles.timelinePageContainer} horizontal grow>
      <Stack className={styles.tableContainer}>
        <TimelineTable
          rowSelection={selected}
          handleRowSelection={setRowSelection}
        />
      </Stack>
      <Stack className={styles.inspectorContainer}>
        <TimelineInspector item={data[selected]} />
      </Stack>
    </Stack>
  )
}
