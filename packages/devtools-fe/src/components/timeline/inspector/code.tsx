import { Spinner, SpinnerSize, Stack } from '@fluentui/react'
import { Editor } from '@monaco-editor/react'
import type { FC } from 'react'

const options = {
  domReadOnly: true,
  readOnly: true,
}

const loading = (
  <Spinner
    label="Loading..."
    ariaLive="assertive"
    labelPosition="top"
    size={SpinnerSize.large}
  />
)

export const CodeInspector: FC<{
  value: string
}> = ({ value }) => {
  return (
    <Stack grow>
      <Editor
        height="100%"
        options={options}
        loading={loading}
        theme="vs-dark"
        language="json"
        value={value}
      />
    </Stack>
  )
}
