import * as React from 'react'
import { Box } from '@material-ui/core'
import { AutoSizer } from 'react-virtualized'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts'
import { ResultProps } from '.'

export default ({ data, settings }: ResultProps) => (
  <Box pr={3} width="calc(100% - 16)" height="calc(100% - 50px)">
    <AutoSizer>
      {({ width, height }) => (
        <BarChart width={width} height={height} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={settings['chart.bar'].xAxis} />
          <YAxis />
          <Tooltip />
          <Legend />
          {settings['chart.bar'].yAxis.map((yAxis: string) => (
            <Bar
              key={yAxis}
              dataKey={yAxis}
              fill={settings['chart.bar'].colors[yAxis]}
            />
          ))}
        </BarChart>
      )}
    </AutoSizer>
  </Box>
)
