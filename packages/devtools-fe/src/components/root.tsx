import type { FC } from 'react'
import { Timeline } from '../pages/timeline'
import { TitleBar } from './titlebar'

export const Root: FC = () => (
  <>
    <TitleBar />
    <Timeline />
  </>
)
