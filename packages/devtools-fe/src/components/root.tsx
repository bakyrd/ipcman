import type { FC } from 'react'
import { TimelinePage } from '../pages/timeline'
import { TitleBar } from './titlebar'

export const Root: FC = () => (
  <>
    <TitleBar />
    <TimelinePage />
  </>
)
