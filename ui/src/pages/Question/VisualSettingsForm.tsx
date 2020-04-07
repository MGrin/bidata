import * as React from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  Input,
  Chip,
  MenuItem,
  Typography,
  Grid,
  DialogContentText,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core'
import { ColorPicker, ColorIcon } from '../../components'

const TYPE_NAMES: any = {
  'chart.line': 'Line chart',
  'chart.bar': 'Bar chart',
  'chart.pie': 'Pie chart',
  'chart.bubble': 'Bubblee chart',
  documents: 'Documents',
  columns: 'Table',
}

const X_AXIS_LABEL: any = {
  'chart.line': 'X-Axis',
  'chart.bar': 'X-Axis',
  'chart.bubble': 'X-Axis',
  'chart.pie': 'Categories',
}

const Y_AXIS_LABEL: any = {
  'chart.line': 'Y-Axis (multiple)',
  'chart.bar': 'Y-Axis (multiple)',
  'chart.bubble': 'Y-Axis',
  'chart.pie': 'Values',
}

type ChartFormProps = {
  values?: any
  columns?: string[]
  type: string
  onChange: (field: string, value: any) => void
}
const ChartForm = ({ values, columns, type, onChange }: ChartFormProps) => {
  const xAxisValue = values.xAxis || ''
  const yAxisValue = values.yAxis || (type === 'chart.bubble' ? '' : [])
  const zAxisValue = values.zAxis || []
  const coloredAxis = type === 'chart.bubble' ? zAxisValue : yAxisValue

  const renderYAxisValue = (selected: any) =>
    selected.map((value: string) => (
      <Chip
        key={value}
        label={value}
        icon={<ColorIcon color={values.colors[value]} size="small" />}
      />
    ))

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="x-axis-select-label">{X_AXIS_LABEL[type]}</InputLabel>
        <Select
          labelId="x-axis-select-label"
          id="x-axis-select"
          value={xAxisValue}
          onChange={({ target: { value } }) =>
            onChange('xAxis', value as string)
          }
          input={<Input id="x-axis-select-input" />}
        >
          {columns &&
            columns.map((column: string) => (
              <MenuItem key={column} value={column}>
                {column}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="y-axis-select-label">{Y_AXIS_LABEL[type]}</InputLabel>
        <Select
          labelId="y-axis-select-label"
          id="y-axis-select"
          multiple={type !== 'chart.bubble'}
          value={yAxisValue}
          onChange={({ target: { value } }) => onChange('yAxis', value)}
          input={<Input id="y-axis-select-input" />}
          renderValue={(selected: any) =>
            Array.isArray(selected) ? renderYAxisValue(selected) : [selected]
          }
        >
          {columns &&
            columns.map((column: string) => (
              <MenuItem key={column} value={column}>
                {column}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      {type === 'chart.bubble' && (
        <FormControl fullWidth>
          <InputLabel id="z-axis-select-label">Z-Axis</InputLabel>
          <Select
            labelId="z-axis-select-label"
            id="z-axis-select"
            multiple
            value={zAxisValue}
            onChange={({ target: { value } }) =>
              onChange('zAxis', value as string[])
            }
            input={<Input id="z-axis-select-input" />}
            renderValue={(selected) =>
              (selected as string[]).map((value) => (
                <Chip
                  key={value}
                  label={value}
                  icon={<ColorIcon color={values.colors[value]} size="small" />}
                />
              ))
            }
          >
            {columns &&
              columns.map((column: string) => (
                <MenuItem key={column} value={column}>
                  {column}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}
      {type === 'chart.line' && (
        <FormControl fullWidth>
          <FormControlLabel
            control={
              <Checkbox
                checked={values.asArea || false}
                color="primary"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  onChange('asArea', event.target.checked)
                }
              />
            }
            label="Show area under the curve"
          />
        </FormControl>
      )}
      <Box mt={3}>
        <Typography variant="caption">Colors:</Typography>
        <Grid container spacing={3}>
          {coloredAxis &&
            coloredAxis.map((column: string) => (
              <ColorPicker
                key={column}
                column={column}
                color={values.colors[column]}
                onChange={(color) =>
                  onChange('colors', { ...values.colors, [column]: color })
                }
              />
            ))}
        </Grid>
      </Box>
    </>
  )
}

const areVisualSettingsValid = (settings: any, type: string) => {
  if (type === 'documents' || type === 'columns') {
    return true
  }

  if (type === 'chart.line' || type === 'chart.bar' || type === 'chart.pie') {
    const typeSettings = settings[type]
    if (!typeSettings) {
      return false
    }

    if (!typeSettings.xAxis) {
      return false
    }

    if (!typeSettings.yAxis) {
      return false
    }
  }

  return true
}

type Props = {
  open: boolean
  onClose: () => void
  settings: any
  type: string
  onSubmit: (settings: any) => void
}

export default React.memo(
  ({ open, onClose, settings: initialSettings, type, onSubmit }: Props) => {
    const [settings, setSettings] = React.useState()
    React.useEffect(() => {
      setSettings(initialSettings)
    }, [initialSettings])

    const updateSettings = (field: string, value: any) => {
      const updatedSettings: any = {
        ...settings[type],
        colors: { ...(settings[type] ? settings[type].colors : undefined) },
      }

      updatedSettings[field] = value

      if (field === 'yAxis') {
        const colors = updatedSettings.colors
        for (const yAxis of value) {
          if (!colors[yAxis]) {
            colors[yAxis] = '#22194d'
          }
        }

        for (const coloredColumn of Object.keys(colors)) {
          if (value.indexOf(coloredColumn) === -1) {
            delete colors[coloredColumn]
          }
        }
      }

      setSettings({
        ...settings,
        [type]: updatedSettings,
      })
    }

    if (!settings) {
      return null
    }

    const isValid = areVisualSettingsValid(settings, type)
    const values = settings[type] || {}
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          Configure {TYPE_NAMES[type]} view for the question
        </DialogTitle>
        <DialogContent>
          {(type === 'documents' || type === 'columns') && (
            <DialogContentText>
              Results will be shown as a list of rows
            </DialogContentText>
          )}
          {type.startsWith('chart.') && (
            <ChartForm
              values={values}
              columns={settings.columns}
              onChange={updateSettings}
              type={type}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              if (onClose) {
                onClose()
              }
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={!isValid}
            onClick={() => onSubmit(settings)}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
)
