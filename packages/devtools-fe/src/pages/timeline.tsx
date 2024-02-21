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

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const selected = useMemo(() => {
    const [key] = Object.keys(rowSelection)
    if (key) return data[Number(key)]
    return undefined
  }, [rowSelection, data])

  return (
    <Stack className={styles.timelinePageContainer!} horizontal grow>
      <Stack className={styles.tableContainer!}>
        <TimelineTable
          rowSelection={rowSelection}
          handleRowSelection={setRowSelection}
        />
      </Stack>
      <Stack className={styles.inspectorContainer!}>
        <TimelineInspector item={selected} />
      </Stack>
    </Stack>
  )
}
