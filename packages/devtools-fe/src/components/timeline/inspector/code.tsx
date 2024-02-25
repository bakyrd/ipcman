import { Spinner, SpinnerSize, Stack } from '@fluentui/react'
import type { OnMount } from '@monaco-editor/react'
import { Editor } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'

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
  folding: boolean
}> = ({ value, folding }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor
  }

  useEffect(() => {
    editorRef.current?.setPosition({
      lineNumber: 1,
      column: 1,
    })
    if (folding)
      void editorRef.current?.getAction('editor.foldRecursively')?.run()
    else void editorRef.current?.getAction('editor.unfoldAll')?.run()
  }, [value, folding])

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
