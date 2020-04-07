import * as React from 'react'
import {
  Box,
  Grid,
  Typography,
  ButtonGroup,
  Button,
  LinearProgress,
} from '@material-ui/core'
import PlayIcon from '@material-ui/icons/PlayArrow'
import SaveIcon from '@material-ui/icons/Save'

type ToolbarProps = {
  title: string
  subtitle: string
  modified?: boolean
  waiting?: boolean
  runQuery: () => void
  saveQuery: () => void
}
export default React.memo(
  ({
    title,
    subtitle,
    modified,
    waiting,
    runQuery,
    saveQuery,
  }: ToolbarProps) => (
    <Box ml={1} mr={1}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="caption">{subtitle}</Typography>
        </Grid>
        <Grid item>
          <ButtonGroup color="primary">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<PlayIcon />}
              onClick={runQuery}
            >
              Run
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<SaveIcon />}
              disabled={!modified}
              onClick={saveQuery}
            >
              Save
            </Button>
          </ButtonGroup>
        </Grid>
        {/* <Grid item>
        <ButtonGroup color="primary">
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => {}}
          >
            Edit
          </Button>
        </ButtonGroup>
      </Grid> */}
      </Grid>
      {waiting && <LinearProgress />}
    </Box>
  )
)
