import { Stack } from '@fluentui/react'
import type { FC } from 'react'
import { TimelinePage } from '../pages/timeline'
import styles from './root.module.scss'
import { TitleBar } from './titlebar'

export const Root: FC = () => (
  <>
    <Stack className={styles.root!}>
      <TitleBar />
      <TimelinePage />
    </Stack>
  </>
)
