import { Pivot, PivotItem, Stack } from '@fluentui/react'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { CodeInspector } from './code'

type Tab = 'request' | 'response'

export const TimelineInspector: FC = () => {
  const [tab, setTab] = useState<Tab>('request')

  const handleTabClick = useCallback((item?: PivotItem) => {
    if (item) setTab(item.props.itemKey! as Tab)
  }, [])

  return (
    <Stack>
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
      <CodeInspector />
    </Stack>
  )
}
