import { Stack } from '@fluentui/react'
import type { FC } from 'react'
import { TimelinePage } from '../pages/timeline'
import { ConfigPage } from '../pages/config'
import styles from './root.module.scss'
import { TitleBar } from './titlebar'
import { useCurrentPage } from '../states'

export const Root: FC = () => {
  const {currentPage, setCurrentPage} = useCurrentPage()
  console.log(currentPage)

  return <Stack className={styles.root}>
    <TitleBar />
    {currentPage === 'timeline' && <TimelinePage />}
    {currentPage === 'settings' && <ConfigPage />}
  </Stack>
}
