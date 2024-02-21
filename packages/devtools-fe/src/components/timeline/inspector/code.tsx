import { Spinner, SpinnerSize, Stack } from '@fluentui/react'
import { Editor } from '@monaco-editor/react'
import type { FC } from 'react'

const loading = (
  <Spinner
    label="Loading..."
    ariaLive="assertive"
    labelPosition="top"
    size={SpinnerSize.large}
  />
)

export const CodeInspector: FC = () => {
  return (
    <Stack>
      <Editor loading={loading} theme="dark" language="json" value="[]" />
    </Stack>
  )
}
