import { Pivot, PivotItem } from '@fluentui/react'
import type { FC } from 'react'
import { CodeInspector } from './code'

export const TimelineInspector: FC = () => {
  return (
    <Pivot overflowBehavior="menu" overflowAriaLabel="More Inspector Tools">
      <PivotItem headerText="Request" itemIcon="Installation">
        <CodeInspector />
      </PivotItem>
      <PivotItem headerText="Response" itemIcon="PublishContent">
        <CodeInspector />
      </PivotItem>
    </Pivot>
  )
}
