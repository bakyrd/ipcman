import { Pivot, PivotItem, Stack } from '@fluentui/react'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { IpcManItem } from '../../../services/remote'
import { CodeInspector } from './code'

type Tab = 'request' | 'response'

export const TimelineInspector: FC<{
  item: IpcManItem | undefined
}> = ({ item }) => {
  const [tab, setTab] = useState<Tab>('request')
  const [value, setValue] = useState('')

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

  return (
    <Stack grow>
      <Stack>
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
      <CodeInspector value={value} />
    </Stack>
  )
}
