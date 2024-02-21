import type { FC } from 'react'
import { TimelinePage } from '../pages/timeline'
import { TitleBar } from './titlebar'
import { Stack } from '@fluentui/react'
import styles from './root.module.scss'

export const Root: FC = () => (
  <>
    <Stack className={styles.root!}>
      <Stack>
        <TitleBar />
        <TimelinePage />
      </Stack>
    </Stack>
  </>
)
