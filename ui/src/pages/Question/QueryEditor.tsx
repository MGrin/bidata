import * as React from 'react'
import { Box, Paper } from '@material-ui/core'
import MonacoEditor from 'react-monaco-editor'
import { AutoSizer } from 'react-virtualized'

type Props = {
  query: string
  driver: string
  onChange: (query: any) => void
}

const getLanguageFromDriver = (driver: string) => {
  if (driver === 'mongodb') {
    return 'javascript'
  }

  return 'sql'
}

export default React.memo(({ query, driver, onChange }: Props) => {
  const language = React.useMemo(() => getLanguageFromDriver(driver), [driver])
  return (
    <Box p={1} height="100%">
      <Paper style={{ height: '100%' }}>
        <AutoSizer>
          {({ width, height }) => (
            <MonacoEditor
              width={width}
              height={height}
              language={language}
              theme="vs-light"
              value={query || ''}
              options={{
                selectOnLineNumbers: true,
              }}
              onChange={onChange}
              editorDidMount={() => {}}
            />
          )}
        </AutoSizer>
      </Paper>
    </Box>
  )
})
