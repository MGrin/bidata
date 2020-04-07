import * as React from 'react'
import { Grid, Button, Popover } from '@material-ui/core'
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked'
import { BlockPicker } from 'react-color'

export const ColorIcon = ({
  color,
  size,
}: {
  color: string
  size?: 'small'
}) => {
  const iconStyle = color ? { fill: color, marginLeft: 6 } : undefined
  return <RadioButtonCheckedIcon style={iconStyle} fontSize={size} />
}

type ColorPickerProps = {
  column: string
  color: string
  onChange: (color: string) => void
}

export default ({ column, color, onChange }: ColorPickerProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const buttonStyle = color ? { borderColor: color, color } : undefined

  return (
    <Grid item className="clickable">
      <Button
        style={buttonStyle}
        startIcon={<ColorIcon color={color} />}
        variant="outlined"
        color="default"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {column}
      </Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <BlockPicker
          color={color}
          onChangeComplete={({ hex }) => {
            onChange(hex)
            setAnchorEl(null)
          }}
        />
      </Popover>
    </Grid>
  )
}
