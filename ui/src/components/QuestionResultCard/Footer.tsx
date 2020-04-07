import * as React from 'react'
import {
  Box,
  Typography,
  BoxProps,
  IconButton,
  Tooltip,
} from '@material-ui/core'
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab'
import ListIcon from '@material-ui/icons/List'
import TimelineIcon from '@material-ui/icons/Timeline'
import PieChartIcon from '@material-ui/icons/PieChart'
import BarChartIcon from '@material-ui/icons/BarChart'
import BubbleChartIcon from '@material-ui/icons/BubbleChart'
import SettingsIcon from '@material-ui/icons/Settings'
// @ts-ignore
import ReactTimeAgo from 'react-time-ago'
import { parseISO } from 'date-fns'

type FooterProps = {
  children: React.ElementType
  settings: any
  execution: any
  driver: string
  editable: boolean
  requestVisualTypeChange: (type: string, settings: any) => void
  openVisualSettingsForm: () => void
} & BoxProps

export default ({
  children,
  settings,
  execution,
  driver,
  editable,
  requestVisualTypeChange,
  openVisualSettingsForm,
  ...props
}: FooterProps) => {
  const handleVisualTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: string | null
  ) => {
    if (newType) {
      requestVisualTypeChange(newType, settings)
    }
  }

  return (
    <Box
      {...props}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box p={2}>
        {execution && (
          <Typography variant="caption">
            Ran <ReactTimeAgo date={parseISO(execution.created)} />
          </Typography>
        )}
      </Box>
      {editable && settings.type !== 'scalar' && (
        <Box display="flex" flexDirection="row" alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={settings.type}
            exclusive
            onChange={handleVisualTypeChange}
          >
            <ToggleButton
              value={driver === 'mongodb' ? 'documents' : 'columns'}
            >
              <Tooltip title="Table" placement="top" arrow>
                <ListIcon
                  color={
                    settings.type === 'documents' || settings.type === 'columns'
                      ? 'primary'
                      : undefined
                  }
                />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="chart.line">
              <Tooltip title="Line chart" placement="top" arrow>
                <TimelineIcon
                  color={settings.type === 'chart.line' ? 'primary' : undefined}
                />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="chart.pie">
              <Tooltip title="Pie chart" placement="top" arrow>
                <PieChartIcon
                  color={settings.type === 'chart.pie' ? 'primary' : undefined}
                />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="chart.bar">
              <Tooltip title="Bar chart" placement="top" arrow>
                <BarChartIcon
                  color={settings.type === 'chart.bar' ? 'primary' : undefined}
                />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="chart.bubble">
              <Tooltip title="Bubble chart" placement="top" arrow>
                <BubbleChartIcon
                  color={
                    settings.type === 'chart.bubble' ? 'primary' : undefined
                  }
                />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Box ml={1}>
            {settings.type !== 'documents' && settings.type !== 'columns' && (
              <IconButton onClick={openVisualSettingsForm}>
                <SettingsIcon color="primary" className="clickable" />
              </IconButton>
            )}
          </Box>
        </Box>
      )}
      {settings.type === 'documents' || settings.type === 'columns' ? (
        children
      ) : (
        <Box />
      )}
    </Box>
  )
}
