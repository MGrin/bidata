import * as React from 'react'
import { Box } from '@material-ui/core'
import { AutoSizer } from 'react-virtualized'
import {
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  Scatter,
} from 'recharts'
import { ResultProps } from '.'

export default ({ data, settings }: ResultProps) => {
  const xKey = settings['chart.bubble'].xAxis
  const yKey = settings['chart.bubble'].yAxis
  const zKeys = settings['chart.bubble'].zAxis

  const colors = settings['chart.bubble'].colors

  const typedData = data.map((datum: any) => {
    const typedDatum = {
      [xKey]: datum[xKey],
      [yKey]: datum[yKey],
    }
    for (const zKey of zKeys) {
      typedDatum[zKey] = parseFloat(datum[zKey])
    }

    return typedDatum
  })

  console.log(typedData)
  return (
    <Box pr={3} width="calc(100% - 16)" height="calc(100% - 50px)">
      <AutoSizer>
        {({ width, height }) => (
          <ScatterChart width={width} height={height} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} name={xKey} />
            <YAxis dataKey={yKey} name={yKey} />
            <ZAxis dataKey="__Z VALUE CUSTON NAMED__" name="value" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {zKeys.map((zAxis: string) => (
              <Scatter
                key={zAxis}
                name={zAxis}
                dataKey={zAxis}
                fill={colors[zAxis]}
              />
            ))}
          </ScatterChart>
        )}
      </AutoSizer>
    </Box>
  )
}
