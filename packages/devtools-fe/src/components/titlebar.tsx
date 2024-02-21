import { Pivot, PivotItem, Stack, Text } from '@fluentui/react'
import { useInterval } from 'ahooks'
import type { FC } from 'react'
import { useState } from 'react'
import { useRemote } from '../services/remote'
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

const Timer: FC = () => {
  const { info } = useRemote()

  const [now, setNow] = useState(() => new Date().getTime())

  useInterval(() => setNow(new Date().getTime()), 400)

  return (
    <Stack>
      <Text>+{Math.floor((now - info.startTime) / 1000)}</Text>
    </Stack>
  )
}
