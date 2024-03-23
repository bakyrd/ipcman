import { Pivot, PivotItem, Stack } from '@fluentui/react'
import type { FC } from 'react'
import { Timer } from './timer'
import styles from './titlebar.module.scss'
import { useCurrentPage } from '../states'

export const TitleBar: FC = () => {
  const {setCurrentPage} = useCurrentPage()

  return (
    <Stack
      className={styles.titleBar}
      horizontal
      horizontalAlign="space-between"
    >
      <Stack horizontal horizontalAlign="start"></Stack>
      <Stack horizontal horizontalAlign="center">
        <Pivot overflowBehavior="none" overflowAriaLabel="More Views" onLinkClick={e=>{
          setCurrentPage(e?.props.itemKey)
        }}>
          <PivotItem
            headerText="Timeline"
            itemIcon="TimelineProgress"
            itemKey="timeline"
          />

          <PivotItem
            headerText="Settings"
            itemIcon="Settings"
            itemKey="settings"
          />

        </Pivot>
      </Stack>
      <Stack horizontal horizontalAlign="end">
        <Timer />
      </Stack>
    </Stack>
  )
}
