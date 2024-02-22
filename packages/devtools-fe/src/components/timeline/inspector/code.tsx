import { Spinner, SpinnerSize, Stack } from '@fluentui/react'
import type { OnMount } from '@monaco-editor/react'
import { Editor } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import type { FC } from 'react'
import { useRef } from 'react'

const options: editor.IStandaloneEditorConstructionOptions = {
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
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor
  }

  return (
    <Stack grow>
      <Editor
        height="100%"
        options={options}
        loading={loading}
        theme="vs-dark"
        language="json"
        value={value}
        onMount={handleEditorDidMount}
      />
    </Stack>
  )
}
