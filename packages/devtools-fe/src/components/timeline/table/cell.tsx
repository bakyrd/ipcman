import { Icon, Stack } from '@fluentui/react'
import { clsx } from 'clsx/lite'
import type { IpcManData } from 'ipcman'
import type { FC } from 'react'
import styles from './cell.module.scss'
import { useRemote } from '../../../services/remote'

export const TextCell: FC<{
  children: string
}> = ({ children }) => {
  return (
    <div
      className={
        children ? styles.textCellContainer : styles.textCellContainerEmpty
      }
    >
      <div
        className={children ? styles.textCell : styles.textCellEmpty}
        children={children}
      />
    </div>
  )
}

export const HeaderCell: FC<{
  children: string
}> = ({ children }) => (
  <Stack className={styles.headerCellContainer!}>
    <div className={styles.headerCell} children={children} />
  </Stack>
)

export const IndexCell: FC<{
  index: number
  timestamp: number
}> = ({ index, timestamp }) => {
  const { info } = useRemote()

  return (
    <Stack className={styles.indexCellContainer!}>
      <Stack className={styles.indexCell!}>
        <div className={styles.indexCellIndex} children={index} />
        <div className={styles.indexCellTimestamp}>
          +{((timestamp - info.startTime) / 1000).toFixed(3)}
        </div>
      </Stack>
    </Stack>
  )
}

const typeMap = {
  event: (
    <>
      <Icon iconName="PublishContent" />
      <span>EVT</span>
    </>
  ),
  request: (
    <>
      <Icon iconName="Installation" />
      <span>REQ</span>
    </>
  ),
  'handle-request': (
    <>
      <Icon iconName="Installation" />
      <span>HRQ</span>
    </>
  ),
  'handle-response': (
    <>
      <Icon iconName="PublishContent" />
      <span>HRS</span>
    </>
  ),
  'wrapped-request': (
    <>
      <Icon iconName="Installation" />
      <span>WRQ</span>
    </>
  ),
  'wrapped-response': (
    <>
      <Icon iconName="PublishContent" />
      <span>WRS</span>
    </>
  ),
} as const

export const TypeCell: FC<{
  type: IpcManData['type']
}> = ({ type }) => (
  <Stack
    className={clsx(styles.typeCellContainer, styles[`typeCellType-${type}`])}
  >
    <div className={styles.typeCell} children={typeMap[type]} />
  </Stack>
)
