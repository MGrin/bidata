import * as React from 'react'
import { Box } from '@material-ui/core'
import Value from '../Value'
import { ResultProps } from '.'

export default React.memo(({ data, settings }: ResultProps) => (
  <Box
    display="flex"
    flexDirection="row"
    alignItems="center"
    justifyContent="center"
    height="calc(100% - 50px)"
  >
    <Value gutterBottom variant="h2">
      {settings.key ? data[0][settings.key] : data[0]}
    </Value>
  </Box>
))
