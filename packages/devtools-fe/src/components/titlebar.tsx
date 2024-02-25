import { Pivot, PivotItem, Stack } from '@fluentui/react'
import type { FC } from 'react'
import { Timer } from './timer'
import styles from './titlebar.module.scss'

export const TitleBar: FC = () => {
  return (
    <Stack
      className={styles.titleBar!}
      horizontal
      horizontalAlign="space-between"
    >
      <Stack horizontal horizontalAlign="start"></Stack>
      <Stack horizontal horizontalAlign="center">
        <Pivot overflowBehavior="menu" overflowAriaLabel="More Views">
          <PivotItem
            headerText="Timeline"
            itemIcon="TimelineProgress"
            itemKey="timeline"
          />
        </Pivot>
      </Stack>
      <Stack horizontal horizontalAlign="end">
        <Timer />
      </Stack>
    </Stack>
  )
}
