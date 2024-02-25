import { Stack, Text } from '@fluentui/react'
import { useInterval } from 'ahooks'
import type { FC } from 'react'
import { useState } from 'react'
import { useRemote } from '../services/remote'
import styles from './timer.module.scss'

export const Timer: FC = () => {
  const { info } = useRemote()

  const [now, setNow] = useState(() => new Date().getTime())

  useInterval(() => setNow(new Date().getTime()), 400)

  return (
    <Stack className={styles.timerTextContainer!} verticalAlign="center">
      <Text className={styles.timerText!}>
        +{Math.floor((now - info.startTime) / 1000)}
      </Text>
    </Stack>
  )
}
