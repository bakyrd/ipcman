import { Pivot, PivotItem, Stack, Toggle } from '@fluentui/react'
import type { FC, MouseEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useRemote, type IpcManItem } from '../../../services/remote'
import { CodeInspector } from './code'
import styles from './index.module.scss'
import { useSelectedRow } from '../../../states'

type Tab = 'request' | 'response'

export const TimelineInspector: FC<{
  item: IpcManItem | undefined
}> = ({ item }) => {
  const [tab, setTab] = useState<Tab>('request')
  const [value, setValue] = useState('')
  const [folding, setFolding] = useState(false)
  const remote = useRemote()

  // Use useEffect to compute value and set tab in a single render.
  useEffect(() => {
    if (!item) {
      setTab('request')
      setValue('')
      return
    }

    let newTab = tab

    if (item.data.requestArgs && !item.data.responseArgs) newTab = 'request'
    if (!item.data.requestArgs && item.data.responseArgs) newTab = 'response'

    if (newTab !== tab) setTab(newTab)
    setValue(
      JSON.stringify(
        newTab === 'request' ? item?.data.requestArgs : item?.data.responseArgs,
        null,
        2,
      ),
    )
  }, [tab, item])

  const { setSelectedRow } = useSelectedRow()

  const handleTabClick = useCallback((itemTab?: PivotItem) => {
    if (itemTab) {
      const newTab = itemTab.props.itemKey as Tab
      // find the corresponding data
      const data = item?.data && remote.data.findLast(d => d?.data?.bindId === item?.data?.bindId && d?.data?.type !== item?.data?.type)
      // console.log(data, item, data?.data?.bindId, item?.data?.bindId)
      if (data) {
        setSelectedRow(data.index - 1)
      } else {
        setTab(v => v)
      }
    }
  }, [remote])

  const handleFoldingToggle = useCallback(
    (_: MouseEvent, v: boolean | undefined) => setFolding(v),
    [],
  )

  return (
    <Stack grow>
      <Stack className={styles.header} horizontal>
        <Stack horizontalAlign="stretch" grow>
          <Pivot
            overflowBehavior="menu"
            overflowAriaLabel="More Inspector Tools"
            selectedKey={tab}
            onLinkClick={handleTabClick}
          >
            <PivotItem
              headerText="Request"
              itemIcon="Installation"
              itemKey="request"
            />
            <PivotItem
              headerText="Response"
              itemIcon="PublishContent"
              itemKey="response"
            />
          </Pivot>
        </Stack>
        <Stack horizontalAlign="end" verticalAlign="center">
          <Toggle
            className={styles.toggle}
            label="Folding"
            onText="On"
            offText="Off"
            inlineLabel
            checked={folding}
            onChange={handleFoldingToggle}
          />
        </Stack>
      </Stack>
      <CodeInspector value={value} folding={folding} />
    </Stack>
  )
}
