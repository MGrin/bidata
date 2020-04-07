import * as React from 'react'
import { Typography, TypographyProps } from '@material-ui/core'
import {
  parseISO,
  isValid as isValidDate,
  format as formatDate,
} from 'date-fns'
import ReactJson from 'react-json-view'

type ValueProps = {
  children: any
  collapsed?: boolean | 1 | 2
  named?: boolean
} & TypographyProps

export default ({ children, collapsed, named, ...props }: ValueProps) => {
  let value = children

  if (value === undefined || value === null) {
    return (
      <Typography variant="overline" {...props}>
        null
      </Typography>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <Typography variant="body2" {...props}>
        {value ? 'Yes' : 'No'}
      </Typography>
    )
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return (
      <Typography variant="body2" {...props}>
        {value}
      </Typography>
    )
  }

  if (typeof value === 'string') {
    try {
      value = JSON.parse(children)
    } catch {}
  }

  if (typeof value === 'object') {
    return (
      <ReactJson
        src={value}
        name={named ? value.name || value._id : false}
        indentWidth={2}
        collapsed={collapsed === undefined ? true : collapsed}
        enableClipboard={false}
        displayDataTypes={false}
      />
    )
  }

  const date = parseISO(value)
  if (isValidDate(date)) {
    value = formatDate(date, 'yyyy-MM-dd HH:mm:ss')
  }

  return (
    <Typography
      variant="body2"
      style={{
        maxHeight: 98,
        overflowY: 'auto',
      }}
      {...props}
    >
      {value}
    </Typography>
  )
}
