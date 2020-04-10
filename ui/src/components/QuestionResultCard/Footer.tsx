import * as React from 'react'
import {
  Box,
  Typography,
  BoxProps,
  IconButton,
  Tooltip,
} from '@material-ui/core'
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab'
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ListIcon from '@material-ui/icons/List'
import AccessTimeIcon from '@material-ui/icons/AccessTime';
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
  const theme = useTheme()
  const isXS = useMediaQuery(theme.breakpoints.down('sm'))

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
        {!isXS && execution && (
          <Typography variant="caption">
            Ran <ReactTimeAgo date={parseISO(execution.created)} />
          </Typography>
        )}
        {isXS && execution && (
          <Tooltip
            disableFocusListener
            title={<ReactTimeAgo date={parseISO(execution.created)} locale="en" />}
            placement="top"
            arrow
          >
            <AccessTimeIcon fontSize="small" />
          </Tooltip>
        )}
      </Box>
      {!isXS && editable && settings.type !== 'scalar' && (
        <Box display="flex" flexDirection="row" alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={settings.type}
            exclusive
            onChange={handleVisualTypeChange}
          >
            <ToggleButton
              size={isXS ? 'small' : undefined}
              value={driver === 'mongodb' ? 'documents' : 'columns'}
            >
              <Tooltip title="Table" placement="top" arrow disableFocusListener>
                <ListIcon
                  color={
                    settings.type === 'documents' || settings.type === 'columns'
                      ? 'primary'
                      : undefined
                  }
                />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="chart.line" size={isXS ? 'small' : undefined}>
              <Tooltip title="Line chart" placement="top" arrow disableFocusListener>
                <TimelineIcon
                  color={settings.type === 'chart.line' ? 'primary' : undefined}
                />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="chart.pie" size={isXS ? 'small' : undefined}>
              <Tooltip title="Pie chart" placement="top" arrow disableFocusListener>
                <PieChartIcon
                  color={settings.type === 'chart.pie' ? 'primary' : undefined}
                />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="chart.bar" size={isXS ? 'small' : undefined}>
              <Tooltip title="Bar chart" placement="top" arrow disableFocusListener>
                <BarChartIcon
                  color={settings.type === 'chart.bar' ? 'primary' : undefined}
                />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="chart.bubble" size={isXS ? 'small' : undefined}>
              <Tooltip title="Bubble chart" placement="top" arrow disableFocusListener>
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
