import { Pivot, PivotItem, Stack, Toggle } from '@fluentui/react'
import type { FC, MouseEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { IpcManItem } from '../../../services/remote'
import { CodeInspector } from './code'
import styles from './index.module.scss'

type Tab = 'request' | 'response'

export const TimelineInspector: FC<{
  item: IpcManItem | undefined
}> = ({ item }) => {
  const [tab, setTab] = useState<Tab>('request')
  const [value, setValue] = useState('')
  const [folding, setFolding] = useState(false)

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

  const handleTabClick = useCallback((item?: PivotItem) => {
    if (item) setTab(item.props.itemKey! as Tab)
  }, [])

  const handleFoldingToggle = useCallback(
    (_: MouseEvent, v: boolean | undefined) => setFolding(v!),
    [],
  )

  return (
    <Stack grow>
      <Stack horizontal>
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
