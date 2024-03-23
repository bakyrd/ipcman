import { Stack } from '@fluentui/react'
import type { RowSelectionState } from '@tanstack/react-table'
import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { TimelineInspector } from '../components/timeline/inspector'
import { TimelineTable } from '../components/timeline/table'
import { useRemote } from '../services/remote'
import styles from './timeline.module.scss'
import { useSelectedRow } from '../states'

export const TimelinePage: FC = () => {
  const { data } = useRemote()

  const {selectedRow, setSelectedRow} = useSelectedRow()

  return (
    <Stack className={styles.timelinePageContainer} horizontal grow>
      <Stack className={styles.tableContainer}>
        <TimelineTable
          rowSelection={selectedRow}
          handleRowSelection={setSelectedRow}
        />
      </Stack>
      <Stack className={styles.inspectorContainer}>
        <TimelineInspector item={data[selectedRow]} />
      </Stack>
    </Stack>
  )
}
